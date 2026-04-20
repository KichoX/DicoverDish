'use client'

import { Truck, ShoppingBag, UtensilsCrossed, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { useAppStore } from '@/lib/store'
import type { Order } from '@/lib/types'
import { cn } from '@/lib/utils'

const columns = [
  { status: 'new',       title: 'New',       dot: 'bg-primary' },
  { status: 'preparing', title: 'Preparing',  dot: 'bg-amber-400' },
  { status: 'ready',     title: 'Ready',      dot: 'bg-emerald-500' },
] as const

export default function KitchenPage() {
  const { orders, updateOrderStatus } = useAppStore()

  const getTypeIcon = (type: Order['type']) => {
    if (type === 'delivery') return <Truck className="w-3.5 h-3.5" />
    if (type === 'pickup')   return <ShoppingBag className="w-3.5 h-3.5" />
    return <UtensilsCrossed className="w-3.5 h-3.5" />
  }

  const getTypeLabel = (order: Order) => {
    if (order.type === 'dine-in' && order.tableNumber) return `Table ${order.tableNumber}`
    return order.type.charAt(0).toUpperCase() + order.type.slice(1)
  }

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Kitchen Display</h1>
        <p className="text-sm text-muted-foreground">Manage incoming orders in real-time</p>
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
                          {order.items.map((item, i) => (
                            <li key={i} className="text-sm flex items-start justify-between gap-2">
                              <span className="font-medium">{item.quantity}× {item.name}</span>
                              {(item as any).notes && (
                                <span className="text-muted-foreground text-xs italic shrink-0">
                                  {(item as any).notes}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>

                        {col.status === 'new' && (
                          <Button
                            className="w-full"
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                          >
                            Accept &amp; Prepare
                          </Button>
                        )}

                        {col.status === 'preparing' && (
                          <Button
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                          >
                            Mark Ready
                          </Button>
                        )}

                        {col.status === 'ready' && (
                          <Button
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-0 btn-glow-green"
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
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
