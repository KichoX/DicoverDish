'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChefHat, ClipboardList, CalendarDays, UtensilsCrossed, TrendingUp, DollarSign, Users, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { adminApi, type OrderDto, type ReservationDto } from '@/lib/api'

export default function AdminDashboardPage() {
  const { token, user } = useAppStore()
  const restaurantId = user?.restaurantId

  const [orders, setOrders] = useState<OrderDto[]>([])
  const [reservations, setReservations] = useState<ReservationDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token || !restaurantId) return
    Promise.all([
      adminApi.getOrders(restaurantId, token),
      adminApi.getReservations(restaurantId, token),
    ]).then(([o, r]) => {
      setOrders(o)
      setReservations(r)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [token, restaurantId])

  const today = new Date().toDateString()
  const todayOrders   = orders.filter(o => new Date(o.createdAt).toDateString() === today)
  const todayRevenue  = todayOrders.reduce((s, o) => s + o.total, 0)
  const newOrders     = orders.filter(o => o.status === 'new').length
  const todayResCount = reservations.filter(r => new Date(r.date).toDateString() === today && r.status !== 'cancelled').length

  const stats = [
    { title: "Today's Orders",       value: loading ? '…' : String(todayOrders.length),   icon: ClipboardList, href: '/admin/orders' },
    { title: "Today's Revenue",      value: loading ? '…' : `€${todayRevenue.toFixed(2)}`, icon: DollarSign,    href: '/admin/orders' },
    { title: 'Pending Orders',       value: loading ? '…' : String(newOrders),             icon: TrendingUp,    href: '/admin/kitchen' },
    { title: "Today's Reservations", value: loading ? '…' : String(todayResCount),         icon: Users,         href: '/admin/reservations' },
  ]

  const quickActions = [
    { label: 'Kitchen Display', icon: ChefHat,         href: '/admin/kitchen' },
    { label: 'Manage Orders',   icon: ClipboardList,   href: '/admin/orders' },
    { label: 'Reservations',    icon: CalendarDays,    href: '/admin/reservations' },
    { label: 'Edit Menu',       icon: UtensilsCrossed, href: '/admin/menu' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here is an overview of your restaurant.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-5 h-5 text-muted-foreground" />
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Button key={action.label} variant="outline" className="h-auto py-6 flex-col gap-2" asChild>
                <Link href={action.href}>
                  <action.icon className="w-6 h-6" />
                  <span>{action.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
