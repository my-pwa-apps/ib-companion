import { Hono } from 'hono'
import { requireAuth, type AuthEnv } from '../middleware/auth'
import type { User } from '../types'

export const userRoutes = new Hono<AuthEnv>()

userRoutes.use('*', requireAuth)

// GET /api/user/me
userRoutes.get('/me', async (c) => {
  const user = c.get('user')

  const dbUser = await c.env.DB.prepare(
    `SELECT id, email, name, plan, pro_expires_at, queries_today, queries_reset_at, created_at
     FROM users WHERE id = ?`
  ).bind(user.sub).first<User>()

  if (!dbUser) return c.json({ success: false, error: 'User not found' }, 404)

  const freeLimit = parseInt(c.env.FREE_PLAN_DAILY_LIMIT)

  return c.json({
    success: true,
    data: {
      ...dbUser,
      daily_limit: dbUser.plan === 'pro' ? null : freeLimit,
      queries_remaining: dbUser.plan === 'pro'
        ? null
        : Math.max(0, freeLimit - dbUser.queries_today),
    },
  })
})

// GET /api/user/stats
userRoutes.get('/stats', async (c) => {
  const user = c.get('user')

  const results = await c.env.DB.batch([
    c.env.DB.prepare('SELECT COUNT(*) as count FROM essays WHERE user_id = ?').bind(user.sub),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM flashcard_decks WHERE user_id = ?').bind(user.sub),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM practice_sessions WHERE user_id = ?').bind(user.sub),
    c.env.DB.prepare('SELECT COUNT(*) as count, AVG(CAST(score AS REAL) / total * 100) as avg_score FROM quiz_attempts WHERE user_id = ? AND score IS NOT NULL').bind(user.sub),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM ia_plans WHERE user_id = ?').bind(user.sub),
  ])

  const getCount = (idx: number) =>
    (results[idx]?.results[0] as { count: number } | undefined)?.count ?? 0
  const getAvg = (idx: number) =>
    (results[idx]?.results[0] as { avg_score: number | null } | undefined)?.avg_score ?? null

  return c.json({
    success: true,
    data: {
      essays_analyzed: getCount(0),
      flashcard_decks: getCount(1),
      practice_sessions: getCount(2),
      quiz_avg_score: getAvg(3),
      ia_plans: getCount(4),
    },
  })
})
