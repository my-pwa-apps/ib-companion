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
  { href: '/essays/analyze', label: 'Analyze Essay',   icon: BookOpen,    gradient: 'from-brand-500 to-blue-600',    glow: 'shadow-brand-500/20' },
  { href: '/questions',      label: 'Get Help',         icon: MessageSquare, gradient: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/20' },
  { href: '/flashcards',     label: 'Study Cards',      icon: Brain,       gradient: 'from-emerald-500 to-teal-600',  glow: 'shadow-emerald-500/20' },
  { href: '/practice',       label: 'Practice Oral',    icon: Mic,         gradient: 'from-amber-500 to-orange-600',  glow: 'shadow-amber-500/20' },
  { href: '/ia-planner',     label: 'Plan IA',          icon: FlaskConical, gradient: 'from-rose-500 to-pink-600',    glow: 'shadow-rose-500/20' },
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
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {userData ? `Hey, ${userData.name.split(' ')[0]}` : 'Dashboard'}
        </h1>
        <p className="text-slate-500 mt-1">What would you like to work on today?</p>
      </div>

      {/* Plan banner */}
      {userData?.plan === 'free' && (
        <div className="glass p-5 flex items-center justify-between gap-4 bg-gradient-to-r from-brand-50/80 to-violet-50/80 border-brand-200/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-md shadow-brand-500/20">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {queriesUsed ?? 0}/{queryLimit} free queries used today
              </p>
              <div className="mt-1.5 w-48 h-2 bg-white/60 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', pct > 80 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-brand-400 to-violet-500')}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
          <Link href="/pricing" className="btn-primary text-xs py-2 whitespace-nowrap">
            Upgrade to Pro
          </Link>
        </div>
      )}

      {/* Quick actions — floating gradient buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {QUICK_ACTIONS.map(action => (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              'group flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-300',
              'bg-white/50 backdrop-blur-sm border border-white/30',
              'hover:-translate-y-1 hover:shadow-float',
              `hover:${action.glow}`,
            )}
          >
            <div className={cn(
              'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
              'shadow-lg transition-transform duration-300 group-hover:scale-110',
              action.gradient, action.glow,
            )}>
              <action.icon size={20} className="text-white" />
            </div>
            <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">{action.label}</span>
            <ArrowRight size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={BookOpen} label="Essays Analyzed" value={String(stats.essays_analyzed)} gradient="from-brand-500 to-blue-600" />
          <StatCard icon={Brain} label="Flashcard Decks" value={String(stats.flashcard_decks)} gradient="from-emerald-500 to-teal-600" />
          <StatCard icon={Mic} label="Practice Sessions" value={String(stats.practice_sessions)} gradient="from-amber-500 to-orange-600" />
          <StatCard
            icon={TrendingUp}
            label="Quiz Average"
            value={stats.quiz_avg_score !== null ? `${Math.round(stats.quiz_avg_score)}%` : '—'}
            gradient="from-violet-500 to-purple-600"
          />
        </div>
      )}

      {/* Getting started guide */}
      <div className="glass p-6">
        <h2 className="font-bold text-slate-900 mb-4 text-lg">Getting started</h2>
        <div className="space-y-2">
          {[
            { step: 1, label: 'Paste an essay for instant rubric-aligned feedback', href: '/essays/analyze', done: (stats?.essays_analyzed ?? 0) > 0 },
            { step: 2, label: 'Generate flashcards for your next topic', href: '/flashcards',       done: (stats?.flashcard_decks ?? 0) > 0 },
            { step: 3, label: 'Practice an oral with the AI examiner',   href: '/practice',         done: (stats?.practice_sessions ?? 0) > 0 },
            { step: 4, label: 'Build an IA plan for your subject',        href: '/ia-planner',      done: (stats?.ia_plans ?? 0) > 0 },
          ].map(item => (
            <Link
              key={item.step}
              href={item.href}
              className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-white/50 transition-all duration-200 group"
            >
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all',
                item.done
                  ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                  : 'bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-sm shadow-brand-500/20',
              )}>
                {item.done ? '✓' : item.step}
              </div>
              <span className={cn('text-sm font-medium', item.done ? 'text-slate-400 line-through' : 'text-slate-700')}>
                {item.label}
              </span>
              <ArrowRight size={14} className="ml-auto text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, gradient }: {
  icon: React.ElementType; label: string; value: string; gradient: string
}) {
  return (
    <div className="glass p-5 group hover:-translate-y-0.5 transition-all duration-300">
      <div className={cn(
        'inline-flex p-2.5 rounded-xl bg-gradient-to-br mb-3',
        'shadow-md transition-transform duration-300 group-hover:scale-105',
        gradient,
      )}>
        <Icon size={16} className="text-white" />
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs font-medium text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}
