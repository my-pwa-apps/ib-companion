# IB Companion

An AI-powered study platform for International Baccalaureate students.

## Features

- **Question Helper** — Paste any question and get explanations, key concepts, and answer outlines
- **Essay Feedback** — Rubric-based AI feedback for TOK, EE, and IA essays
- **Study Mode** — AI-generated flashcards, quizzes, and summaries
- **Oral Practice** — English IO, language orals, and presentation practice with AI evaluation
- **IA Planner** — Research question suggestions, methodology ideas, and data collection plans

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Cloudflare Workers + Hono.js |
| Database | Cloudflare D1 (SQLite) |
| AI | Cloudflare Workers AI (Llama 3.1) |
| Storage | Cloudflare D1 (essay text), R2 when enabled |
| Auth | JWT via Web Crypto API |
| Hosting | Cloudflare Pages (web) + Workers (API) |

## Getting Started

### Prerequisites

- Node.js 20+
- Wrangler CLI (`npm i -g wrangler`)
- Cloudflare account (already configured)

### Development

```bash
# Install all dependencies
npm install

# Start API worker in dev mode
cd api && npm run dev

# Start web app in dev mode
cd web && npm run dev
```

### Deployment

```bash
# Deploy API to Cloudflare Workers
cd api && npm run deploy

# Deploy web app to Cloudflare Pages
cd web && npm run deploy
```

### Database setup

```bash
# Create D1 database
cd api && npm run db:create

# Run migrations
npm run db:migrate
```

## Project Structure

```
IB Companion/
├── api/                    # Cloudflare Workers API
│   ├── src/
│   │   ├── index.ts        # Worker entry point (Hono)
│   │   ├── routes/         # Route handlers
│   │   ├── ai/             # AI client & prompt templates
│   │   └── middleware/     # Auth & rate limiting
│   ├── migrations/         # D1 SQL migrations
│   └── wrangler.toml
│
├── web/                    # Next.js frontend
│   ├── app/                # App Router pages
│   ├── components/         # React components
│   └── lib/                # API client & utilities
│
└── docs/
    ├── ARCHITECTURE.md
    ├── ROADMAP.md
    └── AI_PROMPTS.md
```

## Plans

| Plan | Price | Queries/day |
|---|---|---|
| Free | €0 | 10 |
| Pro | €8/month | Unlimited |

## Target Users

IB students worldwide, ages 16–19.
