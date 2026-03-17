import type { Env, AIEssayFeedback, AIQuestionResponse, AIFlashcardSet, AISessionFeedback, AIIAPlan, QuizQuestion } from '../types'

// ─── Workers AI model constants ───────────────────────────────────────────────

export const MODELS = {
  TEXT:       '@cf/meta/llama-3-8b-instruct'        as const,
  TEXT_LARGE: '@cf/meta/llama-3.1-70b-instruct'     as const,
  EMBEDDINGS: '@cf/baai/bge-base-en-v1.5'           as const,
}

type TextModel = typeof MODELS.TEXT | typeof MODELS.TEXT_LARGE

// ─── Low-level AI call ────────────────────────────────────────────────────────

interface Message { role: 'system' | 'user' | 'assistant'; content: string }

async function chat(
  ai: Ai,
  messages: Message[],
  model: TextModel = MODELS.TEXT,
  maxTokens = 2048,
): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await (ai.run as (model: string, params: Record<string, unknown>) => Promise<unknown>)(model, {
    messages,
    max_tokens: maxTokens,
    temperature: 0.3,
  })

  if (typeof response === 'object' && response !== null && 'response' in response) {
    return (response as { response: string }).response ?? ''
  }
  return ''
}

/** Parse JSON from an LLM that may wrap it in markdown fences */
function parseJSON<T>(raw: string): T {
  const cleaned = raw
    .replace(/^```json\s*/m, '')
    .replace(/^```\s*/m, '')
    .replace(/```\s*$/m, '')
    .trim()
  return JSON.parse(cleaned) as T
}

// ─── Essay Analysis ───────────────────────────────────────────────────────────

const ESSAY_RUBRICS: Record<string, string> = {
  tok: `
TOK Essay Criteria (2022 syllabus, 30 marks total):
- Criterion A: Understanding of Knowledge Questions (0–10)
  Does the essay identify genuine, contestable knowledge questions? Are they explored with breadth and depth?
- Criterion B: Quality of Analysis of Knowledge Questions (0–10)
  Are arguments developed with clarity and rigour? Is there balanced consideration of multiple perspectives?
- Criterion C: Quality and Breadth of Examples and Case Studies (0–10)
  Are examples specific, real-world, and effectively integrated? Do they span multiple areas of knowledge?
Grade descriptors: 25–30 = A, 20–24 = B, 15–19 = C, 10–14 = D, 0–9 = E`,

  ee: `
Extended Essay Criteria (2018 syllabus, 34 marks total):
- Criterion A: Focus and Method (0–6)
  Clear, focused research question; justified methodology.
- Criterion B: Knowledge and Understanding (0–6)
  Subject-specific knowledge; understanding of context; relevant terminology.
- Criterion C: Critical Thinking (0–12)
  Quality of argument and analysis; evaluation of sources and data; conclusions.
- Criterion D: Presentation (0–4)
  Structure, layout, citations, bibliography.
- Criterion E: Engagement (0–6)
  Personal engagement; reflection throughout the research process.
Grade descriptors: 34 = A*, 30–33 = A, 25–29 = B, 17–24 = C, 9–16 = D, 0–8 = E`,

  ia: `
Internal Assessment (general criteria — adjust per subject):
- Research Design (0–6): Clear question, justified methodology, ethical considerations.
- Data Collection & Processing (0–6): Appropriate raw data, correct processing, error analysis.
- Conclusion & Evaluation (0–6): Conclusion linked to data, evaluation of strengths/weaknesses, realistic improvements.
- Personal Engagement (0–2): Authentic interest, initiative.
- Communication (0–4): Clear structure, correct notation, appropriate format.`,

  io: `
Individual Oral (Language A, 50 marks):
- Criterion A: Knowledge, Understanding & Interpretation (0–10)
- Criterion B: Analysis and Evaluation (0–10)
- Criterion C: Focus and Organisation (0–10)
- Criterion D: Language (0–10)
- Criterion E: Use of Text (0–10)`,

  other: `
General Academic Writing Criteria:
- Argument Quality (0–25): Clarity of thesis, logical structure, evidence.
- Knowledge Depth (0–25): Subject knowledge, accurate use of concepts.
- Critical Analysis (0–25): Evaluation, counter-arguments.
- Presentation (0–25): Language, formatting, citations.`,
}

export async function analyzeEssay(
  ai: Ai,
  essay: string,
  type: string,
  subject?: string,
): Promise<AIEssayFeedback> {
  const rubric = ESSAY_RUBRICS[type] ?? ESSAY_RUBRICS['other']!
  const subjectContext = subject ? `Subject: ${subject}\n` : ''

  const messages: Message[] = [
    {
      role: 'system',
      content: `You are an experienced IB examiner with 15+ years of marking experience. 
Provide honest, constructive, rubric-aligned feedback. Be specific — quote or reference the student's text.
Always respond with valid JSON only. No prose outside JSON.`,
    },
    {
      role: 'user',
      content: `Analyze this IB ${type.toUpperCase()} essay/commentary.
${subjectContext}
RUBRIC:
${rubric}

ESSAY:
${essay.slice(0, 6000)}

Respond with ONLY this JSON structure:
{
  "overall_score": <0-100>,
  "grade_estimate": "<grade or band>",
  "summary": "<2-3 sentence overview>",
  "criteria": [
    {
      "name": "<criterion name>",
      "description": "<what it measures>",
      "score": <earned>,
      "max_score": <maximum>,
      "strengths": ["<specific strength>"],
      "weaknesses": ["<specific weakness>"],
      "suggestions": ["<actionable improvement>"]
    }
  ],
  "strengths": ["<essay-level strength>"],
  "weaknesses": ["<essay-level weakness>"],
  "improvement_suggestions": ["<prioritized suggestion>"],
  "next_steps": ["<concrete next action>"]
}`,
    },
  ]

  const raw = await chat(ai, messages, MODELS.TEXT_LARGE, 3000)
  return parseJSON<AIEssayFeedback>(raw)
}

// ─── Question Helper ──────────────────────────────────────────────────────────

export async function helpWithQuestion(
  ai: Ai,
  question: string,
  subject?: string,
  level?: string,
): Promise<AIQuestionResponse> {
  const context = [subject && `Subject: ${subject}`, level && `Level: ${level}`].filter(Boolean).join('\n')

  const messages: Message[] = [
    {
      role: 'system',
      content: `You are an expert IB tutor. Help students understand questions and structure excellent answers.
Identify the IB command term (evaluate, compare, discuss, etc.) and explain what it demands.
Respond with valid JSON only.`,
    },
    {
      role: 'user',
      content: `Help me answer this IB exam question:
${context ? context + '\n' : ''}
QUESTION: ${question}

Respond with ONLY this JSON:
{
  "explanation": "<what the question is asking, broken down clearly>",
  "key_concepts": ["<concept>"],
  "command_term_analysis": "<what the command term demands — evaluate/discuss/explain etc.>",
  "marks_breakdown": "<suggested marks allocation per point>",
  "answer_outline": {
    "introduction": "<how to open the answer>",
    "main_points": [
      { "point": "<main argument/point>", "detail": "<how to develop it with evidence>" }
    ],
    "conclusion": "<how to conclude effectively>"
  },
  "example_answer_snippet": "<opening paragraph demonstrating technique>",
  "common_mistakes": ["<mistake to avoid>"],
  "related_topics": ["<related IB topic>"]
}`,
    },
  ]

  const raw = await chat(ai, messages, MODELS.TEXT_LARGE, 2500)
  return parseJSON<AIQuestionResponse>(raw)
}

// ─── Flashcard Generator ─────────────────────────────────────────────────────

export async function generateFlashcards(
  ai: Ai,
  topic: string,
  subject: string,
  cardCount = 15,
): Promise<AIFlashcardSet> {
  const messages: Message[] = [
    {
      role: 'system',
      content: `You are an IB study expert. Create concise, exam-focused flashcards.
Front: a clear question or term. Back: precise, complete answer.
Focus on facts, definitions, formulas, and key distinctions that appear in IB exams.
Respond with valid JSON only.`,
    },
    {
      role: 'user',
      content: `Create ${cardCount} IB flashcards for:
Subject: ${subject}
Topic: ${topic}

Respond with ONLY this JSON:
{
  "title": "<deck title>",
  "subject": "${subject}",
  "cards": [
    { "front": "<question or term>", "back": "<answer or definition>" }
  ]
}`,
    },
  ]

  const raw = await chat(ai, messages, MODELS.TEXT, 2000)
  return parseJSON<AIFlashcardSet>(raw)
}

// ─── Quiz Generator ───────────────────────────────────────────────────────────

export async function generateQuiz(
  ai: Ai,
  subject: string,
  topic: string,
  questionCount = 10,
): Promise<QuizQuestion[]> {
  const messages: Message[] = [
    {
      role: 'system',
      content: `You are an IB exam question writer. Create rigorous multiple-choice questions at SL/HL level.
Each question should have 4 options (A–D) with exactly one correct answer.
Respond with valid JSON only.`,
    },
    {
      role: 'user',
      content: `Create ${questionCount} IB multiple-choice quiz questions for:
Subject: ${subject}
Topic: ${topic}

Respond with ONLY this JSON array:
[
  {
    "id": "<uuid>",
    "question": "<question text>",
    "options": ["<A>", "<B>", "<C>", "<D>"],
    "correct_index": <0-3>,
    "explanation": "<why the correct answer is correct>",
    "topic": "<specific subtopic>"
  }
]`,
    },
  ]

  const raw = await chat(ai, messages, MODELS.TEXT, 3000)
  return parseJSON<QuizQuestion[]>(raw)
}

// ─── Oral Practice ────────────────────────────────────────────────────────────

export async function getOralPrompt(
  ai: Ai,
  type: string,
  subject: string,
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
): Promise<string> {
  const systemPrompt = type === 'oral'
    ? `You are an IB oral examiner conducting a ${subject} Individual Oral or Language Oral.
Ask probing follow-up questions. Encourage the student to expand, provide evidence, and link to wider themes.
Occasionally note when an answer is strong or could be developed. Keep a natural conversation flow.`
    : `You are an IB examiner conducting a practice presentation assessment for ${subject}.
Ask clarifying questions, probe assumptions, and push the student to think critically.`

  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10), // keep last 10 turns for context window
    { role: 'user', content: userMessage },
  ]

  return chat(ai, messages, MODELS.TEXT, 500)
}

export async function evaluateOralSession(
  ai: Ai,
  type: string,
  subject: string,
  transcript: string,
): Promise<AISessionFeedback> {
  const messages: Message[] = [
    {
      role: 'system',
      content: `You are an experienced IB ${type} examiner for ${subject}.
Evaluate the student's performance based on the transcript. Respond with valid JSON only.`,
    },
    {
      role: 'user',
      content: `Evaluate this ${type} practice transcript:

${transcript.slice(0, 4000)}

Respond with ONLY this JSON:
{
  "overall_score": <0-100>,
  "fluency_score": <0-100>,
  "content_score": <0-100>,
  "structure_score": <0-100>,
  "language_score": <0-100>,
  "strengths": ["<strength>"],
  "areas_to_improve": ["<improvement area>"],
  "detailed_feedback": "<paragraph of holistic feedback>",
  "pronunciation_notes": "<notes on language clarity and accuracy>",
  "vocabulary_suggestions": ["<better word or phrase to use>"]
}`,
    },
  ]

  const raw = await chat(ai, messages, MODELS.TEXT_LARGE, 2000)
  return parseJSON<AISessionFeedback>(raw)
}

