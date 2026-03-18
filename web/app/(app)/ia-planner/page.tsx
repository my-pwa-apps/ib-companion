'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { ia as iaApi } from '@/lib/api'
import type { AIIAPlan, IAPlan } from '@/lib/types'
import { SUBJECTS } from '@/lib/utils'
import { FlaskConical, Loader2, ChevronDown, ChevronRight, CheckCircle, AlertCircle, Clock, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function IAPlannerPage() {
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<AIIAPlan | null>(null)
  const [savedPlans, setSavedPlans] = useState<IAPlan[]>([])
  const [expanded, setExpanded] = useState<string | null>('rq')

  useEffect(() => {
    iaApi.list().then(r => setSavedPlans(r.data)).catch(() => {})
  }, [])

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setPlan(null)
    try {
      const res = await iaApi.generate(subject, topic)
      setPlan(res.data.plan ?? null)
      const list = await iaApi.list()
      setSavedPlans(list.data)
      toast.success('IA plan generated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this plan?')) return
    await iaApi.delete(id)
    setSavedPlans(p => p.filter(x => x.id !== id))
  }

  const feasibilityColor = (f: string) => f === 'high' ? 'badge-green' : f === 'medium' ? 'badge-amber' : 'badge-red'

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">IA Planner</h1>
        <p className="text-slate-500 mt-1">Generate research questions, methodology, and a timeline for your Internal Assessment.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <h2 className="font-semibold text-slate-900 mb-4">Generate Plan</h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="label" htmlFor="ia-subject">Subject</label>
                <select id="ia-subject" className="input" value={subject} onChange={e => setSubject(e.target.value)} required>
                  <option value="">Select subject…</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Topic / Area of interest</label>
                <textarea
                  className="textarea h-24"
                  placeholder="e.g. The effect of temperature on enzyme activity, or How social media affects adolescent mental health…"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  required
                  minLength={5}
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Generating…</> : <><FlaskConical size={16} /> Generate Plan</>}
              </button>
            </form>
          </div>

          {/* Saved plans */}
          {savedPlans.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-slate-900 text-sm mb-3">Saved Plans</h3>
              <div className="space-y-2">
                {savedPlans.map(p => (
                  <div key={p.id} className="flex items-start justify-between gap-2 p-2 rounded-lg hover:bg-surface-muted">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{p.subject}</p>
                      <p className="text-xs text-slate-400 truncate">{p.topic}</p>
                    </div>
                    <button onClick={() => handleDelete(p.id)} className="btn-ghost p-1 text-slate-300 hover:text-red-400 flex-shrink-0" aria-label="Delete plan">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Plan output */}
        <div className="lg:col-span-2 space-y-4">
          {plan ? (
            <>
              {/* Research Questions */}
              <AccordionSection
                id="rq"
                title="Research Questions"
                expanded={expanded}
                setExpanded={setExpanded}
                icon={<CheckCircle size={15} className="text-emerald-500" />}
              >
                <div className="space-y-3">
                  {plan.research_questions.map((rq, i) => (
                    <div key={i} className="p-3 rounded-lg border border-surface-border">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-slate-800">{rq.question}</p>
                        <span className={cn('badge flex-shrink-0', feasibilityColor(rq.feasibility))}>{rq.feasibility}</span>
                      </div>
                      <p className="text-xs text-slate-500">{rq.rationale}</p>
                    </div>
                  ))}
                </div>
              </AccordionSection>

              {/* Methodology */}
              <AccordionSection
                id="methodology"
                title="Methodology Options"
                expanded={expanded}
                setExpanded={setExpanded}
                icon={<FlaskConical size={15} className="text-brand-500" />}
              >
                <div className="space-y-4">
                  {plan.methodology_options.map((m, i) => (
                    <div key={i} className="p-3 rounded-lg border border-surface-border">
                      <p className="text-sm font-semibold text-slate-800 mb-1">{m.method}</p>
                      <p className="text-xs text-slate-500 mb-2">{m.description}</p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs font-medium text-emerald-600 mb-1">Advantages</p>
                          {m.advantages.map((a,j) => <p key={j} className="text-xs text-slate-600">+ {a}</p>)}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-amber-600 mb-1">Limitations</p>
                          {m.limitations.map((l,j) => <p key={j} className="text-xs text-slate-600">− {l}</p>)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionSection>

              {/* Data Collection */}
              <AccordionSection
                id="data"
                title="Data Collection"
                expanded={expanded}
                setExpanded={setExpanded}
                icon={<AlertCircle size={15} className="text-violet-500" />}
              >
                {plan.data_collection.map((d, i) => (
                  <div key={i} className="p-3 rounded-lg border border-surface-border mb-3">
                    <p className="text-sm font-semibold text-slate-800 mb-1">{d.method}</p>
                    <p className="text-xs text-slate-500 mb-1">{d.description}</p>
                    <p className="text-xs text-brand-600">Sample: {d.sample_size_suggestion}</p>
                    {d.ethical_considerations.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-amber-600">Ethical considerations</p>
                        {d.ethical_considerations.map((ec,j) => <p key={j} className="text-xs text-slate-500">• {ec}</p>)}
                      </div>
                    )}
                  </div>
                ))}
              </AccordionSection>

              {/* Timeline */}
              <AccordionSection
                id="timeline"
                title="Timeline"
                expanded={expanded}
                setExpanded={setExpanded}
                icon={<Clock size={15} className="text-amber-500" />}
              >
                <ol className="space-y-3">
                  {plan.timeline_suggestion.map((phase, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        {i < plan.timeline_suggestion.length - 1 && (
                          <div className="w-px flex-1 bg-surface-border mt-1" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium text-slate-800">{phase.phase}</p>
                        <p className="text-xs text-brand-600 mb-1">{phase.duration}</p>
                        {phase.tasks.map((t,j) => <p key={j} className="text-xs text-slate-500">• {t}</p>)}
                      </div>
                    </li>
                  ))}
                </ol>
              </AccordionSection>

              {/* IB notes */}
              <div className="card bg-brand-50 border-brand-200">
                <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-2">IB Alignment Notes</p>
                <p className="text-sm text-brand-800">{plan.ib_alignment_notes}</p>
                {plan.subject_specific_tips.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-brand-700 mb-1">Subject-specific tips</p>
                    {plan.subject_specific_tips.map((tip, i) => (
                      <p key={i} className="text-xs text-brand-700">→ {tip}</p>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="card h-64 flex flex-col items-center justify-center text-center">
              <FlaskConical size={32} className="text-slate-300 mb-3" />
              {loading
                ? <><Loader2 size={20} className="animate-spin text-brand-400" /><p className="text-sm text-slate-400 mt-2">Building your IA plan…</p></>
                : <p className="text-sm text-slate-400">Your IA plan will appear here after generation</p>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AccordionSection({ id, title, icon, expanded, setExpanded, children }: {
  id: string; title: string; icon: React.ReactNode
  expanded: string | null; setExpanded: (id: string | null) => void
  children: React.ReactNode
}) {
  const isOpen = expanded === id
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded(isOpen ? null : id)}
        className="w-full flex items-center gap-2 text-left"
      >
        {icon}
        <span className="font-semibold text-slate-900 text-sm">{title}</span>
        {isOpen ? <ChevronDown size={14} className="ml-auto text-slate-400" /> : <ChevronRight size={14} className="ml-auto text-slate-400" />}
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  )
}
