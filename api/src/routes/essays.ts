import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth, checkAndIncrementUsage, nanoid, type AuthEnv } from '../middleware/auth'
import { analyzeEssay } from '../ai/client'
import type { Essay, AIEssayFeedback } from '../types'

export const essayRoutes = new Hono<AuthEnv>()

essayRoutes.use('*', requireAuth)

const createEssaySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(50).max(20_000),
  type: z.enum(['tok', 'ee', 'ia', 'io', 'other']),
  subject: z.string().max(100).optional(),
})

const analyzeSchema = createEssaySchema.extend({
  analyze: z.boolean().optional().default(true),
})

// GET /api/essays — list user's essays
essayRoutes.get('/', async (c) => {
  const user = c.get('user')
  const page = parseInt(c.req.query('page') ?? '1')
  const limit = Math.min(parseInt(c.req.query('limit') ?? '20'), 50)
  const offset = (page - 1) * limit

  const essays = await c.env.DB.prepare(
    `SELECT id, title, type, subject, analyzed_at, created_at, word_count
     FROM essays WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).bind(user.sub, limit, offset).all<Partial<Essay>>()

  const total = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM essays WHERE user_id = ?'
  ).bind(user.sub).first<{ count: number }>()

  return c.json({
    success: true,
    data: {
      essays: essays.results,
      total: total?.count ?? 0,
      page,
      limit,
    },
  })
})

// GET /api/essays/:id — get single essay with feedback
essayRoutes.get('/:id', async (c) => {
  const user = c.get('user')
  const { id } = c.req.param()

  const essay = await c.env.DB.prepare(
    'SELECT * FROM essays WHERE id = ? AND user_id = ?'
  ).bind(id, user.sub).first<Essay & { feedback: string | null }>()

  if (!essay) {
    return c.json({ success: false, error: 'Essay not found' }, 404)
  }

  return c.json({
    success: true,
    data: {
      ...essay,
      feedback: essay.feedback ? JSON.parse(essay.feedback) as AIEssayFeedback : null,
    },
  })
})

// POST /api/essays — create and optionally analyze
essayRoutes.post('/', zValidator('json', analyzeSchema), async (c) => {
  const user = c.get('user')
  const { title, content, type, subject, analyze } = c.req.valid('json')

  const id = nanoid()
  const now = new Date().toISOString()

  let feedback: AIEssayFeedback | null = null
  let analyzedAt: string | null = null

  if (analyze) {
    const limit = parseInt(c.env.FREE_PLAN_DAILY_LIMIT)
    const { allowed, remaining } = await checkAndIncrementUsage(
      c.env.DB, user.sub, limit, user.plan,
    )

    if (!allowed) {
      return c.json({
        success: false,
        error: `Daily query limit reached (${limit}/day on free plan). Upgrade to Pro for unlimited access.`,
        code: 'RATE_LIMIT',
      }, 429)
    }

    try {
      feedback = await analyzeEssay(c.env.AI, content, type, subject)
      analyzedAt = now
      // Return remaining queries in header
      c.header('X-Queries-Remaining', String(remaining))
    } catch (err) {
      console.error('Essay analysis failed:', err)
      // Still save the essay, just without feedback
    }
  }

  const feedbackStr = feedback ? JSON.stringify(feedback) : null
  await c.env.DB.prepare(
    `INSERT INTO essays (id, user_id, title, content, type, subject, feedback, analyzed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, user.sub, title ?? 'Untitled', content, type,
    subject ?? null, feedbackStr, analyzedAt,
  ).run()

  return c.json({
    success: true,
    data: { id, title: title ?? 'Untitled', type, subject, feedback, analyzed_at: analyzedAt },
  }, 201)
})

// POST /api/essays/:id/analyze — re-analyze existing essay
essayRoutes.post('/:id/analyze', async (c) => {
  const user = c.get('user')
  const { id } = c.req.param()

  const essay = await c.env.DB.prepare(
    'SELECT * FROM essays WHERE id = ? AND user_id = ?'
  ).bind(id, user.sub).first<Essay>()

  if (!essay) {
    return c.json({ success: false, error: 'Essay not found' }, 404)
  }

  const limit = parseInt(c.env.FREE_PLAN_DAILY_LIMIT)
  const { allowed, remaining } = await checkAndIncrementUsage(
    c.env.DB, user.sub, limit, user.plan,
  )
  if (!allowed) {
    return c.json({ success: false, error: 'Daily query limit reached', code: 'RATE_LIMIT' }, 429)
  }

  const feedback = await analyzeEssay(c.env.AI, essay.content, essay.type, essay.subject ?? undefined)
  const now = new Date().toISOString()

  await c.env.DB.prepare(
    'UPDATE essays SET feedback = ?, analyzed_at = ?, updated_at = ? WHERE id = ?'
  ).bind(JSON.stringify(feedback), now, now, id).run()

  c.header('X-Queries-Remaining', String(remaining))
  return c.json({ success: true, data: { feedback, analyzed_at: now } })
})

// DELETE /api/essays/:id
essayRoutes.delete('/:id', async (c) => {
  const user = c.get('user')
  const { id } = c.req.param()

  const result = await c.env.DB.prepare(
    'DELETE FROM essays WHERE id = ? AND user_id = ?'
  ).bind(id, user.sub).run()

  if (result.meta.changes === 0) {
    return c.json({ success: false, error: 'Essay not found' }, 404)
  }
  return c.json({ success: true, data: { deleted: id } })
})