// ─── IA Planner ───────────────────────────────────────────────────────────────

export async function generateIAPlan(
  ai: Ai,
  subject: string,
  topic: string,
): Promise<AIIAPlan> {
  const messages: Message[] = [
    {
      role: 'system',
      content: `You are an IB Internal Assessment expert and subject specialist.
Generate practical, feasible IA plans aligned with IB assessment criteria.
Research questions should be focused and measurable. Methodology should be realistic for a school setting.
Respond with valid JSON only.`,
    },
    {
      role: 'user',
      content: `Generate a detailed IA plan for:
Subject: ${subject}
Topic/Area: ${topic}

Respond with ONLY this JSON:
{
  "research_questions": [
    {
      "question": "<focused research question>",
      "rationale": "<why this is a strong RQ>",
      "feasibility": "high|medium|low"
    }
  ],
  "methodology_options": [
    {
      "method": "<method name>",
      "description": "<detailed description>",
      "advantages": ["<advantage>"],
      "limitations": ["<limitation>"]
    }
  ],
  "data_collection": [
    {
      "method": "<data collection method>",
      "description": "<how to collect>",
      "sample_size_suggestion": "<recommended sample size>",
      "ethical_considerations": ["<consideration>"]
    }
  ],
  "timeline_suggestion": [
    {
      "phase": "<phase name>",
      "duration": "<suggested time>",
      "tasks": ["<task>"]
    }
  ],
  "ib_alignment_notes": "<how this aligns with IB IA criteria>",
  "subject_specific_tips": ["<tip specific to ${subject} IAs>"]
}`,
    },
  ]

  const raw = await chat(ai, messages, MODELS.TEXT_LARGE, 3000)
  return parseJSON<AIIAPlan>(raw)
}

// ─── Summary Generator ───────────────────────────────────────────────────────

export async function generateSummary(
  ai: Ai,
  text: string,
  subject: string,
): Promise<{ summary: string; key_points: string[]; exam_tips: string[] }> {
  const messages: Message[] = [
    {
      role: 'system',
      content: `You are an IB study coach. Create concise, exam-focused summaries.
Highlight the most important concepts for IB assessments. Respond with valid JSON only.`,
    },
    {
      role: 'user',
      content: `Summarize this ${subject} content for IB exam revision:

${text.slice(0, 4000)}

Respond with ONLY this JSON:
{
  "summary": "<concise paragraph summary>",
  "key_points": ["<key exam point>"],
  "exam_tips": ["<specific exam advice>"]
}`,
    },
  ]

  const raw = await chat(ai, messages, MODELS.TEXT, 1500)
  return parseJSON<{ summary: string; key_points: string[]; exam_tips: string[] }>(raw)
}
