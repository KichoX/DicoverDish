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
  { status: 'new', title: 'New', color: 'bg-primary' },
  { status: 'preparing', title: 'Preparing', color: 'bg-warning' },
  { status: 'ready', title: 'Ready', color: 'bg-success' },
] as const

export default function KitchenPage() {
  const { orders, updateOrderStatus } = useAppStore()

  const getOrderTypeIcon = (type: Order['type']) => {
    switch (type) {
      case 'delivery':
        return <Truck className="w-4 h-4" />
      case 'pickup':
        return <ShoppingBag className="w-4 h-4" />
      case 'dine-in':
        return <UtensilsCrossed className="w-4 h-4" />
    }
  }

  const getOrderTypeLabel = (order: Order) => {
    if (order.type === 'dine-in' && order.tableNumber) {
      return `Table ${order.tableNumber}`
    }
    return order.type.charAt(0).toUpperCase() + order.type.slice(1)
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Kitchen Display</h1>
        <p className="text-muted-foreground">
          Manage incoming orders in real-time
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnOrders = orders.filter((o) => o.status === column.status)

          return (
            <div key={column.status}>
              <div className="flex items-center gap-2 mb-4">
                <div className={cn('w-3 h-3 rounded-full', column.color)} />
                <h2 className="font-semibold">{column.title}</h2>
                <Badge variant="secondary">{columnOrders.length}</Badge>
              </div>

              <div className="space-y-4">
                {columnOrders.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-8">
                      <Empty>
                        <EmptyTitle className="text-sm">No orders</EmptyTitle>
                        <EmptyDescription className="text-xs">
                          {column.status === 'new' ? 'Waiting for new orders' : 'Move orders here'}
                        </EmptyDescription>
                      </Empty>
                    </CardContent>
                  </Card>
                ) : (
                  columnOrders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-mono">
                            #{order.id.slice(-6).toUpperCase()}
                          </CardTitle>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatTime(order.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {getOrderTypeIcon(order.type)}
                            <span className="ml-1">{getOrderTypeLabel(order)}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <ul className="space-y-1 mb-4">
                          {order.items.map((item) => (
                            <li key={item.id} className="text-sm flex justify-between">
                              <span>
                                {item.quantity}x {item.name}
                              </span>
                              {item.notes && (
                                <span className="text-muted-foreground text-xs italic">
                                  {item.notes}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>

                        {column.status === 'new' && (
                          <Button
                            className="w-full"
                            onClick={() => handleStatusChange(order.id, 'preparing')}
                          >
                            Accept & Prepare
                          </Button>
                        )}
                        {column.status === 'preparing' && (
                          <Button
                            className="w-full"
                            onClick={() => handleStatusChange(order.id, 'ready')}
                          >
                            Mark Ready
                          </Button>
                        )}
                        {column.status === 'ready' && (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleStatusChange(order.id, 'delivered')}
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
