// Shared types mirroring the API layer

export type Plan = 'free' | 'pro'
export type EssayType = 'tok' | 'ee' | 'ia' | 'io' | 'other'
export type PracticeType = 'oral' | 'exam' | 'presentation'

export interface User {
  id: string
  email: string
  name: string
  plan: Plan
  pro_expires_at: string | null
  queries_today: number
  queries_reset_at: string
  daily_limit: number | null
  queries_remaining: number | null
  created_at: string
}

export interface UserStats {
  essays_analyzed: number
  flashcard_decks: number
  practice_sessions: number
  quiz_avg_score: number | null
  ia_plans: number
}

export interface Essay {
  id: string
  title: string
  type: EssayType
  subject: string | null
  feedback: AIEssayFeedback | null
  analyzed_at: string | null
  created_at: string
  word_count?: number
}

export interface AIEssayCriterion {
  name: string
  description: string
  score: number
  max_score: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
}

export interface AIEssayFeedback {
  overall_score: number
  grade_estimate: string
  summary: string
  criteria: AIEssayCriterion[]
  strengths: string[]
  weaknesses: string[]
  improvement_suggestions: string[]
  next_steps: string[]
}

export interface AIQuestionResponse {
  explanation: string
  key_concepts: string[]
  command_term_analysis: string
  marks_breakdown: string
  answer_outline: {
    introduction: string
    main_points: { point: string; detail: string }[]
    conclusion: string
  }
  example_answer_snippet: string
  common_mistakes: string[]
  related_topics: string[]
}

export interface FlashcardDeck {
  id: string
  title: string
  subject: string | null
  description: string | null
  card_count: number
  created_at: string
}

export interface Flashcard {
  id: string
  deck_id: string
  front: string
  back: string
  repetitions: number
  ease_factor: number
  interval_days: number
  next_review_at: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface PracticeSession {
  id: string
  type: PracticeType
  subject: string | null
  title: string | null
  messages: ChatMessage[]
  score: number | null
  feedback: AISessionFeedback | null
  status: 'active' | 'completed'
  created_at: string
}

export interface AISessionFeedback {
  overall_score: number
  fluency_score: number
  content_score: number
  structure_score: number
  language_score: number
  strengths: string[]
  areas_to_improve: string[]
  detailed_feedback: string
  pronunciation_notes: string
  vocabulary_suggestions: string[]
}

export interface AIIAPlan {
  research_questions: { question: string; rationale: string; feasibility: 'high' | 'medium' | 'low' }[]
  methodology_options: { method: string; description: string; advantages: string[]; limitations: string[] }[]
  data_collection: { method: string; description: string; sample_size_suggestion: string; ethical_considerations: string[] }[]
  timeline_suggestion: { phase: string; duration: string; tasks: string[] }[]
  ib_alignment_notes: string
  subject_specific_tips: string[]
}

export interface IAPlan {
  id: string
  subject: string
  topic: string
  research_question: string | null
  status: 'draft' | 'active' | 'submitted'
  plan_data: AIIAPlan
  created_at: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  topic: string
}

export interface APIError {
  success: false
  error: string
  code?: string
}
