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
    <div className="flex h-screen bg-surface-muted overflow-hidden">

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-surface-border flex flex-col',
        'transition-transform duration-200 ease-in-out',
        'lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-surface-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <BookOpen size={20} className="text-brand-500" />
            <span className="font-bold text-slate-900">IB <span className="text-brand-500">Companion</span></span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden btn-ghost p-1">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                      active
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-surface-muted hover:text-slate-900',
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
        <div className="p-3 border-t border-surface-border space-y-1">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-surface-muted"
          >
            <User size={17} /> Profile
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="h-16 bg-white border-b border-surface-border flex items-center px-4 gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost p-1">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-slate-900">IB Companion</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
