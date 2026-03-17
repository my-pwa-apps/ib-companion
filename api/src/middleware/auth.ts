import type { Context, MiddlewareHandler } from 'hono'
import type { Env, JWTPayload } from '../types'

// ─── Crypto helpers (Web Crypto API — no Node.js deps) ───────────────────────

/** HMAC-SHA256 sign */
async function sign(payload: object, secret: string): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  const data = `${header}.${body}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  return `${data}.${sigB64}`
}

/** HMAC-SHA256 verify */
async function verify(token: string, secret: string): Promise<JWTPayload | null> {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, body, sig] = parts as [string, string, string]
  const data = `${header}.${body}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  )
  const sigBytes = Uint8Array.from(atob(sig.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
  const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(data))
  if (!valid) return null
  try {
    const payload = JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/'))) as JWTPayload
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

/** SHA-256 hash of a string (hex) */
export async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

/** PBKDF2 password hash */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial, 256,
  )
  const hashHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('')
  return `${saltHex}:${hashHex}`
}

/** PBKDF2 password verify */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':') as [string, string]
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(h => parseInt(h, 16)))
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial, 256,
  )
  const candidate = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('')
  // Constant-time comparison
  if (candidate.length !== hashHex.length) return false
  let diff = 0
  for (let i = 0; i < candidate.length; i++) {
    diff |= candidate.charCodeAt(i) ^ hashHex.charCodeAt(i)
  }
  return diff === 0
}

// ─── Nanoid-style id generator ────────────────────────────────────────────────

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
export function nanoid(size = 21): string {
  const bytes = crypto.getRandomValues(new Uint8Array(size))
  return Array.from(bytes).map(b => ALPHABET[b % ALPHABET.length]!).join('')
}

// ─── JWT helpers ─────────────────────────────────────────────────────────────

export function createToken(payload: Omit<JWTPayload, 'iat' | 'exp'>, secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  return sign({ ...payload, iat: now, exp: now + 60 * 60 * 24 * 7 }, secret) // 7 days
}

export async function verifyToken(token: string, secret: string): Promise<JWTPayload | null> {
  return verify(token, secret)
}

// ─── Auth Middleware ──────────────────────────────────────────────────────────

export type AuthEnv = {
  Bindings: Env
  Variables: { user: JWTPayload }
}

export const requireAuth: MiddlewareHandler<AuthEnv> = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized', code: 'NO_TOKEN' }, 401)
  }
  const token = authHeader.slice(7)
  const payload = await verifyToken(token, c.env.JWT_SECRET)
  if (!payload) {
    return c.json({ success: false, error: 'Invalid or expired token', code: 'INVALID_TOKEN' }, 401)
  }
  c.set('user', payload)
  await next()
}

// ─── Rate limit helper ────────────────────────────────────────────────────────

export async function checkAndIncrementUsage(
  db: D1Database,
  userId: string,
  freeLimit: number,
  plan: 'free' | 'pro',
): Promise<{ allowed: boolean; remaining: number }> {
  if (plan === 'pro') return { allowed: true, remaining: Infinity }

  const user = await db.prepare(
    'SELECT queries_today, queries_reset_at FROM users WHERE id = ?'
  ).bind(userId).first<{ queries_today: number; queries_reset_at: string }>()

  if (!user) return { allowed: false, remaining: 0 }

  const resetAt = new Date(user.queries_reset_at)
  const now = new Date()
  const needsReset = now.getUTCDate() !== resetAt.getUTCDate()
    || now.getUTCMonth() !== resetAt.getUTCMonth()

  if (needsReset) {
    await db.prepare(
      'UPDATE users SET queries_today = 1, queries_reset_at = ? WHERE id = ?'
    ).bind(new Date().toISOString(), userId).run()
    return { allowed: true, remaining: freeLimit - 1 }
  }

  if (user.queries_today >= freeLimit) {
    return { allowed: false, remaining: 0 }
  }

  await db.prepare(
    'UPDATE users SET queries_today = queries_today + 1 WHERE id = ?'
  ).bind(userId).run()

  return { allowed: true, remaining: freeLimit - user.queries_today - 1 }
}
