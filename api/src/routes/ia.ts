import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth, checkAndIncrementUsage, nanoid, type AuthEnv } from '../middleware/auth'
import { generateIAPlan } from '../ai/client'
import type { AIIAPlan } from '../types'

export const iaRoutes = new Hono<AuthEnv>()

iaRoutes.use('*', requireAuth)

const planSchema = z.object({
  subject: z.string().min(1).max(100),
  topic: z.string().min(5).max(500),
})

// POST /api/ia/plan — generate a new IA plan
iaRoutes.post('/plan', zValidator('json', planSchema), async (c) => {
  const user = c.get('user')
  const { subject, topic } = c.req.valid('json')

  const limit = parseInt(c.env.FREE_PLAN_DAILY_LIMIT)
  const { allowed, remaining } = await checkAndIncrementUsage(
    c.env.DB, user.sub, limit, user.plan,
  )
  if (!allowed) {
    return c.json({ success: false, error: 'Daily query limit reached', code: 'RATE_LIMIT' }, 429)
  }

  const planData = await generateIAPlan(c.env.AI, subject, topic)

  const id = nanoid()
  const rq = planData.research_questions[0]?.question ?? null

  await c.env.DB.prepare(
    `INSERT INTO ia_plans (id, user_id, subject, topic, research_question, plan_data)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(id, user.sub, subject, topic, rq, JSON.stringify(planData)).run()

  c.header('X-Queries-Remaining', String(remaining))
  return c.json({ success: true, data: { id, subject, topic, plan: planData } }, 201)
})

// GET /api/ia/plans — list user's IA plans
iaRoutes.get('/plans', async (c) => {
  const user = c.get('user')
  const plans = await c.env.DB.prepare(
    `SELECT id, subject, topic, research_question, status, created_at
     FROM ia_plans WHERE user_id = ? ORDER BY created_at DESC`
  ).bind(user.sub).all()

  return c.json({ success: true, data: plans.results })
})

// GET /api/ia/plans/:id
iaRoutes.get('/plans/:id', async (c) => {
  const user = c.get('user')
  const { id } = c.req.param()

  const plan = await c.env.DB.prepare(
    'SELECT * FROM ia_plans WHERE id = ? AND user_id = ?'
  ).bind(id, user.sub).first<{ plan_data: string } & Record<string, unknown>>()

  if (!plan) return c.json({ success: false, error: 'Plan not found' }, 404)

  return c.json({
    success: true,
    data: { ...plan, plan_data: JSON.parse(plan.plan_data) as AIIAPlan },
  })
})

// PATCH /api/ia/plans/:id/status
iaRoutes.patch('/plans/:id/status', zValidator('json', z.object({
  status: z.enum(['draft', 'active', 'submitted']),
})), async (c) => {
  const user = c.get('user')
  const { id } = c.req.param()
  const { status } = c.req.valid('json')

  const result = await c.env.DB.prepare(
    'UPDATE ia_plans SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?'
  ).bind(status, new Date().toISOString(), id, user.sub).run()

  if (result.meta.changes === 0) return c.json({ success: false, error: 'Plan not found' }, 404)
  return c.json({ success: true, data: { id, status } })
})

// DELETE /api/ia/plans/:id
iaRoutes.delete('/plans/:id', async (c) => {
  const user = c.get('user')
  const { id } = c.req.param()

  const result = await c.env.DB.prepare(
    'DELETE FROM ia_plans WHERE id = ? AND user_id = ?'
  ).bind(id, user.sub).run()

  if (result.meta.changes === 0) return c.json({ success: false, error: 'Plan not found' }, 404)
  return c.json({ success: true, data: { deleted: id } })
})
