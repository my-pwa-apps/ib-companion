'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { essays as essaysApi } from '@/lib/api'
import type { Essay } from '@/lib/types'
import { formatDate, scoreBg } from '@/lib/utils'
import { BookOpen, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { ESSAY_TYPES } from '@/lib/utils'

export default function EssaysPage() {
  const [essayList, setEssayList] = useState<Essay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    essaysApi.list().then(r => setEssayList(r.data.essays)).finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this essay?')) return
    await essaysApi.delete(id)
    setEssayList(e => e.filter(x => x.id !== id))
    toast.success('Essay deleted')
  }

  const typeLabel = (t: string) => ESSAY_TYPES.find(x => x.value === t)?.label ?? t

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Essays</h1>
          <p className="text-slate-500 mt-1">Your analyzed essays and feedback history.</p>
        </div>
        <Link href="/essays/analyze" className="btn-primary">
          <Plus size={16} /> Analyze essay
        </Link>
      </div>

      {loading ? (
        <div className="card text-center py-12 text-slate-400 text-sm">Loading…</div>
      ) : essayList.length === 0 ? (
        <div className="card text-center py-16">
          <BookOpen size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No essays yet. Paste your first essay to get feedback.</p>
          <Link href="/essays/analyze" className="btn-primary mx-auto">Analyze first essay</Link>
        </div>
      ) : (
        <div className="divide-y divide-surface-border border border-surface-border rounded-xl overflow-hidden bg-white">
          {essayList.map(essay => (
            <div key={essay.id} className="flex items-center gap-4 p-4 hover:bg-surface-muted transition-all">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{essay.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="badge-gray">{typeLabel(essay.type)}</span>
                  {essay.subject && <span className="text-xs text-slate-400">{essay.subject}</span>}
                  <span className="text-xs text-slate-400">{formatDate(essay.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {essay.feedback ? (
                  <span className={`badge border text-xs ${scoreBg(essay.feedback.overall_score)}`}>
                    {essay.feedback.grade_estimate}
                  </span>
                ) : (
                  <span className="badge-gray">Not analyzed</span>
                )}
                <button
                  onClick={() => handleDelete(essay.id)}
                  className="btn-ghost p-1.5 text-slate-300 hover:text-red-500"
                  aria-label="Delete essay"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
