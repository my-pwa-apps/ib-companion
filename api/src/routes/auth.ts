import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { createToken, hashPassword, verifyPassword, nanoid, sha256 } from '../middleware/auth'
import type { Env } from '../types'

export const authRoutes = new Hono<{ Bindings: Env }>()

const registerSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100),
  password: z.string().min(8).max(128),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// POST /api/auth/register
authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, name, password } = c.req.valid('json')

  const existing = await c.env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first()

  if (existing) {
    return c.json({ success: false, error: 'Email already registered' }, 409)
  }

  const id = nanoid()
  const passwordHash = await hashPassword(password)

  await c.env.DB.prepare(
    `INSERT INTO users (id, email, name, password_hash)
     VALUES (?, ?, ?, ?)`
  ).bind(id, email.toLowerCase(), name, passwordHash).run()

  const token = await createToken(
    { sub: id, email: email.toLowerCase(), plan: 'free' },
    c.env.JWT_SECRET,
  )

  // Store session
  const sessionId = nanoid()
  const tokenHash = await sha256(token)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  await c.env.DB.prepare(
    'INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)'
  ).bind(sessionId, id, tokenHash, expiresAt).run()

  return c.json({
    success: true,
    data: {
      token,
      user: { id, email: email.toLowerCase(), name, plan: 'free' },
    },
  }, 201)
})

// POST /api/auth/login
authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')

  const user = await c.env.DB.prepare(
    'SELECT id, email, name, plan, password_hash FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first<{ id: string; email: string; name: string; plan: 'free' | 'pro'; password_hash: string }>()

  if (!user) {
    return c.json({ success: false, error: 'Invalid credentials' }, 401)
  }

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) {
    return c.json({ success: false, error: 'Invalid credentials' }, 401)
  }

  const token = await createToken(
    { sub: user.id, email: user.email, plan: user.plan },
    c.env.JWT_SECRET,
  )

  const sessionId = nanoid()
  const tokenHash = await sha256(token)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  await c.env.DB.prepare(
    'INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)'
  ).bind(sessionId, user.id, tokenHash, expiresAt).run()

  const { password_hash: _, ...safeUser } = user
  return c.json({ success: true, data: { token, user: safeUser } })
})

// POST /api/auth/logout
authRoutes.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const tokenHash = await sha256(token)
    await c.env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run()
  }
  return c.json({ success: true, data: { message: 'Logged out' } })
})
