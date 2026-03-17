import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth, checkAndIncrementUsage, nanoid, type AuthEnv } from '../middleware/auth'
import { getOralPrompt, evaluateOralSession } from '../ai/client'
import type { PracticeSession, ChatMessage } from '../types'

export const practiceRoutes = new Hono<AuthEnv>()

practiceRoutes.use('*', requireAuth)

const startSchema = z.object({
  type: z.enum(['oral', 'exam', 'presentation']),
  subject: z.string().min(1).max(100),
  title: z.string().max(200).optional(),
})

// POST /api/practice/start — start a new session
practiceRoutes.post('/start', zValidator('json', startSchema), async (c) => {
  const user = c.get('user')
  const { type, subject, title } = c.req.valid('json')

  const id = nanoid()
  const now = new Date().toISOString()

  // Opening AI message
  const opening = await getOralPrompt(
    c.env.AI,
    type,
    subject,
    'START_SESSION', // sentinel to trigger opening question
    [],
  )

  const initialMessage: ChatMessage = {
    role: 'assistant',
    content: opening,
    timestamp: now,
  }

  await c.env.DB.prepare(
    `INSERT INTO practice_sessions (id, user_id, type, subject, title, messages)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(id, user.sub, type, subject, title ?? null, JSON.stringify([initialMessage])).run()

  return c.json({ success: true, data: { session_id: id, message: initialMessage } }, 201)
})

const messageSchema = z.object({
  session_id: z.string(),
  content: z.string().min(1).max(5000),
})

// POST /api/practice/message — send a message in ongoing session
practiceRoutes.post('/message', zValidator('json', messageSchema), async (c) => {
  const user = c.get('user')
  const { session_id, content } = c.req.valid('json')

  const session = await c.env.DB.prepare(
    'SELECT * FROM practice_sessions WHERE id = ? AND user_id = ? AND status = ?'
  ).bind(session_id, user.sub, 'active').first<PracticeSession & { messages: string }>()

  if (!session) return c.json({ success: false, error: 'Session not found or already ended' }, 404)

  const limit = parseInt(c.env.FREE_PLAN_DAILY_LIMIT)
  const { allowed, remaining } = await checkAndIncrementUsage(
    c.env.DB, user.sub, limit, user.plan,
  )
  if (!allowed) {
    return c.json({ success: false, error: 'Daily query limit reached', code: 'RATE_LIMIT' }, 429)
  }

  const messages: ChatMessage[] = JSON.parse(session.messages as unknown as string)
  const now = new Date().toISOString()

  const userMessage: ChatMessage = { role: 'user', content, timestamp: now }
  const historyForAI = messages.map(m => ({ role: m.role, content: m.content }))

  const aiResponse = await getOralPrompt(
    c.env.AI,
    session.type,
    session.subject ?? 'General',
    content,
    historyForAI,
  )

  const assistantMessage: ChatMessage = {
    role: 'assistant',
    content: aiResponse,
    timestamp: new Date().toISOString(),
  }

  const updatedMessages = [...messages, userMessage, assistantMessage]

  await c.env.DB.prepare(
    'UPDATE practice_sessions SET messages = ?, updated_at = ? WHERE id = ?'
  ).bind(JSON.stringify(updatedMessages), new Date().toISOString(), session_id).run()

  c.header('X-Queries-Remaining', String(remaining))
  return c.json({ success: true, data: { message: assistantMessage } })
})

// POST /api/practice/:id/end — end session and generate feedback
practiceRoutes.post('/:id/end', async (c) => {
  const user = c.get('user')
  const { id } = c.req.param()

  const session = await c.env.DB.prepare(
    'SELECT * FROM practice_sessions WHERE id = ? AND user_id = ?'
  ).bind(id, user.sub).first<{ messages: string; type: string; subject: string | null; status: string }>()

  if (!session) return c.json({ success: false, error: 'Session not found' }, 404)
  if (session.status === 'completed') return c.json({ success: false, error: 'Session already ended' }, 400)

  const messages: ChatMessage[] = JSON.parse(session.messages)
  const transcript = messages
    .map(m => `${m.role === 'user' ? 'Student' : 'Examiner'}: ${m.content}`)
    .join('\n\n')

  const feedback = await evaluateOralSession(
    c.env.AI, session.type, session.subject ?? 'General', transcript,
  )

  await c.env.DB.prepare(
    `UPDATE practice_sessions
     SET status = 'completed', score = ?, feedback = ?, updated_at = ?
     WHERE id = ?`
  ).bind(feedback.overall_score, JSON.stringify(feedback), new Date().toISOString(), id).run()

  return c.json({ success: true, data: { feedback, score: feedback.overall_score } })
})

// GET /api/practice — list sessions
practiceRoutes.get('/', async (c) => {
  const user = c.get('user')
  const sessions = await c.env.DB.prepare(
    `SELECT id, type, subject, title, score, status, created_at
     FROM practice_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`
  ).bind(user.sub).all()

  return c.json({ success: true, data: sessions.results })
})

// GET /api/practice/:id
practiceRoutes.get('/:id', async (c) => {
  const user = c.get('user')
  const { id } = c.req.param()

  const session = await c.env.DB.prepare(
    'SELECT * FROM practice_sessions WHERE id = ? AND user_id = ?'
  ).bind(id, user.sub).first<{ messages: string; feedback: string | null } & Record<string, unknown>>()

  if (!session) return c.json({ success: false, error: 'Session not found' }, 404)

  return c.json({
    success: true,
    data: {
      ...session,
      messages: JSON.parse(session.messages),
      feedback: session.feedback ? JSON.parse(session.feedback) : null,
    },
  })
})
