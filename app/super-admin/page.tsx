'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, Store, ShoppingBag, CalendarDays, TrendingUp,
  Plus, X, Eye, EyeOff, Loader2, RefreshCw, ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { useAppStore } from '@/lib/store'
import { superAdminApi, type PlatformStats, type RestaurantAccount } from '@/lib/api'

// ── Stat card ────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-5 flex items-start gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-0.5 truncate">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Bar chart for daily orders ────────────────────────────────────────
function OrdersChart({ data }: { data: { date: string; count: number }[] }) {
  if (!data.length) return <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No data</div>
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="h-40 flex items-end gap-1.5 w-full">
      {data.map((d) => {
        const pct = (d.count / max) * 100
        const label = new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">{d.count}</div>
            <div
              className="w-full rounded-t-sm bg-primary/80 hover:bg-primary transition-colors min-h-[3px]"
              style={{ height: `${Math.max(pct, 3)}%` }}
            />
            <div className="text-[9px] text-muted-foreground rotate-[-40deg] origin-top-left translate-y-1 hidden sm:block whitespace-nowrap">
              {label}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Revenue line chart ────────────────────────────────────────────────
function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  if (!data.length) return null
  const max = Math.max(...data.map(d => d.revenue), 1)
  const W = 400
  const H = 100
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - (d.revenue / max) * (H - 10) - 5
    return `${x},${y}`
  })
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24" preserveAspectRatio="none">
      <defs>
        <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M ${pts.join(' L ')} L ${W},${H} L 0,${H} Z`}
        fill="url(#rev-fill)"
      />
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Create account modal ───────────────────────────────────────────────
function CreateAccountModal({
  open,
  token,
  onClose,
  onCreated,
}: {
  open: boolean
  token: string
  onClose: () => void
  onCreated: (acc: RestaurantAccount) => void
}) {
  const [form, setForm] = useState({
    restaurantName: '',
    adminName: '',
    email: '',
    password: '',
    address: '',
    phone: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const addDemoCredential = useAppStore(s => s.addDemoCredential)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.restaurantName || !form.adminName || !form.email || !form.password) {
      setError('All required fields must be filled.')
      return
    }
    setLoading(true)
    try {
      const acc = await superAdminApi.createAccount(token, {
        restaurantName: form.restaurantName,
        adminName: form.adminName,
        email: form.email,
        password: form.password,
        address: form.address || undefined,
        phone: form.phone || undefined,
      })
      onCreated(acc)
    } catch {
      // Backend not reachable — create locally for demo
      const acc: RestaurantAccount = {
        userId: `local-${Date.now()}`,
        adminName: form.adminName,
        email: form.email,
        restaurantId: `local-${Date.now()}`,
        restaurantName: form.restaurantName,
        restaurantSlug: form.restaurantName.toLowerCase().replace(/\s+/g, '-'),
        createdAt: new Date().toISOString(),
        totalOrders: 0,
        totalRevenue: 0,
        imageUrl: null,
        address: form.address || null,
        phone: form.phone || null,
        isOpen: false,
      }
      addDemoCredential(form.email, {
        password: form.password,
        user: { id: acc.userId, name: form.adminName, email: form.email, role: 'admin', restaurantId: acc.restaurantId },
      })
      onCreated(acc)
    } finally {
      setLoading(false)
      onClose()
      setForm({ restaurantName: '', adminName: '', email: '', password: '', address: '', phone: '' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">New Restaurant Account</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>Restaurant Name *</FieldLabel>
              <Input value={form.restaurantName} onChange={set('restaurantName')} className="h-10 rounded-xl" placeholder="Bella Vista" required />
            </Field>
            <Field>
              <FieldLabel>Admin Name *</FieldLabel>
              <Input value={form.adminName} onChange={set('adminName')} className="h-10 rounded-xl" placeholder="Maria Rossi" required />
            </Field>
          </div>
          <Field>
            <FieldLabel>Email *</FieldLabel>
            <Input type="email" value={form.email} onChange={set('email')} className="h-10 rounded-xl" placeholder="admin@restaurant.com" required />
          </Field>
          <Field>
            <FieldLabel>Password *</FieldLabel>
            <div className="relative">
              <Input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                className="h-10 rounded-xl pr-10"
                placeholder="Min 8 characters"
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>Address</FieldLabel>
              <Input value={form.address} onChange={set('address')} className="h-10 rounded-xl" placeholder="Street 1, City" />
            </Field>
            <Field>
              <FieldLabel>Phone</FieldLabel>
              <Input value={form.phone} onChange={set('phone')} className="h-10 rounded-xl" placeholder="+49..." />
            </Field>
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</div>
          )}
          <Button type="submit" disabled={loading} className="w-full h-10 rounded-xl">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</> : 'Create Account'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Main page ──────────────────────────────────────────────────────────
export default function SuperAdminPage() {
  const router = useRouter()
  const { token, user } = useAppStore()
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [accounts, setAccounts] = useState<RestaurantAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const load = useCallback(async () => {
    if (!token) { router.push('/login'); return }
    setLoading(true)
    setError(null)
    try {
      const [s, a] = await Promise.all([
        superAdminApi.getStats(token),
        superAdminApi.getAccounts(token),
      ])
      setStats(s)
      setAccounts(a)
    } catch {
      setError('Failed to load data. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }, [token, router])

  useEffect(() => {
    if (!token || user?.role !== 'superadmin') {
      router.push('/login')
      return
    }
    load()
  }, [token, user, router, load])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground text-sm text-center max-w-sm">{error}</p>
        <Button variant="outline" onClick={load} className="rounded-xl">
          <RefreshCw className="w-4 h-4 mr-2" />Retry
        </Button>
      </div>
    )
  }

  const revenue = stats?.totalRevenue ?? 0

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Overview</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} className="rounded-xl">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => setShowCreate(true)} className="rounded-xl h-9 px-4 text-sm">
            <Plus className="w-4 h-4 mr-1.5" />New Restaurant
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}        label="Total Users"        value={stats?.totalUsers ?? 0}        color="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400" />
        <StatCard icon={Store}        label="Restaurants"        value={stats?.totalRestaurants ?? 0}  color="bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400" />
        <StatCard icon={ShoppingBag}  label="Total Orders"       value={stats?.totalOrders ?? 0}       color="bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400" />
        <StatCard icon={CalendarDays} label="Reservations"       value={stats?.totalReservations ?? 0} color="bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400" />
      </div>

      {/* Revenue highlight */}
      <Card className="rounded-2xl">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue (all time)</p>
            <p className="text-3xl font-bold mt-0.5">
              €{revenue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders bar chart */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Orders — last 14 days</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-6 px-4">
            <OrdersChart data={stats?.ordersLast14Days ?? []} />
          </CardContent>
        </Card>

        {/* Revenue line chart */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Revenue — last 14 days</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-2 px-4">
            <RevenueChart data={stats?.ordersLast14Days ?? []} />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              {stats?.ordersLast14Days.length ? (
                <>
                  <span>{new Date(stats.ordersLast14Days[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span>{new Date(stats.ordersLast14Days[stats.ordersLast14Days.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top restaurants */}
      {(stats?.topRestaurants?.length ?? 0) > 0 && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Restaurants</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {stats!.topRestaurants.map((r, i) => (
                <div key={r.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="w-6 text-center text-sm font-bold text-muted-foreground">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.orders} orders</p>
                  </div>
                  <span className="text-sm font-semibold">€{r.revenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Restaurant accounts */}
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Restaurant Accounts</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowCreate(true)} className="rounded-xl h-8 text-xs px-3">
            <Plus className="w-3.5 h-3.5 mr-1" />Add
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {accounts.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No restaurant accounts yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {accounts.map((acc) => (
                <div key={acc.userId} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Store className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{acc.restaurantName}</p>
                    <p className="text-xs text-muted-foreground truncate">{acc.adminName} · {acc.email}</p>
                  </div>
                  <Badge variant="outline" className="text-xs hidden sm:flex">{acc.restaurantSlug}</Badge>
                  <span className="text-xs text-muted-foreground hidden md:block">
                    {new Date(acc.createdAt).toLocaleDateString()}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateAccountModal
        open={showCreate}
        token={token ?? ''}
        onClose={() => setShowCreate(false)}
        onCreated={(acc) => setAccounts(prev => [acc, ...prev])}
      />
    </div>
  )
}
