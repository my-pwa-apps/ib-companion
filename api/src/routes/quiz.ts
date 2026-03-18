import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth, checkAndIncrementUsage, nanoid, type AuthEnv } from '../middleware/auth'
import { generateQuiz, generateSummary } from '../ai/client'

export const quizRoutes = new Hono<AuthEnv>()

quizRoutes.use('*', requireAuth)

const generateSchema = z.object({
  subject: z.string().min(1).max(100),
  topic: z.string().min(2).max(200),
  question_count: z.number().min(3).max(20).optional().default(10),
})

// POST /api/quiz/generate
quizRoutes.post('/generate', zValidator('json', generateSchema), async (c) => {
  const user = c.get('user')
  const { subject, topic, question_count } = c.req.valid('json')

  const limit = parseInt(c.env.FREE_PLAN_DAILY_LIMIT)
  const { allowed, remaining } = await checkAndIncrementUsage(
    c.env.DB, user.sub, limit, user.plan,
  )
  if (!allowed) {
    return c.json({ success: false, error: 'Daily query limit reached', code: 'RATE_LIMIT' }, 429)
  }

  const questions = await generateQuiz(c.env.AI, subject, topic, question_count)

  const id = nanoid()
  await c.env.DB.prepare(
    `INSERT INTO quiz_attempts (id, user_id, subject, topic, questions)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(id, user.sub, subject, topic, JSON.stringify(questions)).run()

  c.header('X-Queries-Remaining', String(remaining))
  // Return questions without correct_index (to prevent cheating)
  const sanitized = questions.map(({ correct_index: _, explanation: __, ...q }) => q)
  return c.json({ success: true, data: { quiz_id: id, questions: sanitized } }, 201)
})

const submitSchema = z.object({
  answers: z.array(z.number()), // index of chosen answer per question
})

// POST /api/quiz/:id/submit
quizRoutes.post('/:id/submit', zValidator('json', submitSchema), async (c) => {
  const user = c.get('user')
  const { id } = c.req.param()
  const { answers } = c.req.valid('json')

  const attempt = await c.env.DB.prepare(
    'SELECT * FROM quiz_attempts WHERE id = ? AND user_id = ?'
  ).bind(id, user.sub).first<{ questions: string; answers: string | null }>()

  if (!attempt) return c.json({ success: false, error: 'Quiz not found' }, 404)

  const questions = JSON.parse(attempt.questions) as Array<{ correct_index: number; explanation: string }>

  if (answers.length !== questions.length) {
    return c.json({ success: false, error: `Expected ${questions.length} answers, got ${answers.length}` }, 400)
  }

  let score = 0
  const results = questions.map((q, i) => {
    const correct = q.correct_index === answers[i]
    if (correct) score++
    return { correct, correct_index: q.correct_index, explanation: q.explanation }
  })

  await c.env.DB.prepare(
    'UPDATE quiz_attempts SET answers = ?, score = ?, total = ? WHERE id = ?'
  ).bind(JSON.stringify(answers), score, questions.length, id).run()

  return c.json({
    success: true,
    data: {
      score,
      total: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      results,
    },
  })
})

// GET /api/quiz/history
quizRoutes.get('/history', async (c) => {
  const user = c.get('user')
  const history = await c.env.DB.prepare(
    `SELECT id, subject, topic, score, total, created_at
     FROM quiz_attempts WHERE user_id = ? AND score IS NOT NULL
     ORDER BY created_at DESC LIMIT 20`
  ).bind(user.sub).all()

  return c.json({ success: true, data: history.results })
})

// POST /api/quiz/summarize - generate a study summary
const summarySchema = z.object({
  text: z.string().min(100).max(10_000),
  subject: z.string().min(1).max(100),
})

quizRoutes.post('/summarize', zValidator('json', summarySchema), async (c) => {
  const user = c.get('user')
  const { text, subject } = c.req.valid('json')

  const limit = parseInt(c.env.FREE_PLAN_DAILY_LIMIT)
  const { allowed, remaining } = await checkAndIncrementUsage(
    c.env.DB, user.sub, limit, user.plan,
  )
  if (!allowed) {
    return c.json({ success: false, error: 'Daily query limit reached', code: 'RATE_LIMIT' }, 429)
  }

  const summary = await generateSummary(c.env.AI, text, subject)
  c.header('X-Queries-Remaining', String(remaining))
  return c.json({ success: true, data: summary })
})
