'use client'

import { use, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowLeft, Plus, Minus, ShoppingBag, Truck, ShoppingCart, Trash2, Check, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { restaurants, menuItems, menuCategories } from '@/lib/data'
import { useAppStore } from '@/lib/store'
import type { CartItem } from '@/lib/types'
import { cn } from '@/lib/utils'

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

type Step = 'menu' | 'cart' | 'checkout' | 'success'

const categoryImages: Record<string, string> = {
  'Starters': 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&h=400&fit=crop',
  'Main Courses': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
  'Desserts': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop',
  'Drinks': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop',
}

export default function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  
  const { 
    cart, addToCart, removeFromCart, updateCartItemQuantity,
    clearCart, addOrder, setCurrentRestaurantId, user
  } = useAppStore()
  
  const restaurant = restaurants.find((r) => generateSlug(r.name) === slug)

  const [step, setStep] = useState<Step>('menu')
  const [selectedCategory, setSelectedCategory] = useState(menuCategories[0])
  const [selectedItem, setSelectedItem] = useState<typeof menuItems[0] | null>(null)
  const [itemQuantity, setItemQuantity] = useState(1)
  
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('pickup')
  const [address, setAddress] = useState('')
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState('')
  const [orderNotes, setOrderNotes] = useState('')

  useEffect(() => {
    if (restaurant) {
      setCurrentRestaurantId(restaurant.id)
    }
    if (user) {
      setName(user.name)
    }
  }, [restaurant, user, setCurrentRestaurantId])

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Restaurant not found</h1>
          <Button asChild>
            <Link href="/">Browse Restaurants</Link>
          </Button>
        </div>
      </div>
    )
  }

  const categoryItems = menuItems.filter((item) => item.category === selectedCategory)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = deliveryMethod === 'delivery' ? 3.99 : 0
  const total = subtotal + deliveryFee

  const handleQuickAdd = (item: typeof menuItems[0], e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart({ ...item, quantity: 1 })
  }

  const handleAddToCart = () => {
    if (!selectedItem) return
    const cartItem: CartItem = {
      ...selectedItem,
      quantity: itemQuantity,
    }
    addToCart(cartItem)
    setSelectedItem(null)
    setItemQuantity(1)
  }

  const handlePlaceOrder = () => {
    if (deliveryMethod === 'delivery' && !address) return
    if (!name || !phone) return

    const order = {
      id: `order-${Date.now()}`,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      items: [...cart],
      type: deliveryMethod,
      address: deliveryMethod === 'delivery' ? address : undefined,
      notes: orderNotes || undefined,
      status: 'new' as const,
      total,
      createdAt: new Date(),
    }
    addOrder(order)
    clearCart()
    setStep('success')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {step === 'menu' ? (
                <Link
                  href={`/r/${slug}`}
                  className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              ) : (
                <button
                  onClick={() => setStep(step === 'checkout' ? 'cart' : 'menu')}
                  className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h1 className="font-semibold text-lg leading-tight">
                  {step === 'menu' && 'Menu'}
                  {step === 'cart' && 'Your Cart'}
                  {step === 'checkout' && 'Checkout'}
                  {step === 'success' && 'Order Confirmed'}
                </h1>
                <p className="text-sm text-muted-foreground">{restaurant.name}</p>
              </div>
            </div>
            
            {step === 'menu' && cartItemCount > 0 && (
              <Button 
                className="rounded-full px-5 h-10 gap-2 shadow-md"
                onClick={() => setStep('cart')}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="font-semibold">{cartItemCount}</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8 pb-32">
        {/* Menu Step */}
        {step === 'menu' && (
          <>
            {/* Category Tabs - Horizontally scrollable on mobile, centered on desktop */}
            <div className="mb-8">
              <div className="flex lg:justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap">
                {menuCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-all flex-shrink-0',
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid - 2 cols mobile, 3 cols tablet, 4 cols desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
              {categoryItems.map((item) => {
                const itemImage = item.image || categoryImages[item.category]
                
                return (
                  <Card 
                    key={item.id} 
                    className={cn(
                      'overflow-hidden transition-all hover:shadow-lg border-border/60 group cursor-pointer rounded-2xl bg-card/95 pt-0',
                      !item.isAvailable && 'opacity-50 pointer-events-none'
                    )}
                    onClick={() => item.isAvailable && setSelectedItem(item)}
                  >
                    <CardContent className="p-2.5">
                      {/* Square Image */}
                      <div className="relative aspect-square bg-muted overflow-hidden rounded-xl">
                        <Image
                          src={itemImage}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <Badge variant="secondary" className="text-sm">Unavailable</Badge>
                          </div>
                        )}
                        {/* Quick Add Button - Overlay on hover for desktop */}
                        {item.isAvailable && (
                          <button
                            onClick={(e) => handleQuickAdd(item, e)}
                            className="absolute bottom-3 right-3 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 lg:flex hidden"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="px-1.5 pt-3 pb-2 lg:px-2">
                        <h3 className="font-semibold text-sm lg:text-base leading-tight mb-1 line-clamp-1">
                          {item.name}
                        </h3>
                        
                        {/* Rating + Orders (like the vibes image) */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2.5">
                          <div className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="font-medium">4.8</span>
                          </div>
                          <span>1600+ orders</span>
                        </div>
                        
                        {/* Price + Add Button */}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-base lg:text-lg">${item.price.toFixed(2)}</span>
                          
                          {/* Mobile Add Button */}
                          <Button 
                            size="sm" 
                            className="rounded-full h-8 px-3 lg:hidden shadow-sm text-xs"
                            onClick={(e) => handleQuickAdd(item, e)}
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Add
                          </Button>
                          
                          {/* Desktop Add Button */}
                          <Button 
                            size="sm" 
                            className="rounded-full h-9 px-4 hidden lg:flex shadow-sm"
                            onClick={(e) => handleQuickAdd(item, e)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}

        {/* Cart Step */}
        {step === 'cart' && (
          <div className="max-w-2xl mx-auto">
            {cart.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border">
                <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-6">Add items from the menu to get started</p>
                <Button onClick={() => setStep('menu')} className="rounded-full px-6">
                  Browse Menu
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-muted/50 rounded-full p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="font-medium w-6 text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <span className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button variant="outline" className="w-full h-12 rounded-xl" onClick={() => setStep('menu')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add more items
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Checkout Step */}
        {step === 'checkout' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Delivery Method Selection */}
            <div>
              <h3 className="font-semibold mb-4">How would you like to receive your order?</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setDeliveryMethod('pickup')}
                  className={cn(
                    'p-5 rounded-2xl border-2 text-center transition-all',
                    deliveryMethod === 'pickup'
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <ShoppingBag className={cn(
                    'w-8 h-8 mx-auto mb-3',
                    deliveryMethod === 'pickup' ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  <span className="font-semibold block">Pickup</span>
                  <span className="text-sm text-muted-foreground">Free</span>
                </button>
                <button
                  onClick={() => setDeliveryMethod('delivery')}
                  className={cn(
                    'p-5 rounded-2xl border-2 text-center transition-all',
                    deliveryMethod === 'delivery'
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <Truck className={cn(
                    'w-8 h-8 mx-auto mb-3',
                    deliveryMethod === 'delivery' ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  <span className="font-semibold block">Delivery</span>
                  <span className="text-sm text-muted-foreground">+$3.99</span>
                </button>
              </div>
            </div>

            <Separator />

            {deliveryMethod === 'delivery' && (
              <Field>
                <FieldLabel htmlFor="address">Delivery Address *</FieldLabel>
                <Input
                  id="address"
                  placeholder="Enter your full address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </Field>
            )}

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Your Name *</FieldLabel>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone Number *</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 555 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </Field>
            </FieldGroup>

            <Field>
              <FieldLabel htmlFor="notes">Order Notes (optional)</FieldLabel>
              <Textarea
                id="notes"
                placeholder="Any special requests? (allergies, delivery instructions, etc.)"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="rounded-xl resize-none"
                rows={3}
              />
            </Field>

            <Separator />

            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold">Order Summary</h3>
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {deliveryMethod === 'delivery' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg pt-1">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="max-w-md mx-auto text-center py-12">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/30">
              <Check className="w-12 h-12 text-white" />
            </div>
            <h2 className="font-serif text-4xl italic mb-3">Order Placed!</h2>
            <p className="text-muted-foreground mb-10">
              {deliveryMethod === 'delivery' 
                ? "Your order is on its way!"
                : "Your order will be ready for pickup soon!"}
            </p>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-full h-12" asChild>
                <Link href={`/r/${slug}`}>Back to Restaurant</Link>
              </Button>
              <Button className="flex-1 rounded-full h-12" asChild>
                <Link href="/">Discover More</Link>
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Fixed Bottom Button */}
      {step !== 'success' && cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8 md:static md:p-0 md:bg-none md:pt-0">
          <div className="max-w-2xl mx-auto">
            <Button
              className="w-full h-12 text-base rounded-2xl shadow-md md:mt-8"
              disabled={
                step === 'checkout' && (!name || !phone || (deliveryMethod === 'delivery' && !address))
              }
              onClick={() => {
                if (step === 'menu') setStep('cart')
                else if (step === 'cart') setStep('checkout')
                else if (step === 'checkout') handlePlaceOrder()
              }}
            >
              {step === 'menu' && (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  View Cart ({cartItemCount}) - ${subtotal.toFixed(2)}
                </>
              )}
              {step === 'cart' && `Continue - $${subtotal.toFixed(2)}`}
              {step === 'checkout' && `Place Order - $${total.toFixed(2)}`}
            </Button>
          </div>
        </div>
      )}

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          {selectedItem && (
            <>
              <div className="relative aspect-square">
                <Image
                  src={selectedItem.image || categoryImages[selectedItem.category]}
                  alt={selectedItem.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="p-5">
                <DialogHeader className="mb-3">
                  <DialogTitle className="text-xl">{selectedItem.name}</DialogTitle>
                </DialogHeader>
                
                <p className="text-muted-foreground text-sm mb-4">{selectedItem.description}</p>
                <p className="font-bold text-2xl mb-6">${selectedItem.price.toFixed(2)}</p>
                
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 bg-muted rounded-full p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="font-semibold text-lg w-8 text-center">{itemQuantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      onClick={() => setItemQuantity(itemQuantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    size="lg" 
                    className="flex-1 rounded-full h-12" 
                    onClick={handleAddToCart}
                  >
                    Add - ${(selectedItem.price * itemQuantity).toFixed(2)}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
