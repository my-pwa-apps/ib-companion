import Link from 'next/link'
import {
  BookOpen, Brain, MessageSquare, Mic, FlaskConical,
  CheckCircle, ArrowRight, Star, Zap, Shield
} from 'lucide-react'

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'Question Helper',
    description: 'Paste any IB question and get a structured explanation, key concepts, command-term analysis, and a full answer outline.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: BookOpen,
    title: 'Essay Feedback',
    description: 'Rubric-aligned feedback for TOK, EE, IA, and IO. Get criterion scores, strengths, weaknesses, and actionable improvements.',
    color: 'bg-brand-50 text-brand-600',
  },
  {
    icon: Brain,
    title: 'Study Mode',
    description: 'AI-generated flashcards with spaced repetition, topic quizzes, and concise revision summaries.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Mic,
    title: 'Oral Practice',
    description: 'Simulate English IO, language orals, and presentations. The AI acts as examiner, asks follow-up questions, and evaluates your performance.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: FlaskConical,
    title: 'IA Planner',
    description: 'Input your subject and topic — get research question suggestions, methodology options, data collection ideas, and a timeline.',
    color: 'bg-rose-50 text-rose-600',
  },
]

const TESTIMONIALS = [
  { name: 'Sofia M.', score: '43/45', text: 'The TOK essay feedback was like having my examiner review it beforehand. Went from a C to an A.' },
  { name: 'James K.', score: '7 in HL Bio', text: 'Generated flashcards for every topic. The spaced repetition actually made me remember everything for exams.' },
  { name: 'Amara D.', score: 'EE Grade A', text: 'IA Planner helped me nail my research question in under 10 minutes. Saved me weeks of confusion.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-md border-b border-surface-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <span className="font-bold text-lg text-slate-900">
            IB <span className="text-brand-500">Companion</span>
          </span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/register" className="btn-primary text-sm">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200 mb-6">
            <Zap size={12} />
            Powered by Cloudflare Workers AI
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Your AI study partner
            <br />
            <span className="text-brand-500">for the IB Diploma</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
            Get structured help with TOK, Extended Essays, Internal Assessments, and exam revision.
            Designed specifically for IB students aged 16–19.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register" className="btn-primary px-6 py-3 text-base w-full sm:w-auto">
              Start for free <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="btn-secondary px-6 py-3 text-base w-full sm:w-auto">
              Sign in
            </Link>
          </div>
          <p className="text-sm text-slate-400 mt-4">Free plan · No credit card required · 10 AI queries/day</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 bg-surface-muted">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Everything an IB student needs</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Five AI-powered tools working together to boost your IB performance.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card hover:shadow-card-hover transition-shadow">
                <div className={`inline-flex p-2.5 rounded-lg ${feature.color} mb-4`}>
                  <feature.icon size={20} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
            {/* 6th card: AI Rubric */}
            <div className="card hover:shadow-card-hover transition-shadow bg-gradient-to-br from-brand-500 to-violet-600 text-white border-0">
              <div className="inline-flex p-2.5 rounded-lg bg-white/20 mb-4">
                <Shield size={20} />
              </div>
              <h3 className="font-semibold mb-2">Rubric-Aligned Scoring</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Every essay analysis maps directly to official IB criteria — TOK (A/B/C), EE (A–E), IA per subject — so feedback is always exam-relevant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Feedback */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Examiner-quality feedback, instantly</h2>
              <p className="text-slate-500 mb-6">
                Our AI is trained on IB rubrics and gives the kind of specific, actionable feedback that examiners provide — not generic suggestions.
              </p>
              <ul className="space-y-3">
                {[
                  'Criterion-by-criterion scoring',
                  'Quote-referenced strengths and weaknesses',
                  'Prioritised improvement suggestions',
                  'Grade band estimation',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-slate-700">
                    <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Mock feedback card */}
            <div className="card shadow-card-hover">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-slate-900">TOK Essay Feedback</span>
                <span className="badge-amber">Score: 22/30</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Criterion A: Knowledge Questions', score: 7, max: 10 },
                  { label: 'Criterion B: Quality of Analysis', score: 8, max: 10 },
                  { label: 'Criterion C: Examples & Case Studies', score: 7, max: 10 },
                ].map(c => (
                  <div key={c.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">{c.label}</span>
                      <span className="font-medium text-slate-800">{c.score}/{c.max}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-400 rounded-full"
                        style={{ width: `${(c.score / c.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800">
                <strong>Key suggestion:</strong> Your knowledge question is relevant but needs sharper focus.
                Consider specifying the area of knowledge and refining the scope to one concept.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 bg-surface-muted">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">IB students love it</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 italic mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">{t.name}</span>
                  <span className="badge-green text-xs">{t.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple pricing</h2>
          <p className="text-slate-500 mb-12">Start free. Upgrade when you need more.</p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="card text-left">
              <div className="mb-4">
                <span className="text-2xl font-bold text-slate-900">Free</span>
                <p className="text-sm text-slate-500 mt-1">10 AI queries per day</p>
              </div>
              <ul className="space-y-2.5 mb-6 text-sm text-slate-600">
                {['Question helper', 'Essay feedback (1/day)', 'Flashcard generation', 'IA planner (1/day)'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="btn-secondary w-full justify-center">Get started free</Link>
            </div>
            {/* Pro */}
            <div className="card text-left border-2 border-brand-400 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="badge-blue text-xs font-semibold px-3 py-1">Most popular</span>
              </div>
              <div className="mb-4">
                <span className="text-2xl font-bold text-slate-900">€8</span>
                <span className="text-slate-400 text-sm">/month</span>
                <p className="text-sm text-slate-500 mt-1">Unlimited AI queries</p>
              </div>
              <ul className="space-y-2.5 mb-6 text-sm text-slate-600">
                {[
                  'Everything in Free',
                  'Unlimited essay feedback',
                  'Unlimited flashcards & quizzes',
                  'Oral practice sessions',
                  'Advanced IA planning',
                  'Priority AI responses',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-brand-500" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="btn-primary w-full justify-center">Start Pro trial</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <span>© 2026 IB Companion. Built for IB students worldwide.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
            <a href="mailto:hello@ibcompanion.app" className="hover:text-slate-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
