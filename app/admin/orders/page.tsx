'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Truck, ShoppingBag, UtensilsCrossed, X,
  MapPin, Hash, Clock, ChevronRight, Loader2, RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Empty, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { useAppStore } from '@/lib/store'
import { adminApi, type OrderDto } from '@/lib/api'

// ── Helpers ───────────────────────────────────────────────────────────
function typeIcon(type: string) {
  if (type === 'delivery') return <Truck className="w-4 h-4" />
  if (type === 'pickup')   return <ShoppingBag className="w-4 h-4" />
  return <UtensilsCrossed className="w-4 h-4" />
}

function typeLabel(order: OrderDto) {
  if (order.type === 'dine-in' && order.tableNumber) return `Table ${order.tableNumber}`
  return order.type.charAt(0).toUpperCase() + order.type.slice(1)
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new:       'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    preparing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
    ready:     'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    delivered: 'bg-muted text-muted-foreground',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

const STATUS_FLOW = ['new', 'preparing', 'ready', 'delivered']

function OrderModal({
  order, token, onClose, onStatusChange,
}: {
  order: OrderDto
  token: string
  onClose: () => void
  onStatusChange: (id: string, status: string) => void
}) {
  const [updating, setUpdating] = useState(false)
  const currentIdx = STATUS_FLOW.indexOf(order.status)
  const nextStatus = STATUS_FLOW[currentIdx + 1]

  const nextLabel: Record<string, string> = {
    new: 'Start Preparing', preparing: 'Mark Ready', ready: 'Mark Delivered',
  }

  const handleAdvance = async () => {
    if (!nextStatus) return
    setUpdating(true)
    try {
      await adminApi.updateOrderStatus(order.id, nextStatus, token)
      onStatusChange(order.id, nextStatus)
      onClose()
    } catch {
      // ignore — status unchanged
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-lg rounded-2xl p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              {typeIcon(order.type)}
            </div>
            <div>
              <p className="font-semibold leading-tight">Order #{order.id.slice(-6).toUpperCase()}</p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />{fmtTime(order.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} />
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground ml-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-5 py-3 border-b border-border bg-muted/30 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            {typeIcon(order.type)}
            <span className="capitalize">{typeLabel(order)}</span>
          </div>
          {order.tableNumber && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Hash className="w-4 h-4" />
              <span>Table {order.tableNumber}</span>
            </div>
          )}
          {order.deliveryAddress && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="truncate max-w-[200px]">{order.deliveryAddress}</span>
            </div>
          )}
        </div>

        <div className="px-5 py-4 space-y-2 max-h-64 overflow-y-auto">
          {order.items.map(item => (
            <div key={item.id} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {item.quantity}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{item.menuItemName}</p>
                {item.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">"{item.notes}"</p>}
              </div>
              <span className="text-sm font-medium flex-shrink-0">
                €{(item.unitPrice * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {order.items.reduce((s, i) => s + i.quantity, 0)} items
          </span>
          <span className="text-lg font-bold">€{order.total.toFixed(2)}</span>
        </div>

        <div className="px-5 pb-5 pt-3 space-y-3">
          <div className="flex items-center gap-1">
            {STATUS_FLOW.map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={`flex-1 h-1.5 rounded-full ${i <= currentIdx ? 'bg-primary' : 'bg-muted'}`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            {STATUS_FLOW.map(s => (
              <span key={s} className={order.status === s ? 'text-primary font-semibold' : ''}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
            ))}
          </div>

          {nextStatus && (
            <Button onClick={handleAdvance} disabled={updating} className="w-full rounded-xl h-11">
              {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {nextLabel[order.status]}
              {!updating && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function OrdersPage() {
  const { token, user } = useAppStore()
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null)

  const restaurantId = user?.restaurantId

  const load = useCallback(async () => {
    if (!token || !restaurantId) return
    setLoading(true)
    try {
      const data = await adminApi.getOrders(restaurantId, token)
      setOrders(data)
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [token, restaurantId])

  useEffect(() => { load() }, [load])

  const handleStatusChange = (id: string, status: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all')  return true
    if (activeTab === 'qr')   return order.type === 'dine-in' && order.tableNumber
    return order.type === activeTab
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Orders</h1>
          <p className="text-muted-foreground">Click any row to view details and update status</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="rounded-xl">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="qr">QR / Dine-in</TabsTrigger>
                <TabsTrigger value="pickup">Pickup</TabsTrigger>
                <TabsTrigger value="delivery">Delivery</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {filteredOrders.length === 0 ? (
                  <Empty className="py-12">
                    <EmptyTitle>No orders found</EmptyTitle>
                    <EmptyDescription>Orders will appear here once customers place them</EmptyDescription>
                  </Empty>
                ) : (
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-4 py-2.5 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border">
                      <span className="w-20">Order</span>
                      <span>Time</span>
                      <span className="w-28 text-center">Type</span>
                      <span className="w-14 text-center">Items</span>
                      <span className="w-20 text-right">Total</span>
                      <span className="w-24 text-center">Status</span>
                    </div>

                    {filteredOrders.map(order => (
                      <button
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="w-full grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-4 py-3.5 hover:bg-muted/40 transition-colors border-b border-border last:border-0 text-left group"
                      >
                        <span className="w-20 font-mono text-sm font-semibold">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-sm text-muted-foreground">{fmtTime(order.createdAt)}</span>
                        <span className="w-28 flex items-center justify-center gap-1.5 text-sm">
                          {typeIcon(order.type)}
                          <span className="hidden sm:inline">{typeLabel(order)}</span>
                        </span>
                        <span className="w-14 text-center text-sm">
                          {order.items.reduce((s, i) => s + i.quantity, 0)}
                        </span>
                        <span className="w-20 text-right text-sm font-medium">
                          €{order.total.toFixed(2)}
                        </span>
                        <span className="w-24 flex items-center justify-center gap-1">
                          <StatusBadge status={order.status} />
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {selectedOrder && token && (
        <OrderModal
          order={selectedOrder}
          token={token}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
