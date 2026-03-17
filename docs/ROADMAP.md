# IB Companion — Feature Roadmap

## MVP (v0.1) — Now

- [x] Auth (register, login, JWT)
- [x] Essay feedback: TOK, EE, IA, IO with rubric-aligned scoring
- [x] Question helper with command-term analysis and answer outlines
- [x] Flashcard generation with SM-2 spaced repetition
- [x] Oral/exam practice chat with AI examiner
- [x] IA planner: research questions, methodology, data collection, timeline
- [x] Quiz generator with multiple-choice and answer explanations
- [x] Notes summarizer
- [x] Free/Pro plan enforcement (10 queries/day free)
- [x] Dashboard with stats and guided onboarding

---

## v0.2 — Near-term (1–2 months)

### Stripe payment integration
- `POST /api/billing/checkout` → create Stripe Checkout session (€8/month)
- Webhook: `customer.subscription.updated` → update `users.plan` in D1
- In-app upgrade prompt when quota reached

### Subject-specific IA rubrics
- Per-subject criteria (Biology, Chemistry, Economics, Psychology, etc.)
- Fine-tuned grading logic for each discipline

### Dark mode
- Tailwind `dark:` variants + system preference detection

### Essay history & versioning
- Store multiple analysis runs per essay
- Side-by-side diff of feedback across versions

---

## v0.3 — Medium-term (2–4 months)

### Notes upload & search
- Enable Cloudflare R2 (PDF/image upload)
- Parse PDF text via Workers AI
- Embed notes with `@cf/baai/bge-base-en-v1.5`
- Vector search for "find similar concepts in my notes"

### TOK Exhibition helper
- Object analysis mode (link object → IA + KQ)
- Three objects, three IAs workflow
- Exhibition commentary template

### Predicted grade tracker
- Input marks across IAs, mocks, TOK
- Automated grade prediction with boundary mapping

---

## v0.4 — Longer-term

### Teacher dashboard
- Class overview: see student progress, common weaknesses
- Assignment feedback: teacher assigns prompt, students submit via IB Companion
- Bulk feedback: upload class essays → batch analysis

### Mobile app (React Native / Expo)
- Offline flashcard review
- Push notifications for spaced repetition due cards
- Voice input for oral practice

### Past paper engine
- Official IB past paper bank (curated)
- Timed exam simulation per paper/section
- Auto-mark responses against mark scheme

### AI model upgrades
- Option to use Anthropic Claude or OpenAI GPT-4o via API
- User-selectable model quality (fast vs. detailed)

### Localization
- Spanish, French, Chinese UI
- Subject-specific terminology per language group

---

## Technical Debt / Improvements

- [ ] Add OpenTelemetry tracing on Workers
- [ ] Move KV session cache for hot-path auth (avoid D1 on every request)
- [ ] Parallelize D1 batch queries in dashboard/stats
- [ ] Add E2E tests (Playwright)
- [ ] CI/CD pipeline (GitHub Actions → Wrangler deploy)
- [ ] Structured error logging (Cloudflare Logpush → R2)
