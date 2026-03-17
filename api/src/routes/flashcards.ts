import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth, checkAndIncrementUsage, nanoid, type AuthEnv } from '../middleware/auth'
import { generateFlashcards } from '../ai/client'
import type { FlashcardDeck, Flashcard } from '../types'

export const flashcardRoutes = new Hono<AuthEnv>()

flashcardRoutes.use('*', requireAuth)

// ─── Decks ────────────────────────────────────────────────────────────────────

// GET /api/flashcards/decks
flashcardRoutes.get('/decks', async (c) => {
  const user = c.get('user')
  const decks = await c.env.DB.prepare(
    `SELECT fd.*, COUNT(f.id) as card_count
     FROM flashcard_decks fd
     LEFT JOIN flashcards f ON f.deck_id = fd.id
     WHERE fd.user_id = ?
     GROUP BY fd.id
     ORDER BY fd.updated_at DESC`
  ).bind(user.sub).all<FlashcardDeck>()

  return c.json({ success: true, data: decks.results })
})

// GET /api/flashcards/decks/:id/cards
flashcardRoutes.get('/decks/:id/cards', async (c) => {
  const user = c.get('user')
  const { id } = c.req.param()

  const deck = await c.env.DB.prepare(
    'SELECT * FROM flashcard_decks WHERE id = ? AND user_id = ?'
  ).bind(id, user.sub).first<FlashcardDeck>()

  if (!deck) return c.json({ success: false, error: 'Deck not found' }, 404)

  const cards = await c.env.DB.prepare(
    'SELECT * FROM flashcards WHERE deck_id = ? ORDER BY next_review_at ASC'
  ).bind(id).all<Flashcard>()

  return c.json({ success: true, data: { deck, cards: cards.results } })
})

// DELETE /api/flashcards/decks/:id
flashcardRoutes.delete('/decks/:id', async (c) => {
  const user = c.get('user')
  const { id } = c.req.param()

  const result = await c.env.DB.prepare(
    'DELETE FROM flashcard_decks WHERE id = ? AND user_id = ?'
  ).bind(id, user.sub).run()

  if (result.meta.changes === 0) return c.json({ success: false, error: 'Deck not found' }, 404)
  return c.json({ success: true, data: { deleted: id } })
})

// ─── Generate flashcards with AI ─────────────────────────────────────────────

const generateSchema = z.object({
  topic: z.string().min(2).max(200),
  subject: z.string().min(1).max(100),
  card_count: z.number().min(5).max(30).optional().default(15),
})

// POST /api/flashcards/generate
flashcardRoutes.post('/generate', zValidator('json', generateSchema), async (c) => {
  const user = c.get('user')
  const { topic, subject, card_count } = c.req.valid('json')

  const limit = parseInt(c.env.FREE_PLAN_DAILY_LIMIT)
  const { allowed, remaining } = await checkAndIncrementUsage(
    c.env.DB, user.sub, limit, user.plan,
  )
  if (!allowed) {
    return c.json({ success: false, error: 'Daily query limit reached', code: 'RATE_LIMIT' }, 429)
  }

  const generated = await generateFlashcards(c.env.AI, topic, subject, card_count)

  // Persist deck and cards
  const deckId = nanoid()
  await c.env.DB.prepare(
    `INSERT INTO flashcard_decks (id, user_id, title, subject, card_count)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(deckId, user.sub, generated.title, generated.subject, generated.cards.length).run()

  const now = new Date().toISOString()
  const cardInserts = generated.cards.map(card => {
    const cardId = nanoid()
    return c.env.DB.prepare(
      `INSERT INTO flashcards (id, deck_id, front, back, next_review_at)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(cardId, deckId, card.front, card.back, now)
  })

  await c.env.DB.batch(cardInserts)

  c.header('X-Queries-Remaining', String(remaining))
  return c.json({
    success: true,
    data: {
      deck_id: deckId,
      title: generated.title,
      subject: generated.subject,
      cards: generated.cards,
    },
  }, 201)
})

// ─── Spaced Repetition Review ─────────────────────────────────────────────────

const reviewSchema = z.object({
  quality: z.number().min(0).max(5), // SM-2: 0=blackout, 5=perfect
})

// PATCH /api/flashcards/:cardId/review
flashcardRoutes.patch('/:cardId/review', zValidator('json', reviewSchema), async (c) => {
  const user = c.get('user')
  const { cardId } = c.req.param()
  const { quality } = c.req.valid('json')

  const card = await c.env.DB.prepare(
    `SELECT f.* FROM flashcards f
     JOIN flashcard_decks d ON f.deck_id = d.id
     WHERE f.id = ? AND d.user_id = ?`
  ).bind(cardId, user.sub).first<Flashcard>()

  if (!card) return c.json({ success: false, error: 'Card not found' }, 404)

  // SM-2 algorithm
  const { repetitions, ease_factor, interval_days } = card
  let newRepetitions = repetitions
  let newEase = ease_factor
  let newInterval = interval_days

  if (quality >= 3) {
    newRepetitions += 1
    if (repetitions === 0) newInterval = 1
    else if (repetitions === 1) newInterval = 6
    else newInterval = Math.round(interval_days * ease_factor)
    newEase = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (newEase < 1.3) newEase = 1.3
  } else {
    newRepetitions = 0
    newInterval = 1
  }

  const nextReview = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000).toISOString()

  await c.env.DB.prepare(
    `UPDATE flashcards
     SET repetitions = ?, ease_factor = ?, interval_days = ?, next_review_at = ?
     WHERE id = ?`
  ).bind(newRepetitions, newEase, newInterval, nextReview, cardId).run()

  return c.json({
    success: true,
    data: { next_review_at: nextReview, interval_days: newInterval },
  })
})

// GET /api/flashcards/due — get cards due for review today
flashcardRoutes.get('/due', async (c) => {
  const user = c.get('user')
  const now = new Date().toISOString()

  const cards = await c.env.DB.prepare(
    `SELECT f.*, d.title as deck_title, d.subject
     FROM flashcards f
     JOIN flashcard_decks d ON f.deck_id = d.id
     WHERE d.user_id = ? AND f.next_review_at <= ?
     ORDER BY f.next_review_at ASC
     LIMIT 50`
  ).bind(user.sub, now).all()

  return c.json({ success: true, data: cards.results })
})
