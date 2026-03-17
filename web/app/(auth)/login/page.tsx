'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { auth as authApi } from '@/lib/api'
import { setToken } from '@/lib/utils'
import { BookOpen, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      setToken(res.data.token)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      router.push('/dashboard')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Floating orbs */}
      <div className="orb w-96 h-96 bg-brand-400 -top-48 -left-48 animate-float-slow" />
      <div className="orb w-80 h-80 bg-purple-400 -bottom-40 -right-40 animate-float-slower" />
      <div className="orb w-64 h-64 bg-pink-300 top-1/3 right-1/4 animate-float" />

      <div className="w-full max-w-sm relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <BookOpen className="text-white" size={20} />
            </div>
            <span className="font-bold text-xl text-slate-900">IB <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">Companion</span></span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to continue studying</p>
        </div>

        <div className="glass p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@school.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
