'use client'

import Link from 'next/link'
import { CalendarDays, Clock, Users, ArrowLeft, LogIn, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { AppShell } from '@/components/app-shell'
import { useAppStore } from '@/lib/store'

// Demo data for reservations
const demoReservations = [
  {
    id: 'demo-1',
    restaurantId: '1',
    restaurantName: 'Le Loup Imperial',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    time: '19:00',
    guests: 2,
    tableNumber: 4,
    status: 'confirmed' as const,
    specialRequests: 'Window seat if possible',
  },
  {
    id: 'demo-2',
    restaurantId: '3',
    restaurantName: 'Sakura Garden',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    time: '20:30',
    guests: 4,
    tableNumber: 2,
    status: 'pending' as const,
    specialRequests: '',
  },
  {
    id: 'demo-3',
    restaurantId: '2',
    restaurantName: 'The Island',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    time: '18:00',
    guests: 2,
    tableNumber: 1,
    status: 'confirmed' as const,
    specialRequests: '',
  },
]

export default function ReservationsPage() {
  const { isLoggedIn, reservations: storeReservations } = useAppStore()

  // Use demo data combined with store data for demo purposes
  const reservations = [...demoReservations, ...storeReservations]

  // Not logged in state
  if (!isLoggedIn) {
    return (
      <AppShell>
        <div className="pb-24 md:pb-8">
          <header className="md:hidden px-4 py-4 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold">Reservations</h1>
            </div>
          </header>

          <div className="max-w-md mx-auto px-4 py-16">
            <Empty className="py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-8 h-8 text-muted-foreground" />
              </div>
              <EmptyTitle>Sign in to see reservations</EmptyTitle>
              <EmptyDescription>
                View and manage all your restaurant bookings in one place.
              </EmptyDescription>
              <Button asChild className="mt-6">
                <Link href="/profile">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            </Empty>
          </div>
        </div>
      </AppShell>
    )
  }

  const upcomingReservations = reservations.filter(
    (r) => new Date(r.date) >= new Date() && r.status !== 'cancelled'
  )

  const pastReservations = reservations.filter(
    (r) => new Date(r.date) < new Date() || r.status === 'cancelled'
  )

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-xs">Pending</Badge>
      case 'confirmed':
        return <Badge className="bg-success text-success-foreground text-xs">Confirmed</Badge>
      case 'cancelled':
        return <Badge variant="secondary" className="text-xs">Cancelled</Badge>
      default:
        return null
    }
  }

  return (
    <AppShell>
      <div className="pb-24 md:pb-8">
        {/* Mobile Header */}
        <header className="md:hidden px-4 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold">My Reservations</h1>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="hidden md:block text-2xl font-bold mb-6">My Reservations</h1>
          
          {reservations.length === 0 ? (
            <Empty className="py-12">
              <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <EmptyTitle>No reservations yet</EmptyTitle>
              <EmptyDescription>
                Book a table at your favorite restaurant to see it here
              </EmptyDescription>
              <Button asChild className="mt-4">
                <Link href="/">Explore Restaurants</Link>
              </Button>
            </Empty>
          ) : (
            <div className="space-y-8">
              {/* Upcoming */}
              {upcomingReservations.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4">Upcoming</h2>
                  <div className="space-y-4">
                    {upcomingReservations.map((reservation) => (
                      <Card key={reservation.id} className="overflow-hidden">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">{reservation.restaurantName}</h3>
                                {getStatusBadge(reservation.status)}
                              </div>
                              <div className="grid grid-cols-2 md:flex md:flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <CalendarDays className="w-4 h-4" />
                                  <span>{formatDate(reservation.date)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{reservation.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  <span>{reservation.guests} guests</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>Table {reservation.tableNumber}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Modify
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Past */}
              {pastReservations.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Past</h2>
                  <div className="space-y-3">
                    {pastReservations.map((reservation) => (
                      <Card key={reservation.id} className="opacity-60">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{reservation.restaurantName}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span>{formatDate(reservation.date)}</span>
                                <span>{reservation.time}</span>
                                <span>{reservation.guests} guests</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              Book again
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
