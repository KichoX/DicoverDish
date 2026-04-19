'use client'

import { useState } from 'react'
import { Truck, ShoppingBag, UtensilsCrossed } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Empty, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { useAppStore } from '@/lib/store'
import type { Order } from '@/lib/types'

export default function OrdersPage() {
  const { orders } = useAppStore()
  const [activeTab, setActiveTab] = useState('all')

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true
    if (activeTab === 'qr') return order.type === 'dine-in' && order.tableNumber
    return order.type === activeTab
  })

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

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'new':
        return <Badge>New</Badge>
      case 'preparing':
        return <Badge className="bg-warning text-warning-foreground">Preparing</Badge>
      case 'ready':
        return <Badge className="bg-success text-success-foreground">Ready</Badge>
      case 'delivered':
        return <Badge variant="secondary">Delivered</Badge>
    }
  }

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Orders</h1>
        <p className="text-muted-foreground">View and manage all orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="qr">QR Orders</TabsTrigger>
              <TabsTrigger value="pickup">Pickup</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredOrders.length === 0 ? (
                <Empty className="py-12">
                  <EmptyTitle>No orders found</EmptyTitle>
                  <EmptyDescription>
                    Orders will appear here once customers place them
                  </EmptyDescription>
                </Empty>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono">
                            #{order.id.slice(-6).toUpperCase()}
                          </TableCell>
                          <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getOrderTypeIcon(order.type)}
                              <span className="capitalize">
                                {order.type === 'dine-in' && order.tableNumber
                                  ? `Table ${order.tableNumber}`
                                  : order.type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                          </TableCell>
                          <TableCell>${order.total.toFixed(2)}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
