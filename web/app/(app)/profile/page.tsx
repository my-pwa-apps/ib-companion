'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { user as userApi, auth as authApi } from '@/lib/api'
import type { User, UserStats } from '@/lib/types'
import { clearToken, cn, formatDate } from '@/lib/utils'
import { User as UserIcon, Mail, Calendar, Shield, Zap, LogOut, Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [userData, setUserData] = useState<User | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([userApi.me(), userApi.stats()])
      .then(([u, s]) => {
        setUserData(u.data)
        setStats(s.data)
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  async function handleLogout() {
    try {
      await authApi.logout()
    } catch {
      // Logout best-effort
    }
    clearToken()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin text-brand-400" />
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="p-6 text-center text-slate-500">
        Unable to load profile. Please try logging in again.
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-500 mt-1">Your account details and usage.</p>
      </div>

      {/* Account info */}
      <div className="card space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <UserIcon size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{userData.name}</h2>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Mail size={14} />
              {userData.email}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-surface-border">
          <div className="flex items-center gap-3">
            <Shield size={16} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Plan</p>
              <p className={cn(
                'text-sm font-semibold',
                userData.plan === 'pro' ? 'text-brand-600' : 'text-slate-700',
              )}>
                {userData.plan === 'pro' ? 'Pro' : 'Free'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Member since</p>
              <p className="text-sm font-semibold text-slate-700">{formatDate(userData.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage */}
      {userData.plan === 'free' && (
        <div className="card bg-gradient-to-r from-brand-50/80 to-violet-50/80 border-brand-200/30">
          <div className="flex items-center gap-3 mb-3">
            <Zap size={16} className="text-brand-500" />
            <p className="text-sm font-semibold text-slate-900">
              Daily Usage: {userData.queries_today} / {userData.daily_limit ?? 10} queries
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Free plan includes {userData.daily_limit ?? 10} AI queries per day. Resets at midnight UTC.
          </p>
        </div>
      )}

      {/* Activity stats */}
      {stats && (
        <div className="card">
          <h3 className="font-semibold text-slate-900 mb-4">Activity</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatItem label="Essays" value={String(stats.essays_analyzed)} />
            <StatItem label="Flashcard Decks" value={String(stats.flashcard_decks)} />
            <StatItem label="Practice Sessions" value={String(stats.practice_sessions)} />
            <StatItem label="IA Plans" value={String(stats.ia_plans)} />
            <StatItem
              label="Quiz Average"
              value={stats.quiz_avg_score !== null ? `${Math.round(stats.quiz_avg_score)}%` : '—'}
            />
          </div>
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-600 bg-red-50/80 hover:bg-red-100 border border-red-200/50 transition-all"
      >
        <LogOut size={16} /> Sign out
      </button>
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}
