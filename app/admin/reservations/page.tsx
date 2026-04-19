'use client'

import { useState } from 'react'
import { Check, X, Users, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Empty, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { useAppStore } from '@/lib/store'

export default function ReservationsPage() {
  const { reservations, updateReservationStatus } = useAppStore()
  const [view, setView] = useState<'list' | 'calendar'>('list')

  const today = new Date()
  const todayStr = today.toDateString()

  const upcomingReservations = reservations.filter(
    (r) => new Date(r.date) >= today && r.status !== 'cancelled'
  )

  const todayReservations = reservations.filter(
    (r) => new Date(r.date).toDateString() === todayStr && r.status !== 'cancelled'
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      case 'confirmed':
        return <Badge className="bg-success text-success-foreground">Confirmed</Badge>
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>
      default:
        return null
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Reservations</h1>
        <p className="text-muted-foreground">Manage table reservations</p>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{todayReservations.length}</p>
            <p className="text-sm text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{upcomingReservations.length}</p>
            <p className="text-sm text-muted-foreground">Upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">
              {todayReservations.reduce((sum, r) => sum + r.guests, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Guests Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">
              {reservations.filter((r) => r.status === 'pending').length}
            </p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Reservations</CardTitle>
            <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')}>
              <TabsList>
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {view === 'list' ? (
            reservations.length === 0 ? (
              <Empty className="py-12">
                <EmptyTitle>No reservations</EmptyTitle>
                <EmptyDescription>
                  Reservations will appear here when customers book tables
                </EmptyDescription>
              </Empty>
            ) : (
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <Card key={reservation.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{reservation.name}</h3>
                            {getStatusBadge(reservation.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {formatDate(reservation.date)} at {reservation.time}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{reservation.guests} guests</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {reservation.phone}
                          </p>
                        </div>
                        {reservation.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateReservationStatus(reservation.id, 'confirmed')
                              }
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateReservationStatus(reservation.id, 'cancelled')
                              }
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Calendar view coming soon
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
