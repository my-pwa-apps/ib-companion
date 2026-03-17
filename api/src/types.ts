// Cloudflare Worker bindings
export interface Env {
  DB: D1Database;
  AI: Ai;
  KV: KVNamespace;
  JWT_SECRET: string;
  ENVIRONMENT: string;
  FREE_PLAN_DAILY_LIMIT: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface JWTPayload {
  sub: string;   // user id
  email: string;
  plan: 'free' | 'pro';
  iat: number;
  exp: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro';
  pro_expires_at: string | null;
  queries_today: number;
  queries_reset_at: string;
  created_at: string;
}

// ─── Essays ───────────────────────────────────────────────────────────────────

export type EssayType = 'tok' | 'ee' | 'ia' | 'io' | 'other';

export interface Essay {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: EssayType;
  subject: string | null;
  feedback: AIEssayFeedback | null;
  analyzed_at: string | null;
  created_at: string;
}

export interface AIEssayCriterion {
  name: string;
  description: string;
  score: number;
  max_score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface AIEssayFeedback {
  overall_score: number;
  grade_estimate: string;       // e.g. "6/7" or "B"
  summary: string;
  criteria: AIEssayCriterion[];
  strengths: string[];
  weaknesses: string[];
  improvement_suggestions: string[];
  next_steps: string[];
}

// ─── Questions ────────────────────────────────────────────────────────────────

export interface AIQuestionResponse {
  explanation: string;
  key_concepts: string[];
  answer_outline: {
    introduction: string;
    main_points: { point: string; detail: string }[];
    conclusion: string;
  };
  command_term_analysis: string;
  marks_breakdown: string;
  example_answer_snippet: string;
  common_mistakes: string[];
  related_topics: string[];
}

// ─── Flashcards ───────────────────────────────────────────────────────────────

export interface FlashcardDeck {
  id: string;
  user_id: string;
  title: string;
  subject: string | null;
  description: string | null;
  card_count: number;
  created_at: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  repetitions: number;
  ease_factor: number;
  interval_days: number;
  next_review_at: string;
}

export interface AIFlashcardSet {
  title: string;
  subject: string;
  cards: { front: string; back: string }[];
}

// ─── Practice Sessions ───────────────────────────────────────────────────────

export type PracticeType = 'oral' | 'exam' | 'presentation';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  type: PracticeType;
  subject: string | null;
  title: string | null;
  messages: ChatMessage[];
  score: number | null;
  feedback: AISessionFeedback | null;
  status: 'active' | 'completed';
  created_at: string;
}

export interface AISessionFeedback {
  overall_score: number;
  fluency_score: number;
  content_score: number;
  structure_score: number;
  language_score: number;
  strengths: string[];
  areas_to_improve: string[];
  detailed_feedback: string;
  pronunciation_notes: string;
  vocabulary_suggestions: string[];
}

// ─── IA Planner ───────────────────────────────────────────────────────────────

export interface AIIAPlan {
  research_questions: {
    question: string;
    rationale: string;
    feasibility: 'high' | 'medium' | 'low';
  }[];
  methodology_options: {
    method: string;
    description: string;
    advantages: string[];
    limitations: string[];
  }[];
  data_collection: {
    method: string;
    description: string;
    sample_size_suggestion: string;
    ethical_considerations: string[];
  }[];
  timeline_suggestion: {
    phase: string;
    duration: string;
    tasks: string[];
  }[];
  ib_alignment_notes: string;
  subject_specific_tips: string[];
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  topic: string;
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface APISuccess<T = unknown> {
  success: true;
  data: T;
}

export interface APIError {
  success: false;
  error: string;
  code?: string;
}

export type APIResponse<T = unknown> = APISuccess<T> | APIError;
