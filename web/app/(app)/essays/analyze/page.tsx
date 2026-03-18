'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { essays as essaysApi } from '@/lib/api'
import { ESSAY_TYPES, SUBJECTS } from '@/lib/utils'
import type { AIEssayFeedback, EssayType } from '@/lib/types'
import { FeedbackPanel } from '@/components/essays/FeedbackPanel'
import { Upload, Loader2, BookOpen } from 'lucide-react'

export default function AnalyzeEssayPage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [type, setType] = useState<EssayType>('tok')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<AIEssayFeedback | null>(null)

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault()
    if (wordCount < 50) {
      toast.error('Please paste at least 50 words of your essay')
      return
    }
    setLoading(true)
    setFeedback(null)
    try {
      const res = await essaysApi.create({
        title: title || undefined,
        content,
        type,
        subject: subject || undefined,
        analyze: true,
      })
      if (res.data.feedback) {
        setFeedback(res.data.feedback)
        toast.success('Analysis complete!')
      } else {
        toast.error('Analysis failed — please try again')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analysis failed'
      if (msg.includes('RATE_LIMIT')) {
        toast.error('Daily limit reached. Try again tomorrow.')
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Essay Feedback</h1>
        <p className="text-slate-500 mt-1">
          Paste your essay for rubric-aligned AI feedback. Supports TOK, EE, IA, and IO.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="card space-y-4">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="essay-type">Essay type</label>
                <select
                  id="essay-type"
                  className="input"
                  value={type}
                  onChange={e => setType(e.target.value as EssayType)}
                >
                  {ESSAY_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="essay-subject">Subject (optional)</label>
                <select
                  id="essay-subject"
                  className="input"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                >
                  <option value="">Select subject…</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Title (optional)</label>
              <input
                type="text"
                className="input"
                placeholder="Essay title"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Essay content</label>
                <span className="text-xs text-slate-400">{wordCount} words</span>
              </div>
              <textarea
                className="textarea h-72"
                placeholder="Paste your full essay here…"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Analyzing…</>
              ) : (
                <><BookOpen size={16} /> Analyze Essay</>
              )}
            </button>
          </form>

          {/* Recent essays link */}
          <div className="pt-2 border-t border-surface-border">
            <button
              onClick={() => router.push('/essays')}
              className="text-sm text-brand-600 hover:underline"
            >
              View previous essays →
            </button>
          </div>
        </div>

        {/* Feedback */}
        <div>
          {feedback ? (
            <FeedbackPanel feedback={feedback} />
          ) : (
            <div className="card h-full flex flex-col items-center justify-center py-16 text-center">
              <Upload size={32} className="text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">
                {loading ? 'Analyzing your essay…' : 'Paste your essay and click Analyze to get feedback'}
              </p>
              {loading && <Loader2 size={24} className="animate-spin text-brand-400 mt-4" />}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
