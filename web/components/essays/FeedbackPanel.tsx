import type { AIEssayFeedback } from '@/lib/types'
import { cn, scoreBg } from '@/lib/utils'
import { CheckCircle, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react'

interface Props { feedback: AIEssayFeedback }

export function FeedbackPanel({ feedback }: Props) {
  return (
    <div className="space-y-4">
      {/* Overall */}
      <div className="card">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="font-semibold text-slate-900">Overall Assessment</h2>
            <p className="text-xs text-slate-500 mt-0.5">{feedback.summary}</p>
          </div>
          <div className={cn('badge border px-3 py-1 text-sm font-bold ml-4', scoreBg(feedback.overall_score))}>
            {feedback.grade_estimate}
          </div>
        </div>

        {/* Score bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Score</span><span>{feedback.overall_score}/100</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                feedback.overall_score >= 80 ? 'bg-emerald-400' :
                feedback.overall_score >= 60 ? 'bg-amber-400' : 'bg-red-400',
              )}
              style={{ width: `${feedback.overall_score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Criteria */}
      <div className="card">
        <h3 className="font-semibold text-slate-900 mb-4">Criterion Breakdown</h3>
        <div className="space-y-5">
          {feedback.criteria.map(criterion => (
            <div key={criterion.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">{criterion.name}</span>
                <span className={cn('text-sm font-bold', scoreBg(criterion.score / criterion.max_score * 100).split(' ')[0])}>
                  {criterion.score}/{criterion.max_score}
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div
                  className={cn(
                    'h-full rounded-full',
                    criterion.score / criterion.max_score >= 0.8 ? 'bg-emerald-400' :
                    criterion.score / criterion.max_score >= 0.6 ? 'bg-amber-400' : 'bg-red-400',
                  )}
                  style={{ width: `${(criterion.score / criterion.max_score) * 100}%` }}
                />
              </div>
              {criterion.suggestions.length > 0 && (
                <p className="text-xs text-slate-500 italic">{criterion.suggestions[0]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Strengths / Weaknesses */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={15} className="text-emerald-500" />
            <h3 className="font-semibold text-slate-900 text-sm">Strengths</h3>
          </div>
          <ul className="space-y-1.5">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5">•</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={15} className="text-amber-500" />
            <h3 className="font-semibold text-slate-900 text-sm">Weaknesses</h3>
          </div>
          <ul className="space-y-1.5">
            {feedback.weaknesses.map((w, i) => (
              <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                <span className="text-amber-400 mt-0.5">•</span> {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Improvement suggestions */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={15} className="text-brand-500" />
          <h3 className="font-semibold text-slate-900 text-sm">Improvement Suggestions</h3>
        </div>
        <ol className="space-y-2">
          {feedback.improvement_suggestions.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      {/* Next steps */}
      {feedback.next_steps.length > 0 && (
        <div className="card border-brand-200 bg-brand-50/50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} className="text-brand-600" />
            <h3 className="font-semibold text-brand-800 text-sm">Next Steps</h3>
          </div>
          <ul className="space-y-1.5">
            {feedback.next_steps.map((s, i) => (
              <li key={i} className="text-xs text-brand-700 flex items-start gap-1.5">
                <span className="mt-0.5">→</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
