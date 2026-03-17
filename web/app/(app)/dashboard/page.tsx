'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen, MessageSquare, Brain, Mic, FlaskConical,
  TrendingUp, Zap, ArrowRight, Clock
} from 'lucide-react'
import { user as userApi } from '@/lib/api'
import type { User, UserStats } from '@/lib/types'
import { cn, formatDate, scoreColor } from '@/lib/utils'

const QUICK_ACTIONS = [
  { href: '/essays/analyze', label: 'Analyze Essay',   icon: BookOpen,    color: 'bg-brand-50 text-brand-600 hover:bg-brand-100' },
  { href: '/questions',      label: 'Get Help',         icon: MessageSquare, color: 'bg-violet-50 text-violet-600 hover:bg-violet-100' },
  { href: '/flashcards',     label: 'Study Cards',      icon: Brain,       color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
  { href: '/practice',       label: 'Practice Oral',    icon: Mic,         color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
  { href: '/ia-planner',     label: 'Plan IA',          icon: FlaskConical, color: 'bg-rose-50 text-rose-600 hover:bg-rose-100' },
]

export default function DashboardPage() {
  const [userData, setUserData] = useState<User | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)

  useEffect(() => {
    Promise.all([userApi.me(), userApi.stats()])
      .then(([u, s]) => { setUserData(u.data); setStats(s.data) })
      .catch(() => {})
  }, [])

  const queriesUsed = userData
    ? userData.plan === 'pro'
      ? null
      : userData.queries_today
    : null

  const queryLimit = userData?.daily_limit ?? 10
  const pct = queriesUsed !== null ? Math.min((queriesUsed / queryLimit) * 100, 100) : 0

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {userData ? `Hey, ${userData.name.split(' ')[0]} 👋` : 'Dashboard'}
        </h1>
        <p className="text-slate-500 mt-1">What would you like to work on today?</p>
      </div>

      {/* Plan banner */}
      {userData?.plan === 'free' && (
        <div className="card mb-6 flex items-center justify-between gap-4 bg-gradient-to-r from-brand-50 to-violet-50 border-brand-200">
          <div className="flex items-center gap-3">
            <Zap size={18} className="text-brand-500" />
            <div>
              <p className="text-sm font-medium text-slate-900">
                {queriesUsed ?? 0}/{queryLimit} free queries used today
              </p>
              <div className="mt-1.5 w-48 h-1.5 bg-white/70 rounded-full overflow-hidden border border-brand-200">
                <div
                  className={cn('h-full rounded-full transition-all', pct > 80 ? 'bg-amber-400' : 'bg-brand-400')}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
          <Link href="/pricing" className="btn-primary text-xs py-2 whitespace-nowrap">
            Upgrade to Pro — €8/mo
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {QUICK_ACTIONS.map(action => (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              'flex flex-col items-center gap-2.5 p-4 rounded-xl transition-all text-center group',
              action.color,
            )}
          >
            <action.icon size={22} />
            <span className="text-xs font-semibold">{action.label}</span>
            <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={BookOpen} label="Essays Analyzed" value={String(stats.essays_analyzed)} color="brand" />
          <StatCard icon={Brain} label="Flashcard Decks" value={String(stats.flashcard_decks)} color="emerald" />
          <StatCard icon={Mic} label="Practice Sessions" value={String(stats.practice_sessions)} color="amber" />
          <StatCard
            icon={TrendingUp}
            label="Quiz Average"
            value={stats.quiz_avg_score !== null ? `${Math.round(stats.quiz_avg_score)}%` : '—'}
            color="violet"
          />
        </div>
      )}

      {/* Getting started guide */}
      <div className="card">
        <h2 className="font-semibold text-slate-900 mb-4">Getting started</h2>
        <div className="space-y-3">
          {[
            { step: 1, label: 'Paste an essay for instant rubric-aligned feedback', href: '/essays/analyze', done: (stats?.essays_analyzed ?? 0) > 0 },
            { step: 2, label: 'Generate flashcards for your next topic', href: '/flashcards',       done: (stats?.flashcard_decks ?? 0) > 0 },
            { step: 3, label: 'Practice an oral with the AI examiner',   href: '/practice',         done: (stats?.practice_sessions ?? 0) > 0 },
            { step: 4, label: 'Build an IA plan for your subject',        href: '/ia-planner',      done: (stats?.ia_plans ?? 0) > 0 },
          ].map(item => (
            <Link
              key={item.step}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-muted transition-all"
            >
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                item.done ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-100 text-brand-600',
              )}>
                {item.done ? '✓' : item.step}
              </div>
              <span className={cn('text-sm', item.done ? 'text-slate-400 line-through' : 'text-slate-700')}>
                {item.label}
              </span>
              <ArrowRight size={14} className="ml-auto text-slate-300" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string
}) {
  const colorMap: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  }
  return (
    <div className="card">
      <div className={cn('inline-flex p-2 rounded-lg mb-3', colorMap[color])}>
        <Icon size={16} />
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}
