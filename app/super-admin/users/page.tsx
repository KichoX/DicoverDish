'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Users, RefreshCw, Loader2, Mail, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { superAdminApi, type AuthUser } from '@/lib/api'


function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
  const colors = ['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700', 'bg-pink-100 text-pink-700']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${color}`}>
      {initials}
    </div>
  )
}

export default function SuperAdminUsersPage() {
  const router = useRouter()
  const { token, user } = useAppStore()
  const [users, setUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!token) { router.push('/login'); return }
    setLoading(true)
    try {
      const all = await superAdminApi.getUsers(token)
      setUsers(all.filter(u => u.role.toLowerCase() === 'client'))
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [token, router])

  useEffect(() => {
    if (!token || user?.role !== 'superadmin') { router.push('/login'); return }
    load()
  }, [token, user, router, load])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Client Users</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {loading ? '…' : `${users.length} registered client${users.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="rounded-xl">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" />
            All Clients
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <Users className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">No client accounts yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {users.map((u, i) => (
                <div key={u.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="w-5 text-center text-sm text-muted-foreground font-medium flex-shrink-0">{i + 1}</span>
                  <Avatar name={u.name} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{u.name}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{u.email}</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
