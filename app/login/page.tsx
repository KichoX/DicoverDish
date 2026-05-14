'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, UtensilsCrossed, Loader2, ShieldCheck, Store, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { authApi } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import type { UserRole, User as StoreUser } from '@/lib/store'

// Fallback demo accounts — work without the backend
const DEMO_ACCOUNTS: Record<string, { password: string; user: StoreUser }> = {
  'admin@discoverdish.com': {
    password: 'SuperAdmin2026!',
    user: { id: 'sa-1', name: 'Super Admin', email: 'admin@discoverdish.com', role: 'superadmin' },
  },
  'kimi@matera.de': {
    password: 'matera2026',
    user: { id: 'admin-1', name: 'Kimi', email: 'kimi@matera.de', role: 'admin', restaurantId: 'a0000000-0000-0000-0000-000000000009', restaurantSlug: 'ristorante-matera' },
  },
  'laura@example.com': {
    password: 'Client2026!',
    user: { id: 'client-1', name: 'Laura Martinez', email: 'laura@example.com', role: 'client' },
  },
}

const ACCOUNTS_INFO = [
  { icon: ShieldCheck, label: 'Super Admin', email: 'admin@discoverdish.com',       password: 'SuperAdmin2026!', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400' },
  { icon: Store,       label: 'Restaurant',  email: 'kimi@matera.de',               password: 'matera2026',      color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400' },
  { icon: User,        label: 'Client',      email: 'laura@example.com',            password: 'Client2026!',     color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400' },
]

function redirect(role: UserRole, router: ReturnType<typeof useRouter>) {
  if (role === 'superadmin') router.push('/super-admin')
  else if (role === 'admin') router.push('/admin')
  else router.push('/')
}

export default function LoginPage() {
  const router = useRouter()
  const { loginWithToken } = useAppStore()

  const { demoCredentials } = useAppStore()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const normalizedEmail = email.trim().toLowerCase()

    try {
      const { accessToken, user } = await authApi.login(normalizedEmail, password)
      const role = user.role.toLowerCase() as UserRole
      loginWithToken(accessToken, { id: user.id, name: user.name, email: user.email, role, restaurantId: user.restaurantId, restaurantSlug: user.restaurantSlug })
      redirect(role, router)
      return
    } catch (apiErr) {
      const isNetworkError =
        apiErr instanceof TypeError ||
        (apiErr instanceof Error && /fetch|network|Failed/i.test(apiErr.message))

      if (!isNetworkError) {
        setError('Invalid email or password.')
        setLoading(false)
        return
      }
    }

    // Backend not reachable — check hardcoded demo accounts first
    const demo = DEMO_ACCOUNTS[normalizedEmail] ?? demoCredentials[normalizedEmail]
    if (demo && demo.password === password) {
      loginWithToken('demo-token', demo.user)
      redirect(demo.user.role, router)
      return
    }

    setError('Invalid email or password.')
    setLoading(false)
  }

  const fillAccount = (email: string, password: string) => {
    setEmail(email)
    setPassword(password)
    setError(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-5">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">DiscoverDish</span>
        </div>

        {/* Quick-fill account cards */}
        <div className="grid grid-cols-3 gap-2">
          {ACCOUNTS_INFO.map(({ icon: Icon, label, email: e, password: p, color }) => (
            <button
              key={e}
              type="button"
              onClick={() => fillAccount(e, p)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border hover:border-primary/40 transition-colors text-center ${color}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-semibold leading-tight">{label}</span>
            </button>
          ))}
        </div>

        {/* Login card */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-12 rounded-xl"
                  placeholder="you@example.com"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-12 rounded-xl pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </Field>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</div>
              )}

              <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-semibold text-base mt-2">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in…</> : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors underline underline-offset-2">
                Back to home
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
