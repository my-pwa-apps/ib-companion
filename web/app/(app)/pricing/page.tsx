'use client'

import Link from 'next/link'
import { Check, Zap, Crown, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    name: 'Free',
    price: '£0',
    period: 'forever',
    description: 'Great for getting started with IB revision.',
    features: [
      '10 AI queries per day',
      'Essay feedback (TOK, EE, IA, IO)',
      'Question helper',
      'AI flashcard generation',
      'Oral practice sessions',
      'IA planner',
    ],
    cta: 'Current plan',
    highlight: false,
    plan: 'free' as const,
  },
  {
    name: 'Pro',
    price: '£8',
    period: '/ month',
    description: 'Unlimited access for serious IB students.',
    features: [
      'Unlimited AI queries',
      'Everything in Free',
      'Priority AI model access',
      'Longer essay analysis (up to 20k words)',
      'Advanced quiz analytics',
      'Email support',
    ],
    cta: 'Coming soon',
    highlight: true,
    plan: 'pro' as const,
  },
]

export default function PricingPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Plans & Pricing</h1>
        <p className="text-slate-500 mt-1">Choose the plan that fits your study needs.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {PLANS.map(plan => (
          <div
            key={plan.name}
            className={cn(
              'card relative overflow-hidden transition-all',
              plan.highlight
                ? 'border-brand-300 shadow-glow'
                : 'border-surface-border',
            )}
          >
            {plan.highlight && (
              <div className="absolute top-0 right-0 px-3 py-1 text-xs font-bold bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-bl-xl">
                Recommended
              </div>
            )}

            <div className="flex items-center gap-2 mb-2">
              {plan.highlight
                ? <Crown size={18} className="text-brand-500" />
                : <Zap size={18} className="text-slate-400" />
              }
              <h2 className="font-bold text-slate-900 text-lg">{plan.name}</h2>
            </div>

            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
              <span className="text-sm text-slate-500">{plan.period}</span>
            </div>
            <p className="text-sm text-slate-500 mb-5">{plan.description}</p>

            <ul className="space-y-2.5 mb-6">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                  <Check size={15} className={cn(
                    'mt-0.5 flex-shrink-0',
                    plan.highlight ? 'text-brand-500' : 'text-emerald-500',
                  )} />
                  {f}
                </li>
              ))}
            </ul>

            <button
              disabled
              className={cn(
                'w-full py-2.5 rounded-xl text-sm font-semibold transition-all',
                plan.highlight
                  ? 'btn-primary opacity-75 cursor-not-allowed'
                  : 'btn-secondary opacity-75 cursor-not-allowed',
              )}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400">
        Pro plan payment integration coming soon. Free plan has no time limit.
      </p>
    </div>
  )
}
