import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { prettyJSON } from 'hono/pretty-json'
import type { Env } from './types'

import { authRoutes } from './routes/auth'
import { essayRoutes } from './routes/essays'
import { questionRoutes } from './routes/questions'
import { flashcardRoutes } from './routes/flashcards'
import { practiceRoutes } from './routes/practice'
import { iaRoutes } from './routes/ia'
import { userRoutes } from './routes/user'
import { quizRoutes } from './routes/quiz'

const app = new Hono<{ Bindings: Env }>()

// ─── Global Middleware ────────────────────────────────────────────────────────

app.use('*', cors({
  origin: (origin) => {
    const allowed = [
      'http://localhost:3000',
      'https://ib-companion.pages.dev',
      'https://ibcompanion.app',
    ]
    return allowed.includes(origin) ? origin : allowed[0]!
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}))

app.use('*', secureHeaders())
app.use('*', logger())
app.use('*', prettyJSON())

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/', (c) => {
  return c.json({
    success: true,
    data: {
      name: 'IB Companion API',
      version: '0.1.0',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  })
})

// ─── Routes ───────────────────────────────────────────────────────────────────

app.route('/api/auth',       authRoutes)
app.route('/api/essays',     essayRoutes)
app.route('/api/questions',  questionRoutes)
app.route('/api/flashcards', flashcardRoutes)
app.route('/api/practice',   practiceRoutes)
app.route('/api/ia',         iaRoutes)
app.route('/api/user',       userRoutes)
app.route('/api/quiz',       quizRoutes)

// ─── 404 Fallback ─────────────────────────────────────────────────────────────

app.notFound((c) => c.json({ success: false, error: 'Not found' }, 404))

app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({ success: false, error: 'Internal server error' }, 500)
})

export default app
