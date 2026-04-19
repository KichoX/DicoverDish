'use client'

import { use, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Minus, ShoppingBag, Truck, ShoppingCart, Trash2, Check, Star, Info, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { restaurants, menuItems, menuCategories } from '@/lib/data'
import { useAppStore } from '@/lib/store'
import type { CartItem } from '@/lib/types'
import { cn } from '@/lib/utils'

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

const mockIngredients: Record<string, string[]> = {
  'Starters':     ['Fresh greens', 'Cherry tomatoes', 'Extra virgin olive oil', 'Sea salt', 'Lemon zest'],
  'Main Courses': ['Premium protein', 'Seasonal vegetables', 'Fresh herbs', 'House sauce', 'Artisan grains'],
  'Pizza':        ['Hand-stretched dough', 'San Marzano tomato', 'Fior di latte', 'Fresh basil', 'EVOO'],
  'Desserts':     ['Organic flour', 'Cane sugar', 'French butter', 'Free-range eggs', 'Vanilla'],
  'Drinks':       ['Filtered water', 'Natural extracts', 'Fresh citrus', 'Seasonal herbs'],
}

const mockNutrition: Record<string, { cal: number; protein: string; carbs: string; fat: string }> = {
  'Starters':     { cal: 180, protein: '8g',  carbs: '22g', fat: '7g'  },
  'Main Courses': { cal: 520, protein: '38g', carbs: '45g', fat: '18g' },
  'Pizza':        { cal: 680, protein: '28g', carbs: '82g', fat: '24g' },
  'Desserts':     { cal: 340, protein: '5g',  carbs: '52g', fat: '14g' },
  'Drinks':       { cal: 95,  protein: '0g',  carbs: '24g', fat: '0g'  },
}

function MenuItemCard({
  item,
  fallbackImage,
  onAdd,
}: {
  item: typeof menuItems[0]
  fallbackImage: string
  onAdd: (item: typeof menuItems[0], qty: number) => void
}) {
  const [flipped, setFlipped] = useState(false)
  const [qty, setQty] = useState(1)
  const src = item.image || fallbackImage
  const nutrition = mockNutrition[item.category] ?? mockNutrition['Main Courses']
  const ingredients = mockIngredients[item.category] ?? mockIngredients['Main Courses']

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAdd(item, qty)
    setFlipped(false)
    setQty(1)
  }

  return (
    <div className={cn('flip-scene h-72 sm:h-80', !item.isAvailable && 'opacity-50 pointer-events-none')}>
      <div className={cn('flip-inner w-full h-full rounded-2xl', flipped && 'is-flipped')}>

        {/* ── FRONT ── */}
        <div className="flip-face rounded-2xl overflow-hidden border border-border/60 bg-card flex flex-col">
          <div className="relative flex-shrink-0 h-[58%] bg-muted">
            <Image src={src} alt={item.name} fill className="object-cover" />
            {!item.isAvailable && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Badge variant="secondary">Unavailable</Badge>
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setFlipped(true) }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/75 transition-colors"
              aria-label="Ingredients & nutrition"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col flex-1 px-3 pt-2.5 pb-3">
            <h3 className="font-semibold text-sm leading-tight line-clamp-1 mb-1">{item.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-auto">
              <div className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span className="font-medium">4.8</span>
              </div>
              <span>1600+ orders</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-bold text-base">${item.price.toFixed(2)}</span>
              <Button
                size="sm"
                className="h-7 px-3 text-xs rounded-full gap-1"
                onClick={(e) => { e.stopPropagation(); onAdd(item, 1) }}
              >
                <Plus className="w-3 h-3" />Add
              </Button>
            </div>
          </div>
        </div>

        {/* ── BACK ── */}
        <div className="flip-face flip-back rounded-2xl overflow-hidden border border-border/60 bg-card flex flex-col">
          <div className="flex items-start justify-between gap-2 px-3 pt-3 pb-2 border-b border-border/40 flex-shrink-0">
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight line-clamp-1">{item.name}</p>
              <p className="text-primary font-bold text-sm">${item.price.toFixed(2)}</p>
            </div>
            <button
              onClick={() => setFlipped(false)}
              className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/70 flex-shrink-0 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-2.5 scrollbar-hide">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Ingredients</p>
              <div className="flex flex-wrap gap-1">
                {ingredients.map((ing) => (
                  <span key={ing} className="text-[10px] bg-muted px-2 py-0.5 rounded-full leading-tight">{ing}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Nutrition · per serving</p>
              <div className="grid grid-cols-4 gap-1">
                {([
                  { label: 'Cal',     value: String(nutrition.cal) },
                  { label: 'Protein', value: nutrition.protein },
                  { label: 'Carbs',   value: nutrition.carbs },
                  { label: 'Fat',     value: nutrition.fat },
                ] as const).map(({ label, value }) => (
                  <div key={label} className="bg-muted/60 rounded-lg p-1.5 text-center">
                    <p className="font-bold text-xs">{value}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border/40 flex-shrink-0">
            <div className="flex items-center gap-1 bg-muted rounded-full px-1.5 py-1 flex-shrink-0">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-background transition-colors"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span className="font-semibold text-xs w-4 text-center">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-background transition-colors"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
            <Button size="sm" className="flex-1 h-8 rounded-full text-xs font-semibold" onClick={handleAdd}>
              Add · ${(item.price * qty).toFixed(2)}
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Cart panel: handles both "items" and "checkout" sub-steps ──
function CartPanel({
  cart,
  itemNotes,
  onNoteChange,
  updateCartItemQuantity,
  removeFromCart,
  subtotal,
  deliveryFee,
  total,
  deliveryMethod,
  setDeliveryMethod,
  address,
  setAddress,
  name,
  setName,
  phone,
  setPhone,
  orderNotes,
  setOrderNotes,
  onClose,
  onPlaceOrder,
}: {
  cart: CartItem[]
  itemNotes: Record<string, string>
  onNoteChange: (id: string, note: string) => void
  updateCartItemQuantity: (id: string, qty: number) => void
  removeFromCart: (id: string) => void
  subtotal: number
  deliveryFee: number
  total: number
  deliveryMethod: 'delivery' | 'pickup'
  setDeliveryMethod: (m: 'delivery' | 'pickup') => void
  address: string
  setAddress: (v: string) => void
  name: string
  setName: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  orderNotes: string
  setOrderNotes: (v: string) => void
  onClose: () => void
  onPlaceOrder: () => void
}) {
  const [cartStep, setCartStep] = useState<'items' | 'checkout'>('items')

  const canPlaceOrder = name.trim() && phone.trim() && (deliveryMethod === 'pickup' || address.trim())

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border flex-shrink-0">
        {cartStep === 'checkout' && (
          <button
            onClick={() => setCartStep('items')}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <h2 className="font-semibold text-base flex-1">
          {cartStep === 'items' ? 'Your Cart' : 'Place Order'}
        </h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── STEP 1: Items ── */}
      {cartStep === 'items' && (
        <>
          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="font-medium mb-1">Cart is empty</p>
                <p className="text-sm text-muted-foreground">Add items from the menu to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border bg-background p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm leading-tight line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 bg-muted rounded-full px-2 py-1">
                        <button
                          onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-background transition-colors"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="font-semibold text-xs w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-background transition-colors"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <span className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>

                    <Textarea
                      placeholder="Note... (e.g. no onions, extra salt)"
                      value={itemNotes[item.id] || ''}
                      onChange={(e) => onNoteChange(item.id, e.target.value)}
                      className="text-xs rounded-lg resize-none h-14 py-2"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-border p-4 space-y-3 flex-shrink-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-bold text-foreground text-base">${subtotal.toFixed(2)}</span>
              </div>
              <Button
                className="w-full h-11 rounded-xl font-semibold"
                onClick={() => setCartStep('checkout')}
              >
                Continue to Order
              </Button>
            </div>
          )}
        </>
      )}

      {/* ── STEP 2: Checkout ── */}
      {cartStep === 'checkout' && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-hide">
            {/* Delivery / Pickup toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDeliveryMethod('pickup')}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium',
                  deliveryMethod === 'pickup'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/40 text-muted-foreground'
                )}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Pickup</span>
                <span className="text-xs font-normal opacity-70">Free</span>
              </button>
              <button
                onClick={() => setDeliveryMethod('delivery')}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium',
                  deliveryMethod === 'delivery'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/40 text-muted-foreground'
                )}
              >
                <Truck className="w-5 h-5" />
                <span>Delivery</span>
                <span className="text-xs font-normal opacity-70">+$3.99</span>
              </button>
            </div>

            {/* Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Name *</label>
                <Input
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone *</label>
                <Input
                  type="tel"
                  placeholder="+1 555 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 rounded-lg text-sm"
                />
              </div>
              {deliveryMethod === 'delivery' && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Delivery Address *</label>
                  <Input
                    placeholder="Street, city, postcode"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-10 rounded-lg text-sm"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Order notes (optional)</label>
                <Textarea
                  placeholder="Allergies, delivery instructions..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="rounded-lg resize-none text-sm h-16"
                  rows={2}
                />
              </div>
            </div>

            {/* Order summary */}
            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Summary</p>
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.quantity}× {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              {deliveryMethod === 'delivery' && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Delivery fee</span><span>${deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm pt-0.5">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border p-4 flex-shrink-0">
            <Button
              className="w-full h-11 rounded-xl font-semibold"
              disabled={!canPlaceOrder}
              onClick={onPlaceOrder}
            >
              Place Order · ${total.toFixed(2)}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

type Step = 'menu' | 'success'

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
  const [cartOpen, setCartOpen] = useState(false)
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({})
  const [selectedCategory, setSelectedCategory] = useState(menuCategories[0])

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('pickup')
  const [address, setAddress] = useState('')
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState('')
  const [orderNotes, setOrderNotes] = useState('')

  useEffect(() => {
    if (restaurant) setCurrentRestaurantId(restaurant.id)
    if (user) setName(user.name)
  }, [restaurant, user, setCurrentRestaurantId])

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Restaurant not found</h1>
          <Button asChild><Link href="/">Browse Restaurants</Link></Button>
        </div>
      </div>
    )
  }

  const categoryItems = menuItems.filter((item) => item.category === selectedCategory)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = deliveryMethod === 'delivery' ? 3.99 : 0
  const total = subtotal + deliveryFee

  const handleAdd = (item: typeof menuItems[0], qty: number) => {
    addToCart({ ...item, quantity: qty })
    setCartOpen(true)
  }

  const handleNoteChange = (id: string, note: string) => {
    setItemNotes((prev) => ({ ...prev, [id]: note }))
  }

  const handlePlaceOrder = () => {
    if (!name.trim() || !phone.trim()) return
    if (deliveryMethod === 'delivery' && !address.trim()) return

    addOrder({
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
    })
    clearCart()
    setCartOpen(false)
    setStep('success')
  }

  // Blur menu when cart is open and user has moved to checkout step
  // We detect this via a ref-free approach: pass a callback up from CartPanel
  // Instead, track it with a state lifted here
  const [checkingOut, setCheckingOut] = useState(false)

  const cartPanelProps = {
    cart,
    itemNotes,
    onNoteChange: handleNoteChange,
    updateCartItemQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    total,
    deliveryMethod,
    setDeliveryMethod,
    address,
    setAddress,
    name,
    setName,
    phone,
    setPhone,
    orderNotes,
    setOrderNotes,
    onClose: () => { setCartOpen(false); setCheckingOut(false) },
    onPlaceOrder: handlePlaceOrder,
    onCheckoutStepChange: setCheckingOut,
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border flex-shrink-0">
        <div className="px-4 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/r/${slug}`}
                className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-semibold text-lg leading-tight">Menu</h1>
                <p className="text-sm text-muted-foreground">{restaurant.name}</p>
              </div>
            </div>

            {/* Desktop-only cart toggle button in header */}
            {cartItemCount > 0 && (
              <Button
                className="hidden md:flex rounded-full px-5 h-10 gap-2 shadow-md"
                onClick={() => setCartOpen(!cartOpen)}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="font-semibold">{cartItemCount}</span>
                <span className="text-primary-foreground/70 text-sm">· ${subtotal.toFixed(2)}</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 relative overflow-x-hidden">
        {/* Main content — blurred when checking out */}
        <main
          className={cn(
            'flex-1 min-w-0 px-4 lg:px-8 py-6 lg:py-8 pb-24 transition-[filter] duration-300',
            cartOpen && checkingOut && 'blur-sm pointer-events-none select-none'
          )}
        >
          {step === 'menu' && (
            <>
              {/* Category tabs */}
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

              {/* Menu grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                {categoryItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    fallbackImage={categoryImages[item.category]}
                    onAdd={handleAdd}
                  />
                ))}
              </div>
            </>
          )}

          {step === 'success' && (
            <div className="max-w-md mx-auto text-center py-20">
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/30">
                <Check className="w-12 h-12 text-white" />
              </div>
              <h2 className="font-serif text-4xl italic mb-3">Order Placed!</h2>
              <p className="text-muted-foreground mb-10">
                {deliveryMethod === 'delivery'
                  ? 'Your order is on its way!'
                  : 'Your order will be ready for pickup soon!'}
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

        {/* Desktop sliding cart sidebar */}
        <aside
          className={cn(
            'hidden md:flex flex-col flex-shrink-0 border-l border-border bg-card sticky top-16 overflow-hidden transition-all duration-300 ease-in-out',
            cartOpen ? 'w-80 lg:w-96' : 'w-0'
          )}
          style={{ height: 'calc(100vh - 4rem)' }}
        >
          <div className="w-80 lg:w-96 h-full flex flex-col overflow-hidden">
            <CartPanel {...cartPanelProps} />
          </div>
        </aside>
      </div>

      {/* Mobile cart overlay */}
      {cartOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { setCartOpen(false); setCheckingOut(false) }}
          />
          <div className="relative w-[88vw] max-w-sm bg-card h-full flex flex-col shadow-2xl">
            <CartPanel {...cartPanelProps} />
          </div>
        </div>
      )}

      {/* Mobile FAB — always visible when cart has items */}
      {step === 'menu' && cartItemCount > 0 && (
        <button
          className="md:hidden fixed bottom-6 right-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center"
          onClick={() => setCartOpen(!cartOpen)}
        >
          {cartOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
