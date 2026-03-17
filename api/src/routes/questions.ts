import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth, checkAndIncrementUsage, nanoid, type AuthEnv } from '../middleware/auth'
import { helpWithQuestion } from '../ai/client'

export const questionRoutes = new Hono<AuthEnv>()

questionRoutes.use('*', requireAuth)

const questionSchema = z.object({
  question: z.string().min(10).max(2000),
  subject: z.string().max(100).optional(),
  level: z.enum(['SL', 'HL']).optional(),
  save: z.boolean().optional().default(true),
})

// POST /api/questions/help
questionRoutes.post('/help', zValidator('json', questionSchema), async (c) => {
  const user = c.get('user')
  const { question, subject, level, save } = c.req.valid('json')

  const limit = parseInt(c.env.FREE_PLAN_DAILY_LIMIT)
  const { allowed, remaining } = await checkAndIncrementUsage(
    c.env.DB, user.sub, limit, user.plan,
  )
  if (!allowed) {
    return c.json({ success: false, error: 'Daily query limit reached', code: 'RATE_LIMIT' }, 429)
  }

  const response = await helpWithQuestion(c.env.AI, question, subject, level)

  if (save) {
    const id = nanoid()
    await c.env.DB.prepare(
      'INSERT INTO question_help (id, user_id, question, subject, level, response) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, user.sub, question, subject ?? null, level ?? null, JSON.stringify(response)).run()
  }

  c.header('X-Queries-Remaining', String(remaining))
  return c.json({ success: true, data: response })
})

// GET /api/questions/history
questionRoutes.get('/history', async (c) => {
  const user = c.get('user')
  const limit = Math.min(parseInt(c.req.query('limit') ?? '20'), 50)

  const history = await c.env.DB.prepare(
    `SELECT id, question, subject, level, created_at
     FROM question_help WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`
  ).bind(user.sub, limit).all()

  return c.json({ success: true, data: history.results })
})

// GET /api/questions/:id
questionRoutes.get('/:id', async (c) => {
  const user = c.get('user')
  const { id } = c.req.param()

  const row = await c.env.DB.prepare(
    'SELECT * FROM question_help WHERE id = ? AND user_id = ?'
  ).bind(id, user.sub).first<{ response: string } & Record<string, unknown>>()

  if (!row) return c.json({ success: false, error: 'Not found' }, 404)

  return c.json({
    success: true,
    data: { ...row, response: JSON.parse(row.response) },
  })
})
