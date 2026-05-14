'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, RefreshCw, Loader2, Store, Eye, EyeOff,
  ShoppingBag, TrendingUp, MapPin, Phone, ExternalLink,
  X, CheckCircle2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { useAppStore } from '@/lib/store'
import { superAdminApi, type RestaurantAccount } from '@/lib/api'

function useCreateAccount() {
  return useAppStore(s => s.addDemoCredential)
}

// ── Create Account Modal ──────────────────────────────────────────────
function CreateAccountModal({
  open, token, onClose, onCreated,
}: {
  open: boolean
  token: string
  onClose: () => void
  onCreated: (acc: RestaurantAccount) => void
}) {
  const [form, setForm] = useState({ restaurantName: '', adminName: '', email: '', password: '', address: '', phone: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const addDemoCredential = useCreateAccount()

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

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
      setSuccess(true)
      setTimeout(() => { setSuccess(false); onClose(); setForm({ restaurantName: '', adminName: '', email: '', password: '', address: '', phone: '' }) }, 1200)
    } catch {
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
      setSuccess(true)
      setTimeout(() => { setSuccess(false); onClose(); setForm({ restaurantName: '', adminName: '', email: '', password: '', address: '', phone: '' }) }, 1200)
    } finally {
      setLoading(false)
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
        {success ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="font-medium text-green-600">Account created!</p>
          </div>
        ) : (
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
              <FieldLabel>Admin Email *</FieldLabel>
              <Input type="email" value={form.email} onChange={set('email')} className="h-10 rounded-xl" placeholder="admin@restaurant.com" required />
            </Field>
            <Field>
              <FieldLabel>Password *</FieldLabel>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={form.password} onChange={set('password')}
                  className="h-10 rounded-xl pr-10" placeholder="Min 8 characters" required
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
                <Input value={form.phone} onChange={set('phone')} className="h-10 rounded-xl" placeholder="+49…" />
              </Field>
            </div>
            {error && <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full h-10 rounded-xl">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</> : 'Create Account'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Restaurant card ───────────────────────────────────────────────────
function RestaurantCard({ acc }: { acc: RestaurantAccount }) {
  const [showCreds, setShowCreds] = useState(false)

  return (
    <Card className="rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Image / placeholder header */}
      <div className="h-32 bg-muted relative flex items-center justify-center overflow-hidden">
        {acc.imageUrl ? (
          <img src={acc.imageUrl} alt={acc.restaurantName} className="w-full h-full object-cover" />
        ) : (
          <Store className="w-10 h-10 text-muted-foreground/40" />
        )}
        <div className="absolute top-3 right-3">
          <Badge variant={acc.isOpen ? 'default' : 'secondary'} className="text-xs">
            {acc.isOpen ? 'Open' : 'Closed'}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Name + slug */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-base leading-tight">{acc.restaurantName}</h3>
            <span className="text-xs text-muted-foreground font-mono">/{acc.restaurantSlug}</span>
          </div>
          <a
            href={`/r/${acc.restaurantSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted rounded-xl p-2.5 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground leading-none">Orders</p>
              <p className="font-semibold text-sm mt-0.5">{acc.totalOrders}</p>
            </div>
          </div>
          <div className="bg-muted rounded-xl p-2.5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground leading-none">Revenue</p>
              <p className="font-semibold text-sm mt-0.5">
                €{acc.totalRevenue.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        {/* Address / phone */}
        {(acc.address || acc.phone) && (
          <div className="space-y-1 text-xs text-muted-foreground">
            {acc.address && (
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-1">{acc.address}</span>
              </div>
            )}
            {acc.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{acc.phone}</span>
              </div>
            )}
          </div>
        )}

        {/* Admin credentials */}
        <div className="border border-border rounded-xl p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Admin Access</p>
            <button
              onClick={() => setShowCreds(!showCreds)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showCreds ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="text-sm font-medium">{acc.adminName}</p>
          <p className="text-xs text-muted-foreground font-mono">{acc.email}</p>
          <p className="text-xs text-muted-foreground">
            Joined {new Date(acc.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Page ─────────────────────────────────────────────────────────────
export default function SuperAdminRestaurantsPage() {
  const router = useRouter()
  const { token, user } = useAppStore()
  const [accounts, setAccounts] = useState<RestaurantAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const load = useCallback(async () => {
    if (!token) { router.push('/login'); return }
    setLoading(true)
    try {
      const data = await superAdminApi.getAccounts(token)
      setAccounts(data)
    } catch {
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }, [token, router])

  useEffect(() => {
    if (!token || user?.role !== 'superadmin') { router.push('/login'); return }
    load()
  }, [token, user, router, load])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Restaurants</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {accounts.length} restaurant{accounts.length !== 1 ? 's' : ''} on the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} className="rounded-xl">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => setShowCreate(true)} className="rounded-xl h-9 px-4 text-sm">
            <Plus className="w-4 h-4 mr-1.5" />Add Restaurant
          </Button>
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <Store className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm">No restaurants yet.</p>
          <Button onClick={() => setShowCreate(true)} className="rounded-xl">
            <Plus className="w-4 h-4 mr-1.5" />Add first restaurant
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map(acc => (
            <RestaurantCard key={acc.restaurantId} acc={acc} />
          ))}
        </div>
      )}

      <CreateAccountModal
        open={showCreate}
        token={token ?? ''}
        onClose={() => setShowCreate(false)}
        onCreated={acc => setAccounts(prev => [acc, ...prev])}
      />
    </div>
  )
}
