'use client'

import { AlertTriangle } from 'lucide-react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <AlertTriangle size={40} className="text-amber-500 mb-4" />
      <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
      <p className="text-slate-500 text-sm mb-6 max-w-md">
        An unexpected error occurred. Please try again or return to the dashboard.
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
        <a href="/dashboard" className="btn-secondary">
          Dashboard
        </a>
      </div>
    </div>
  )
}
