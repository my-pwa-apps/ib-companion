import Link from 'next/link'
import {
  BookOpen, Brain, MessageSquare, Mic, FlaskConical,
  CheckCircle, ArrowRight, Star, Zap, Shield, Sparkles
} from 'lucide-react'

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'Question Helper',
    description: 'Paste any IB question and get a structured explanation, key concepts, command-term analysis, and a full answer outline.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: BookOpen,
    title: 'Essay Feedback',
    description: 'Rubric-aligned feedback for TOK, EE, IA, and IO. Get criterion scores, strengths, weaknesses, and actionable improvements.',
    gradient: 'from-brand-500 to-blue-600',
  },
  {
    icon: Brain,
    title: 'Study Mode',
    description: 'AI-generated flashcards with spaced repetition, topic quizzes, and concise revision summaries.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Mic,
    title: 'Oral Practice',
    description: 'Simulate English IO, language orals, and presentations. The AI acts as examiner, asks follow-up questions, and evaluates your performance.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: FlaskConical,
    title: 'IA Planner',
    description: 'Input your subject and topic — get research question suggestions, methodology options, data collection ideas, and a timeline.',
    gradient: 'from-rose-500 to-pink-600',
  },
]

const TESTIMONIALS = [
  { name: 'Sofia M.', score: '43/45', text: 'The TOK essay feedback was like having my examiner review it beforehand. Went from a C to an A.' },
  { name: 'James K.', score: '7 in HL Bio', text: 'Generated flashcards for every topic. The spaced repetition actually made me remember everything for exams.' },
  { name: 'Amara D.', score: 'EE Grade A', text: 'IA Planner helped me nail my research question in under 10 minutes. Saved me weeks of confusion.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-white/40 backdrop-blur-2xl border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-md shadow-brand-500/25">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">
              IB <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">Companion</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/register" className="btn-primary text-sm">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="mesh-bg relative pt-32 pb-24 px-4 sm:px-6">
        {/* Floating orbs */}
        <div className="orb w-[500px] h-[500px] bg-brand-400 -top-64 -left-64 animate-float-slow" />
        <div className="orb w-[400px] h-[400px] bg-purple-400 -top-32 right-0 animate-float-slower" />
        <div className="orb w-[300px] h-[300px] bg-pink-300 bottom-0 left-1/3 animate-float" />
        <div className="orb w-[200px] h-[200px] bg-cyan-300 top-1/2 right-1/4 animate-float-slow" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-white/60 backdrop-blur-sm text-brand-700 border border-white/40 shadow-sm mb-8">
              <Sparkles size={14} className="text-brand-500" />
              Powered by Cloudflare Workers AI
            </div>
            <h1 className="text-5xl sm:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Your AI study partner
              <br />
              <span className="bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                for the IB Diploma
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Get structured help with TOK, Extended Essays, Internal Assessments, and exam revision.
              Designed specifically for IB students aged 16–19.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up-delay">
            <Link href="/register" className="btn-primary px-8 py-3.5 text-base w-full sm:w-auto shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30">
              Start for free <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn-secondary px-8 py-3.5 text-base w-full sm:w-auto">
              Sign in
            </Link>
          </div>
          <p className="text-sm text-slate-400 mt-6 font-medium">Free plan · No credit card required · 10 AI queries/day</p>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 mesh-bg relative">
        <div className="orb w-[300px] h-[300px] bg-brand-300 top-20 -right-32 animate-float-slower" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Everything an IB student needs</h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">Five AI-powered tools working together to boost your IB performance.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="glass p-6 group hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-5 transition-transform duration-300 group-hover:scale-110`}>
                  <feature.icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
            {/* 6th card: AI Rubric — dark glass */}
            <div className="glass-dark p-6 text-white group hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300">
              <div className="inline-flex p-3 rounded-xl bg-white/20 backdrop-blur-sm mb-5 transition-transform duration-300 group-hover:scale-110">
                <Shield size={22} />
              </div>
              <h3 className="font-bold mb-2 text-lg">Rubric-Aligned Scoring</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Every essay analysis maps directly to official IB criteria — TOK (A/B/C), EE (A–E), IA per subject — so feedback is always exam-relevant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Example Feedback ──────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 relative">
        <div className="orb w-[400px] h-[400px] bg-purple-300 -bottom-32 -left-32 animate-float" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-5">Examiner-quality feedback, instantly</h2>
              <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                Our AI is trained on IB rubrics and gives the kind of specific, actionable feedback that examiners provide — not generic suggestions.
              </p>
              <ul className="space-y-4">
                {[
                  'Criterion-by-criterion scoring',
                  'Quote-referenced strengths and weaknesses',
                  'Prioritised improvement suggestions',
                  'Grade band estimation',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-500/20 flex-shrink-0">
                      <CheckCircle size={14} className="text-white" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Mock feedback card — glass */}
            <div className="glass p-6 shadow-float">
              <div className="flex items-center justify-between mb-5">
                <span className="font-bold text-slate-900 text-lg">TOK Essay Feedback</span>
                <span className="badge-amber">Score: 22/30</span>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Criterion A: Knowledge Questions', score: 7, max: 10 },
                  { label: 'Criterion B: Quality of Analysis', score: 8, max: 10 },
                  { label: 'Criterion C: Examples & Case Studies', score: 7, max: 10 },
                ].map(c => (
                  <div key={c.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-600 font-medium">{c.label}</span>
                      <span className="font-bold text-slate-800">{c.score}/{c.max}</span>
                    </div>
                    <div className="h-2 bg-white/60 rounded-full overflow-hidden backdrop-blur-sm">
                      <div
                        className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-700"
                        style={{ width: `${(c.score / c.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-4 bg-amber-50/80 backdrop-blur-sm border border-amber-200/30 rounded-xl text-xs text-amber-800">
                <strong>Key suggestion:</strong> Your knowledge question is relevant but needs sharper focus.
                Consider specifying the area of knowledge and refining the scope to one concept.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 mesh-bg relative">
        <div className="orb w-[250px] h-[250px] bg-amber-300 top-10 right-10 animate-float-slow" />
        <div className="max-w-5xl mx-auto relative z-10">
          <h2 className="text-4xl font-extrabold text-slate-900 text-center mb-14">IB students love it</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="glass p-6 group hover:-translate-y-1 transition-all duration-300">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className="text-amber-400 fill-amber-400 drop-shadow-sm" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 italic mb-5 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{t.name}</span>
                  <span className="badge-green text-xs">{t.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 mesh-bg-dark relative overflow-hidden">
        <div className="orb w-[400px] h-[400px] bg-brand-500 opacity-20 -top-32 left-1/4 animate-float-slow" />
        <div className="orb w-[300px] h-[300px] bg-purple-500 opacity-20 bottom-0 right-1/4 animate-float" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">Ready to ace the IB?</h2>
          <p className="text-lg text-white/60 mb-10">Join thousands of IB students getting smarter, faster.</p>
          <Link href="/register" className="btn-primary px-10 py-4 text-lg shadow-xl shadow-brand-500/30 hover:shadow-2xl hover:shadow-brand-500/40">
            Get started for free <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/20 py-10 px-4 bg-white/30 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <span className="font-medium">© 2026 IB Companion. Built for IB students worldwide.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-600 transition-colors font-medium">Privacy</a>
            <a href="#" className="hover:text-slate-600 transition-colors font-medium">Terms</a>
            <a href="mailto:hello@ibcompanion.app" className="hover:text-slate-600 transition-colors font-medium">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
