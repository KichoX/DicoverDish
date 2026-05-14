'use client'

import { useState, useEffect, useCallback } from 'react'
import { Truck, ShoppingBag, UtensilsCrossed, Clock, Loader2, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { useAppStore } from '@/lib/store'
import { adminApi, type OrderDto } from '@/lib/api'
import { cn } from '@/lib/utils'

const columns = [
  { status: 'new',       title: 'New',       dot: 'bg-primary' },
  { status: 'preparing', title: 'Preparing', dot: 'bg-amber-400' },
  { status: 'ready',     title: 'Ready',     dot: 'bg-emerald-500' },
] as const

export default function KitchenPage() {
  const { token, user } = useAppStore()
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [loading, setLoading] = useState(true)

  const restaurantId = user?.restaurantId

  const load = useCallback(async () => {
    if (!token || !restaurantId) return
    setLoading(true)
    try {
      const data = await adminApi.getOrders(restaurantId, token)
      setOrders(data.filter(o => o.status !== 'delivered'))
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [token, restaurantId])

  useEffect(() => { load() }, [load])

  const advanceStatus = async (order: OrderDto, next: string) => {
    if (!token) return
    try {
      await adminApi.updateOrderStatus(order.id, next, token)
      setOrders(prev =>
        next === 'delivered'
          ? prev.filter(o => o.id !== order.id)
          : prev.map(o => o.id === order.id ? { ...o, status: next } : o)
      )
    } catch { /* ignore */ }
  }

  const getTypeIcon = (type: string) => {
    if (type === 'delivery') return <Truck className="w-3.5 h-3.5" />
    if (type === 'pickup')   return <ShoppingBag className="w-3.5 h-3.5" />
    return <UtensilsCrossed className="w-3.5 h-3.5" />
  }

  const getTypeLabel = (order: OrderDto) => {
    if (order.type === 'dine-in' && order.tableNumber) return `Table ${order.tableNumber}`
    return order.type.charAt(0).toUpperCase() + order.type.slice(1)
  }

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Kitchen Display</h1>
          <p className="text-sm text-muted-foreground">Manage incoming orders in real-time</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="rounded-xl">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {columns.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.status)

          return (
            <div key={col.status}>
              <div className="flex items-center gap-2 mb-4">
                <div className={cn('w-2.5 h-2.5 rounded-full', col.dot)} />
                <h2 className="font-semibold">{col.title}</h2>
                <Badge variant="secondary" className="ml-auto">{colOrders.length}</Badge>
              </div>

              <div className="space-y-4">
                {colOrders.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-8">
                      <Empty>
                        <EmptyTitle className="text-sm">No orders</EmptyTitle>
                        <EmptyDescription className="text-xs">
                          {col.status === 'new' ? 'Waiting for new orders' : 'Move orders here'}
                        </EmptyDescription>
                      </Empty>
                    </CardContent>
                  </Card>
                ) : (
                  colOrders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-mono">
                            #{order.id.slice(-6).toUpperCase()}
                          </CardTitle>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatTime(order.createdAt)}
                          </div>
                        </div>
                        <Badge variant="outline" className="w-fit text-xs mt-1 gap-1">
                          {getTypeIcon(order.type)}
                          {getTypeLabel(order)}
                        </Badge>
                      </CardHeader>

                      <CardContent className="p-4 pt-2">
                        <ul className="space-y-1 mb-4">
                          {order.items.map((item) => (
                            <li key={item.id} className="text-sm flex items-start justify-between gap-2">
                              <span className="font-medium">{item.quantity}× {item.menuItemName}</span>
                              {item.notes && (
                                <span className="text-muted-foreground text-xs italic shrink-0">
                                  {item.notes}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>

                        {col.status === 'new' && (
                          <Button className="w-full" onClick={() => advanceStatus(order, 'preparing')}>
                            Accept &amp; Prepare
                          </Button>
                        )}
                        {col.status === 'preparing' && (
                          <Button
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                            onClick={() => advanceStatus(order, 'ready')}
                          >
                            Mark Ready
                          </Button>
                        )}
                        {col.status === 'ready' && (
                          <Button
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                            onClick={() => advanceStatus(order, 'delivered')}
                          >
                            Complete Order
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
