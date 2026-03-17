const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: RequestMethod
  body?: unknown
  headers?: Record<string, string>
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ib_token')
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await res.json() as T

  if (!res.ok) {
    const err = data as { error?: string }
    throw new APIClientError(err.error ?? 'Request failed', res.status, data)
  }

  return data
}

export class APIClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data: unknown,
  ) {
    super(message)
    this.name = 'APIClientError'
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  register: (email: string, name: string, password: string) =>
    request<{ success: true; data: { token: string; user: { id: string; email: string; name: string; plan: string } } }>(
      '/api/auth/register', { method: 'POST', body: { email, name, password } }
    ),

  login: (email: string, password: string) =>
    request<{ success: true; data: { token: string; user: { id: string; email: string; name: string; plan: string } } }>(
      '/api/auth/login', { method: 'POST', body: { email, password } }
    ),

  logout: () => request('/api/auth/logout', { method: 'POST' }),
}

// ─── User ─────────────────────────────────────────────────────────────────────

export const user = {
  me: () => request<{ success: true; data: import('./types').User }>('/api/user/me'),
  stats: () => request<{ success: true; data: import('./types').UserStats }>('/api/user/stats'),
}

// ─── Essays ───────────────────────────────────────────────────────────────────

export const essays = {
  list: (page = 1) =>
    request<{ success: true; data: { essays: import('./types').Essay[]; total: number } }>(
      `/api/essays?page=${page}`
    ),

  get: (id: string) =>
    request<{ success: true; data: import('./types').Essay & { content: string } }>(`/api/essays/${id}`),

  create: (data: { title?: string; content: string; type: import('./types').EssayType; subject?: string; analyze?: boolean }) =>
    request<{ success: true; data: import('./types').Essay }>('/api/essays', { method: 'POST', body: data }),

  analyze: (id: string) =>
    request<{ success: true; data: { feedback: import('./types').AIEssayFeedback; analyzed_at: string } }>(
      `/api/essays/${id}/analyze`, { method: 'POST' }
    ),

  delete: (id: string) => request(`/api/essays/${id}`, { method: 'DELETE' }),
}

// ─── Questions ────────────────────────────────────────────────────────────────

export const questions = {
  help: (data: { question: string; subject?: string; level?: 'SL' | 'HL' }) =>
    request<{ success: true; data: import('./types').AIQuestionResponse }>(
      '/api/questions/help', { method: 'POST', body: data }
    ),

  history: () =>
    request<{ success: true; data: Array<{ id: string; question: string; subject: string | null; created_at: string }> }>(
      '/api/questions/history'
    ),
}

// ─── Flashcards ───────────────────────────────────────────────────────────────

export const flashcards = {
  decks: () =>
    request<{ success: true; data: import('./types').FlashcardDeck[] }>('/api/flashcards/decks'),

  deck: (id: string) =>
    request<{ success: true; data: { deck: import('./types').FlashcardDeck; cards: import('./types').Flashcard[] } }>(
      `/api/flashcards/decks/${id}/cards`
    ),

  generate: (topic: string, subject: string, card_count?: number) =>
    request<{ success: true; data: { deck_id: string; title: string; cards: Array<{ front: string; back: string }> } }>(
      '/api/flashcards/generate', { method: 'POST', body: { topic, subject, card_count } }
    ),

  review: (cardId: string, quality: number) =>
    request(`/api/flashcards/${cardId}/review`, { method: 'PATCH', body: { quality } }),

  due: () =>
    request<{ success: true; data: (import('./types').Flashcard & { deck_title: string; subject: string })[] }>(
      '/api/flashcards/due'
    ),

  deleteDeck: (id: string) => request(`/api/flashcards/decks/${id}`, { method: 'DELETE' }),
}

// ─── Practice ────────────────────────────────────────────────────────────────

export const practice = {
  start: (type: import('./types').PracticeType, subject: string, title?: string) =>
    request<{ success: true; data: { session_id: string; message: import('./types').ChatMessage } }>(
      '/api/practice/start', { method: 'POST', body: { type, subject, title } }
    ),

  message: (session_id: string, content: string) =>
    request<{ success: true; data: { message: import('./types').ChatMessage } }>(
      '/api/practice/message', { method: 'POST', body: { session_id, content } }
    ),

  end: (id: string) =>
    request<{ success: true; data: { feedback: import('./types').AISessionFeedback; score: number } }>(
      `/api/practice/${id}/end`, { method: 'POST' }
    ),

  list: () =>
    request<{ success: true; data: import('./types').PracticeSession[] }>('/api/practice'),

  get: (id: string) =>
    request<{ success: true; data: import('./types').PracticeSession }>(`/api/practice/${id}`),
}

// ─── IA Planner ───────────────────────────────────────────────────────────────

export const ia = {
  generate: (subject: string, topic: string) =>
    request<{ success: true; data: { id: string; plan: import('./types').AIIAPlan } }>(
      '/api/ia/plan', { method: 'POST', body: { subject, topic } }
    ),

  list: () =>
    request<{ success: true; data: import('./types').IAPlan[] }>('/api/ia/plans'),

  get: (id: string) =>
    request<{ success: true; data: import('./types').IAPlan }>(`/api/ia/plans/${id}`),

  delete: (id: string) => request(`/api/ia/plans/${id}`, { method: 'DELETE' }),
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export const quiz = {
  generate: (subject: string, topic: string, question_count?: number) =>
    request<{ success: true; data: { quiz_id: string; questions: import('./types').QuizQuestion[] } }>(
      '/api/quiz/generate', { method: 'POST', body: { subject, topic, question_count } }
    ),

  submit: (id: string, answers: number[]) =>
    request<{ success: true; data: { score: number; total: number; percentage: number; results: Array<{ correct: boolean; correct_index: number; explanation: string }> } }>(
      `/api/quiz/${id}/submit`, { method: 'POST', body: { answers } }
    ),

  summarize: (text: string, subject: string) =>
    request<{ success: true; data: { summary: string; key_points: string[]; exam_tips: string[] } }>(
      '/api/quiz/summarize', { method: 'POST', body: { text, subject } }
    ),

  history: () =>
    request<{ success: true; data: Array<{ id: string; subject: string; topic: string; score: number; total: number; created_at: string }> }>(
      '/api/quiz/history'
    ),
}
