'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, X, Users, Clock, Loader2, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { useAppStore } from '@/lib/store'
import { adminApi, type ReservationDto } from '@/lib/api'

function StatusBadge({ status }: { status: string }) {
  if (status === 'confirmed')
    return <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 border-0">Confirmed</Badge>
  if (status === 'cancelled')
    return <Badge variant="secondary">Cancelled</Badge>
  return <Badge variant="outline">Pending</Badge>
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

export default function ReservationsPage() {
  const { token, user } = useAppStore()
  const [reservations, setReservations] = useState<ReservationDto[]>([])
  const [loading, setLoading] = useState(true)

  const restaurantId = user?.restaurantId

  const load = useCallback(async () => {
    if (!token || !restaurantId) return
    setLoading(true)
    try {
      const data = await adminApi.getReservations(restaurantId, token)
      setReservations(data)
    } catch {
      setReservations([])
    } finally {
      setLoading(false)
    }
  }, [token, restaurantId])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id: string, status: string) => {
    if (!token) return
    try {
      await adminApi.updateReservationStatus(id, status, token)
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } catch { /* ignore */ }
  }

  const today = new Date().toDateString()
  const todayRes = reservations.filter(r => new Date(r.date).toDateString() === today && r.status !== 'cancelled')
  const upcoming = reservations.filter(r => new Date(r.date) >= new Date() && r.status !== 'cancelled')

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reservations</h1>
          <p className="text-muted-foreground">Manage table reservations</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="rounded-xl">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Today',        value: todayRes.length },
              { label: 'Upcoming',     value: upcoming.length },
              { label: 'Guests Today', value: todayRes.reduce((s, r) => s + r.guests, 0) },
              { label: 'Pending',      value: reservations.filter(r => r.status === 'pending').length },
            ].map(({ label, value }) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              {reservations.length === 0 ? (
                <Empty className="py-12">
                  <EmptyTitle>No reservations</EmptyTitle>
                  <EmptyDescription>Reservations will appear here when customers book tables</EmptyDescription>
                </Empty>
              ) : (
                <div className="space-y-4">
                  {reservations.map((r) => (
                    <Card key={r.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{r.guestName}</h3>
                              <StatusBadge status={r.status} />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatDate(r.date)} at {r.time}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{r.guests} guests</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{r.guestPhone}</p>
                            {r.specialRequests && (
                              <p className="text-xs text-muted-foreground mt-1 italic">"{r.specialRequests}"</p>
                            )}
                          </div>
                          {r.status === 'pending' && (
                            <div className="flex gap-2 ml-4">
                              <Button size="sm" onClick={() => updateStatus(r.id, 'confirmed')}>
                                <Check className="w-4 h-4 mr-1" />Confirm
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, 'cancelled')}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
