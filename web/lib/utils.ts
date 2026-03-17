import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('ib_token')
}

export function setToken(token: string) {
  localStorage.setItem('ib_token', token)
}

export function clearToken() {
  localStorage.removeItem('ib_token')
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-600'
}

export function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (score >= 60) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-red-50 text-red-700 border-red-200'
}

export const SUBJECTS = [
  'Biology', 'Chemistry', 'Physics', 'Environmental Systems',
  'Mathematics AA', 'Mathematics AI',
  'History', 'Geography', 'Economics', 'Psychology',
  'Business Management', 'Philosophy', 'Global Politics',
  'English A Literature', 'English A Language & Literature', 'English B',
  'French', 'Spanish', 'German', 'Mandarin',
  'Visual Arts', 'Music', 'Theatre', 'Film',
  'Computer Science', 'Design Technology',
  'Theory of Knowledge',
] as const

export const ESSAY_TYPES = [
  { value: 'tok', label: 'Theory of Knowledge' },
  { value: 'ee',  label: 'Extended Essay' },
  { value: 'ia',  label: 'Internal Assessment' },
  { value: 'io',  label: 'Individual Oral' },
  { value: 'other', label: 'Other / General' },
] as const
