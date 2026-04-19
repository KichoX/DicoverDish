'use client'

import { useState } from 'react'
import { MapPin, Navigation, Clock, Package, CheckCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

type DriverOrderStatus = 'available' | 'accepted' | 'delivering' | 'delivered'

interface DriverOrder {
  orderId: string
  status: DriverOrderStatus
  restaurantName: string
  restaurantAddress: string
  deliveryAddress: string
  items: number
  total: number
  pickupTime?: Date
}

export default function DriverPage() {
  const { orders, updateOrderStatus } = useAppStore()
  const [driverOrders, setDriverOrders] = useState<DriverOrder[]>([])
  const [activeOrder, setActiveOrder] = useState<DriverOrder | null>(null)

  // Get delivery orders that are ready for pickup
  const availableOrders = orders.filter(
    (o) => o.type === 'delivery' && o.status === 'ready'
  )

  const handleAcceptJob = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return

    const driverOrder: DriverOrder = {
      orderId: order.id,
      status: 'accepted',
      restaurantName: order.restaurantName,
      restaurantAddress: '123 Restaurant St', // Mock address
      deliveryAddress: order.address || '456 Customer Ave', // Mock address
      items: order.items.reduce((sum, i) => sum + i.quantity, 0),
      total: order.total,
      pickupTime: new Date(),
    }

    setActiveOrder(driverOrder)
    setDriverOrders((prev) => [...prev, driverOrder])
  }

  const handlePickedUp = () => {
    if (!activeOrder) return
    setActiveOrder({ ...activeOrder, status: 'delivering' })
  }

  const handleDelivered = () => {
    if (!activeOrder) return
    updateOrderStatus(activeOrder.orderId, 'delivered')
    setActiveOrder(null)
  }

  const formatTime = (date?: Date) => {
    if (!date) return ''
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Driver Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                {activeOrder ? 'Active delivery' : 'Looking for jobs'}
              </p>
            </div>
            <Badge variant={activeOrder ? 'default' : 'secondary'}>
              {activeOrder ? 'On Delivery' : 'Available'}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4">
        {/* Active Delivery */}
        {activeOrder && (
          <Card className="mb-6 border-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Current Delivery</CardTitle>
                <Badge className={cn(
                  activeOrder.status === 'accepted' && 'bg-warning text-warning-foreground',
                  activeOrder.status === 'delivering' && 'bg-primary'
                )}>
                  {activeOrder.status === 'accepted' ? 'Pick up' : 'Delivering'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Restaurant */}
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    activeOrder.status === 'accepted' ? 'bg-warning text-warning-foreground' : 'bg-muted'
                  )}>
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activeOrder.restaurantName}</p>
                    <p className="text-sm text-muted-foreground">{activeOrder.restaurantAddress}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activeOrder.items} items - ${activeOrder.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
                </div>

                {/* Delivery Address */}
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    activeOrder.status === 'delivering' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Delivery Address</p>
                    <p className="text-sm text-muted-foreground">{activeOrder.deliveryAddress}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-border">
                  {activeOrder.status === 'accepted' && (
                    <Button className="w-full" onClick={handlePickedUp}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Pickup
                    </Button>
                  )}
                  {activeOrder.status === 'delivering' && (
                    <Button className="w-full" onClick={handleDelivered}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Jobs */}
        <div>
          <h2 className="font-semibold mb-4">
            {activeOrder ? 'Other Available Jobs' : 'Available Jobs'}
          </h2>

          {availableOrders.length === 0 ? (
            <Empty className="py-12">
              <EmptyTitle>No deliveries available</EmptyTitle>
              <EmptyDescription>
                New delivery jobs will appear here when orders are ready
              </EmptyDescription>
            </Empty>
          ) : (
            <div className="space-y-4">
              {availableOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{order.restaurantName}</h3>
                        <p className="text-sm text-muted-foreground">
                          #{order.id.slice(-6).toUpperCase()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        Ready
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                      </span>
                      <span className="flex items-center gap-1">
                        <Navigation className="w-4 h-4" />
                        2.5 km
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">${order.total.toFixed(2)}</span>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptJob(order.id)}
                        disabled={!!activeOrder}
                      >
                        Accept Job
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
