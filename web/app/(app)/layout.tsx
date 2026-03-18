'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, BookOpen, MessageSquare, Brain,
  Mic, FlaskConical, LogOut, ChevronRight, Menu, X, User
} from 'lucide-react'
import { clearToken, getToken } from '@/lib/utils'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/essays',       label: 'Essay Feedback', icon: BookOpen },
  { href: '/questions',    label: 'Questions',      icon: MessageSquare },
  { href: '/flashcards',   label: 'Flashcards',     icon: Brain },
  { href: '/practice',     label: 'Oral Practice',  icon: Mic },
  { href: '/ia-planner',   label: 'IA Planner',     icon: FlaskConical },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!getToken()) router.replace('/login')
  }, [router])

  function handleLogout() {
    clearToken()
    router.push('/login')
  }

  return (
    <div className="flex h-screen mesh-bg overflow-hidden">

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 flex flex-col',
        'bg-white/40 backdrop-blur-2xl border-r border-white/30 shadow-glass',
        'transition-transform duration-300 ease-in-out',
        'lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/20">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-md shadow-brand-500/25">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">IB <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">Companion</span></span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden btn-ghost p-1" aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {NAV_ITEMS.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      active
                        ? 'bg-gradient-to-r from-brand-500/10 to-purple-500/10 text-brand-700 shadow-sm border border-brand-200/30 backdrop-blur-sm'
                        : 'text-slate-600 hover:bg-white/50 hover:text-slate-900 hover:shadow-sm',
                    )}
                  >
                    <item.icon size={17} />
                    {item.label}
                    {active && <ChevronRight size={14} className="ml-auto text-brand-400" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom: profile + logout */}
        <div className="p-3 border-t border-white/20 space-y-1">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-white/50 transition-all"
          >
            <User size={17} /> Profile
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50/80 hover:text-red-600 transition-all duration-200"
          >
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="h-16 bg-white/40 backdrop-blur-xl border-b border-white/20 flex items-center px-4 gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost p-1" aria-label="Open sidebar">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <BookOpen size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-900">IB <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">Companion</span></span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
