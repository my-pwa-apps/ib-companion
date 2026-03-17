import { redirect } from 'next/navigation'

// /dashboard → /dashboard (app group)
export default function DashboardRedirect() {
  redirect('/dashboard')
}
