# IB Companion — System Architecture

## Overview

IB Companion is a full-stack AI-powered web application for International Baccalaureate students. It uses a Cloudflare-native stack for low latency and simple deployment.

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Student)                       │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────────────┐
│              Cloudflare Edge Network                         │
│                                                              │
│  ┌──────────────────┐       ┌──────────────────────────┐    │
│  │  Cloudflare Pages │       │  Cloudflare Workers API  │    │
│  │  (Next.js SSR)    │──────▶│  (Hono + Workers AI)     │    │
│  └──────────────────┘       └──────┬───────────────────┘    │
│                                    │                         │
│                    ┌───────────────┼───────────────┐         │
│                    │               │               │         │
│              ┌─────▼────┐  ┌──────▼────┐  ┌──────▼───┐     │
│              │ D1        │  │Workers AI │  │    KV    │     │
│              │ (SQLite)  │  │ (Llama 3) │  │ (Cache)  │     │
│              └──────────┘  └───────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Frontend (Cloudflare Pages + Next.js)

### Technology
- **Framework**: Next.js 15 (App Router, RSC where possible)
- **Styling**: Tailwind CSS 3 with custom brand tokens
- **Icons**: Lucide React
- **Toast notifications**: react-hot-toast
- **Markdown**: react-markdown (for AI response rendering)

### Route Structure

| Route | Auth | Description |
|---|---|---|
| `/` | No | Landing page |
| `/login` | No | Sign in |
| `/register` | No | Create account |
| `/dashboard` | Yes | Overview + stats |
| `/essays` | Yes | Essay list |
| `/essays/analyze` | Yes | Paste + analyze essay |
| `/questions` | Yes | Question helper |
| `/flashcards` | Yes | Decks + study mode (spaced rep) |
| `/practice` | Yes | Oral / exam practice chat |
| `/ia-planner` | Yes | IA plan generator |

### State Management
- No external state library. React `useState`/`useEffect` per page.
- Auth token stored in `localStorage` (`ib_token`).
- Redirect to `/login` if no token on protected routes.

---

## Backend (Cloudflare Workers + Hono)

### Technology
- **Runtime**: Cloudflare Workers (V8 isolates, <1ms cold start)
- **Framework**: Hono v4 (ultra-lightweight, CF-native)
- **Auth**: HMAC-SHA256 JWT (Web Crypto API — no Node.js dep)
- **Validation**: Zod + @hono/zod-validator
- **AI**: Cloudflare Workers AI (Llama 3.1 8B + 70B)

### API Routes

```
POST   /api/auth/register         Create account
POST   /api/auth/login            Authenticate
POST   /api/auth/logout           Revoke session

GET    /api/user/me               Current user profile + quota
GET    /api/user/stats            Usage statistics

GET    /api/essays                List essays (paginated)
GET    /api/essays/:id            Get essay + feedback
POST   /api/essays                Create + optionally analyze
POST   /api/essays/:id/analyze    Re-analyze existing essay
DELETE /api/essays/:id            Delete essay

POST   /api/questions/help        Analyze question + generate outline
GET    /api/questions/history     Past questions

GET    /api/flashcards/decks      List decks
GET    /api/flashcards/decks/:id/cards   Deck + cards
POST   /api/flashcards/generate   AI-generate flashcard deck
PATCH  /api/flashcards/:id/review SM-2 spaced repetition review
GET    /api/flashcards/due        Cards due for review today
DELETE /api/flashcards/decks/:id  Delete deck

POST   /api/practice/start        Start oral/exam session
POST   /api/practice/message      Send message in session
POST   /api/practice/:id/end      End + evaluate session
GET    /api/practice              List sessions
GET    /api/practice/:id          Get session

POST   /api/ia/plan               Generate IA plan
GET    /api/ia/plans              List saved plans
GET    /api/ia/plans/:id          Get plan detail
PATCH  /api/ia/plans/:id/status   Update plan status
DELETE /api/ia/plans/:id          Delete plan

POST   /api/quiz/generate         Generate quiz questions
POST   /api/quiz/:id/submit       Submit answers
GET    /api/quiz/history          Past quiz attempts
POST   /api/quiz/summarize        Summarize notes
```

---

## Database Schema (Cloudflare D1 / SQLite)

```
users
  id, email, name, password_hash, plan, pro_expires_at
  queries_today, queries_reset_at, created_at

sessions
  id, user_id, token_hash, expires_at, created_at

essays
  id, user_id, title, content, type, subject
  feedback (JSON), analyzed_at, created_at

question_help
  id, user_id, question, subject, level, response (JSON), created_at

flashcard_decks
  id, user_id, title, subject, card_count, created_at

flashcards
  id, deck_id, front, back
  repetitions, ease_factor, interval_days, next_review_at   ← SM-2

practice_sessions
  id, user_id, type, subject, title
  messages (JSON), score, feedback (JSON), status, created_at

ia_plans
  id, user_id, subject, topic, research_question
  plan_data (JSON), status, created_at

quiz_attempts
  id, user_id, subject, topic, questions (JSON), answers (JSON)
  score, total, created_at
```

---

## AI Layer (Cloudflare Workers AI)

### Models Used

| Purpose | Model |
|---|---|
| Essay analysis, IA planning, oral practice | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` |
| Flashcards, quiz, summaries | `@cf/meta/llama-3.1-8b-instruct` |
| Embeddings (future) | `@cf/baai/bge-base-en-v1.5` |

### Rate Limiting

- **Free plan**: 10 AI queries/day (tracked in D1, reset at UTC midnight)
- **Pro plan**: Unlimited
- Rate limit state in D1 `users` table (`queries_today`, `queries_reset_at`)
- Remaining queries returned in `X-Queries-Remaining` response header

---

## Security

| Concern | Mitigation |
|---|---|
| Password storage | PBKDF2 + SHA-256, 100k iterations, random salt |
| JWT signing | HMAC-SHA256 via Web Crypto API |
| JWT revocation | SHA-256 token hash stored in D1 sessions table |
| CORS | Strict allow-list of origins |
| Input validation | Zod schemas on all endpoints |
| SQL injection | D1 prepared statements everywhere |
| XSS | Next.js automatic escaping + `secureHeaders` middleware |
| Rate abuse | Per-user daily query counter |

---

## Deployment

### API (Cloudflare Workers)

```bash
cd api

# 1. Create D1 database
wrangler d1 create ib-companion-db

# 2. Update wrangler.toml with the database_id from step 1

# 3. Run migrations
wrangler d1 migrations apply ib-companion-db --remote

# 4. Set secrets
wrangler secret put JWT_SECRET

# 5. Deploy
wrangler deploy
```

### Web (Cloudflare Pages)

```bash
cd web
npm run build
wrangler pages deploy .next/static --project-name ib-companion
```

*Or connect the GitHub repo to Cloudflare Pages for automatic deployments.*

---

## Environment Variables

### API (wrangler.toml + secrets)

| Variable | Source | Description |
|---|---|---|
| `JWT_SECRET` | `wrangler secret` | HMAC signing key (min 32 chars) |
| `FREE_PLAN_DAILY_LIMIT` | `wrangler.toml` | Daily query limit for free users |
| `ENVIRONMENT` | `wrangler.toml` | `development` or `production` |

### Web (.env.local)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL of Cloudflare Workers API |
