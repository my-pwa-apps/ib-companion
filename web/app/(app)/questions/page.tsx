'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { questions as questionsApi } from '@/lib/api'
import type { AIQuestionResponse } from '@/lib/types'
import { SUBJECTS } from '@/lib/utils'
import { MessageSquare, Loader2, BookOpen, AlertTriangle, Lightbulb, List } from 'lucide-react'

export default function QuestionsPage() {
  const [question, setQuestion] = useState('')
  const [subject, setSubject] = useState('')
  const [level, setLevel] = useState<'SL' | 'HL' | ''>('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<AIQuestionResponse | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResponse(null)
    try {
      const res = await questionsApi.help({
        question,
        subject: subject || undefined,
        level: level || undefined,
      })
      setResponse(res.data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Request failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Question Helper</h1>
        <p className="text-slate-500 mt-1">
          Paste any IB exam question to get explanation, key concepts, and a structured answer outline.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="card space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="q-subject">Subject (optional)</label>
                <select id="q-subject" className="input" value={subject} onChange={e => setSubject(e.target.value)}>
                  <option value="">Any subject</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="q-level">Level (optional)</label>
                <select id="q-level" className="input" value={level} onChange={e => setLevel(e.target.value as 'SL' | 'HL' | '')}>
                  <option value="">SL / HL</option>
                  <option value="SL">Standard Level (SL)</option>
                  <option value="HL">Higher Level (HL)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Your question</label>
              <textarea
                className="textarea h-40"
                placeholder="e.g. Compare and contrast two theories of emotion. [10 marks]"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                required
                minLength={10}
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Thinking…</>
              ) : (
                <><MessageSquare size={16} /> Get Help</>
              )}
            </button>
          </form>
        </div>

        {/* Response */}
        <div className="space-y-4">
          {response ? (
            <>
              {/* Explanation */}
              <div className="card">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={15} className="text-brand-500" />
                  <h3 className="font-semibold text-sm text-slate-900">What this question asks</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{response.explanation}</p>
                <div className="mt-3 p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800">
                  <strong>Command term:</strong> {response.command_term_analysis}
                </div>
              </div>

              {/* Key concepts */}
              <div className="card">
                <div className="flex items-center gap-2 mb-3">
                  <List size={15} className="text-violet-500" />
                  <h3 className="font-semibold text-sm text-slate-900">Key concepts</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {response.key_concepts.map(kc => (
                    <span key={kc} className="badge-blue">{kc}</span>
                  ))}
                </div>
              </div>

              {/* Answer outline */}
              <div className="card">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={15} className="text-emerald-500" />
                  <h3 className="font-semibold text-sm text-slate-900">Answer outline</h3>
                  <span className="badge-gray ml-auto">{response.marks_breakdown}</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Introduction</p>
                    <p className="text-slate-600">{response.answer_outline.introduction}</p>
                  </div>
                  {response.answer_outline.main_points.map((mp, i) => (
                    <div key={i}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Point {i + 1}</p>
                      <p className="font-medium text-slate-700">{mp.point}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{mp.detail}</p>
                    </div>
                  ))}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Conclusion</p>
                    <p className="text-slate-600">{response.answer_outline.conclusion}</p>
                  </div>
                </div>
              </div>

              {/* Example snippet */}
              {response.example_answer_snippet && (
                <div className="card bg-slate-50">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Example opening</p>
                  <p className="text-sm text-slate-700 italic leading-relaxed">&ldquo;{response.example_answer_snippet}&rdquo;</p>
                </div>
              )}

              {/* Common mistakes */}
              <div className="card">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={15} className="text-red-400" />
                  <h3 className="font-semibold text-sm text-slate-900">Common mistakes to avoid</h3>
                </div>
                <ul className="space-y-1.5">
                  {response.common_mistakes.map((m, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <span className="text-red-400 mt-0.5">✕</span> {m}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="card h-64 flex flex-col items-center justify-center text-center">
              <MessageSquare size={32} className="text-slate-300 mb-3" />
              {loading
                ? <><Loader2 size={20} className="animate-spin text-brand-400" /><p className="text-sm text-slate-400 mt-2">Preparing your answer guide…</p></>
                : <p className="text-sm text-slate-400">Your question breakdown will appear here</p>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
