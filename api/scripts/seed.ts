/**
 * IB Companion — Test seed script
 *
 * Creates two test accounts via the local API, then seeds additional content
 * directly into the local D1 database.
 *
 * Usage:
 *   npm run db:seed          (runs against localhost:8787)
 *   npm run db:seed:local    (wrangler d1 execute — no API needed)
 */

const API = process.env.API_URL ?? 'http://localhost:8787'

interface RegisterResponse {
  success: boolean
  data?: { token: string; user: { id: string; email: string } }
  error?: string
}

async function register(email: string, name: string, password: string): Promise<RegisterResponse> {
  const res = await fetch(`${API}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, password }),
  })
  return res.json() as Promise<RegisterResponse>
}

async function main() {
  console.log(`\n🌱  IB Companion — seeding test data against ${API}\n`)

  // ─── Create test users ────────────────────────────────────────────────────
  const testAccounts = [
    { email: 'free@test.ib',  name: 'Free Student',  password: 'TestPassword123!' },
    { email: 'pro@test.ib',   name: 'Pro Student',    password: 'TestPassword123!' },
    { email: 'admin@test.ib', name: 'Test Admin',     password: 'TestPassword123!' },
  ]

  for (const account of testAccounts) {
    const res = await register(account.email, account.name, account.password)
    if (res.success) {
      console.log(`  ✅  Created: ${account.email}  (id: ${res.data!.user.id})`)
    } else if (res.error?.includes('already registered')) {
      console.log(`  ⏭   Skipped: ${account.email} (already exists)`)
    } else {
      console.error(`  ❌  Failed:  ${account.email} — ${res.error}`)
    }
  }

  console.log('\n  ℹ️   Sample essays/flashcards/IA plans are in migrations/seed_test_data.sql')
  console.log('      Apply with: npm run db:seed:sql\n')
}

main().catch(err => { console.error(err); process.exit(1) })
