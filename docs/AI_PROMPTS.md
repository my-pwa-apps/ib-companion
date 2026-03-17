# IB Companion — AI Prompt Templates

All prompts are in `api/src/ai/client.ts`. This document explains the design rationale.

---

## Design Principles

1. **Rubric-first** — Every essay prompt includes the official IB criteria with mark allocations so the AI maps feedback to actual exam requirements.
2. **JSON-only output** — All prompts instruct the AI to return valid JSON, never prose. This makes responses predictable and parseable.
3. **Specificity** — Prompts ask for concrete references to the student's text, not generic advice.
4. **IB vocabulary** — Prompts use official IB language: "command term", "knowledge question", "area of knowledge", "criterion", etc.
5. **Persona** — System prompts establish the AI as an experienced examiner, not a generic tutor.

---

## Essay Analysis

### System message
```
You are an experienced IB examiner with 15+ years of marking experience.
Provide honest, constructive, rubric-aligned feedback. Be specific — quote or reference the student's text.
Always respond with valid JSON only. No prose outside JSON.
```

### Rubrics included

**TOK (2022 syllabus)**
- Criterion A: Understanding of Knowledge Questions (0–10)
- Criterion B: Quality of Analysis (0–10)
- Criterion C: Quality and Breadth of Examples (0–10)
- Grade boundaries: A (25–30), B (20–24), C (15–19), D (10–14), E (0–9)

**Extended Essay**
- Criterion A: Focus and Method (0–6)
- Criterion B: Knowledge and Understanding (0–6)
- Criterion C: Critical Thinking (0–12)
- Criterion D: Presentation (0–4)
- Criterion E: Engagement (0–6)
- Grade: A* (34), A (30–33), B (25–29), C (17–24), D (9–16), E (0–8)

**Internal Assessment (generic — HL/SL)**
- Research Design (0–6)
- Data Collection & Processing (0–6)
- Conclusion & Evaluation (0–6)
- Personal Engagement (0–2)
- Communication (0–4)

**Individual Oral (Language A)**
- Criterion A: Knowledge, Understanding & Interpretation (0–10)
- Criterion B: Analysis and Evaluation (0–10)
- Criterion C: Focus and Organisation (0–10)
- Criterion D: Language (0–10)
- Criterion E: Use of Text (0–10)

### Output schema
```json
{
  "overall_score": 72,
  "grade_estimate": "B",
  "summary": "A competent essay that addresses the prescribed title but lacks nuance...",
  "criteria": [
    {
      "name": "Criterion A: Understanding of Knowledge Questions",
      "description": "Does the essay identify genuine, contestable knowledge questions?",
      "score": 7,
      "max_score": 10,
      "strengths": ["The KQ is clearly stated in paragraph 1"],
      "weaknesses": ["The KQ could be more precisely scoped"],
      "suggestions": ["Refine the KQ to focus on one area of knowledge"]
    }
  ],
  "strengths": [...],
  "weaknesses": [...],
  "improvement_suggestions": [...],
  "next_steps": [...]
}
```

---

## Question Helper

### System message
```
You are an expert IB tutor. Help students understand questions and structure excellent answers.
Identify the IB command term (evaluate, compare, discuss, etc.) and explain what it demands.
Respond with valid JSON only.
```

### Key features
- **Command term analysis**: detects "evaluate", "discuss", "compare", "explain" etc. and describes exactly what each demands in an IB context.
- **Answer outline**: introduction → numbered main points (each with development detail) → conclusion.
- **Marks breakdown**: maps mark allocation to number of points needed.
- **Example snippet**: opening paragraph demonstrating technique.
- **Common mistakes**: pitfalls specific to this type of question.

---

## Flashcard Generator

### System message
```
You are an IB study expert. Create concise, exam-focused flashcards.
Front: a clear question or term. Back: precise, complete answer.
Focus on facts, definitions, formulas, and key distinctions that appear in IB exams.
```

### Card quality criteria
- Front: One clear question or concept name
- Back: Definition/answer that could earn a mark in an exam
- Avoid vague fronts ("What is biology?")
- Include formulas, units, and key terms

---

## Oral Practice

### Opening session
The AI generates an examiner opening that:
1. Introduces the session type (oral, presentation, exam discussion)
2. Asks the student to introduce their chosen text/topic
3. Sets a natural, encouraging tone

### Follow-up questions
The AI is instructed to:
- Ask probing follow-up questions ("Can you develop that point further?")
- Request evidence ("What specific example supports that?")
- Challenge assumptions ("How would someone argue the opposite?")
- Keep the conversation natural (not robotic)

### Session evaluation
Scored on:
- Fluency (0–100): smooth delivery and flow
- Content (0–100): depth and accuracy of knowledge
- Structure (0–100): logical organisation of ideas
- Language (0–100): vocabulary, register, grammar

---

## IA Planner

### Key prompt requirements
1. Research questions must be **focused** (not "How does temperature affect cells?" → "How does temperature between 10°C and 50°C affect the rate of catalase activity in potato (Solanum tuberosum) tissue?")
2. Methodology must be **feasible** in a school lab setting
3. Ethical considerations must be **relevant** (informed consent for surveys, animal welfare for biology, etc.)
4. Timeline must be **realistic** for a student working alongside other commitments

### Feasibility ratings
- **High**: Can be done with standard school equipment/resources
- **Medium**: Requires some planning or specialist equipment
- **Low**: Difficult to execute in a school setting

---

## Quiz Generator

### Question quality criteria
- IB-appropriate difficulty
- 4 options (A–D) with only one defensible correct answer
- Wrong answers are plausible (not obviously wrong)
- Explanation cites the reason the correct answer is right and why distractors are wrong

---

## Token Budgets

| Feature | Model | Max tokens |
|---|---|---|
| Essay analysis | 70B | 3000 |
| Question help | 70B | 2500 |
| Oral practice message | 8B | 500 |
| Oral session evaluation | 70B | 2000 |
| IA plan | 70B | 3000 |
| Flashcards (15) | 8B | 2000 |
| Quiz (10 questions) | 8B | 3000 |
| Summary | 8B | 1500 |

The 8B model is used for simpler, higher-volume tasks. The 70B model is used where quality and nuance matter most.
