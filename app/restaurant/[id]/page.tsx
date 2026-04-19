'use client'

import { use, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Star, Clock, MapPin, Heart, Truck, ShoppingBag,
  ChevronLeft, ChevronRight, Users, Globe, Instagram, Phone,
  Leaf, UtensilsCrossed, CakeSlice, GlassWater, Pizza,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Footer } from '@/components/footer'
import { restaurants, menuItems, menuCategories } from '@/lib/data'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

// Placeholder icon per menu category shown when item has no image
const categoryIcons: Record<string, React.ElementType> = {
  'Starters': Leaf,
  'Main Courses': UtensilsCrossed,
  'Pizza': Pizza,
  'Desserts': CakeSlice,
  'Drinks': GlassWater,
}

// Extra hero images to rotate alongside the restaurant's own image
const extraHeroImages = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=600&fit=crop',
]

export default function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { setOrderMode, setCurrentRestaurantId } = useAppStore()
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState('about')
  const [currentSlide, setCurrentSlide] = useState(0)

  // Calendar state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [guestCount, setGuestCount] = useState(2)

  const restaurant = restaurants.find((r) => r.id === id)

  const heroImages = restaurant
    ? [restaurant.image, ...extraHeroImages]
    : extraHeroImages

  // Rotate hero images every 5 s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [heroImages.length])

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Restaurant not found</p>
      </div>
    )
  }

  const restaurantSlug = restaurant.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const timeSlots = [
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM',
  ]
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const handleDateSelect = (day: number) => {
    setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
    setSelectedTime(null)
  }

  const handleReserve = () => {
    if (!selectedDate || !selectedTime) return
    const dateStr = selectedDate.toISOString().split('T')[0]
    router.push(`/r/${restaurantSlug}/reserve?date=${dateStr}&time=${encodeURIComponent(selectedTime)}&guests=${guestCount}`)
  }

  const handleOrder = (type: 'delivery' | 'pickup') => {
    setCurrentRestaurantId(id)
    setOrderMode(type)
    router.push(`/r/${restaurantSlug}/menu`)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ─── Sticky Navbar ─── */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-3">
          {/* Left: logo + back */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 flex-shrink-0 text-foreground">
              <svg width="28" height="20" viewBox="0 0 2733 2035" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="1355" cy="225" r="225" fill="currentColor"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M2602.62 1755.02L2602.66 1744.6C2602.66 1136.63 2165.18 630.785 1587.82 524.762C1766.11 610.164 1889.24 792.301 1889.24 1003.19C1889.24 1193.15 1804.77 1368.55 1707.53 1506.17C1636.08 1607.3 1554.33 1692.9 1484.15 1755.02L2602.62 1755.02ZM122.102 1744.6C122.102 1140.44 554.117 637.133 1126.11 526.805C950.086 613.043 828.887 793.965 828.887 1003.19C828.887 1193.15 913.363 1368.55 1010.6 1506.17C1082.05 1607.3 1163.8 1692.9 1233.98 1755.02L122.141 1755.02L122.102 1744.6ZM1359.07 562.234C1115.53 562.234 918.109 759.656 918.109 1003.19C918.109 1331.42 1212.08 1632.62 1359.07 1742.2C1506.05 1632.62 1800.02 1331.42 1800.02 1003.19C1800.02 759.656 1602.6 562.234 1359.07 562.234ZM1130 1017C1130 1141.27 1230.73 1242 1355 1242C1479.27 1242 1580 1141.27 1580 1017C1580 892.734 1479.27 792 1355 792C1230.73 792 1130 892.734 1130 1017Z" fill="currentColor"/>
                <path d="M2679.76 1860.64C2709.16 1860.64 2733 1899.54 2733 1947.52C2733 1995.5 2709.16 2034.39 2679.76 2034.39L53.2395 2034.39C23.8357 2034.39 0 1995.5 0 1947.52C0 1899.54 23.8357 1860.64 53.2395 1860.64L2679.76 1860.64Z" fill="currentColor"/>
              </svg>
              <span className="text-base font-serif hidden sm:inline">DiscoverDish</span>
            </Link>

            <span className="text-border">|</span>

            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{restaurant.name}</span>
            </button>
          </div>

          {/* Right: favourite */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Heart className={cn('w-5 h-5', isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full flex-1">
        {/* ─── Hero Slideshow ─── */}
        <div className="relative h-64 md:h-80 lg:h-[420px] overflow-hidden">
          {heroImages.map((src, i) => (
            <div
              key={src}
              className={cn(
                'absolute inset-0 transition-opacity duration-1000',
                currentSlide === i ? 'opacity-100' : 'opacity-0'
              )}
            >
              <Image src={src} alt={restaurant.name} fill className="object-cover" priority={i === 0} />
            </div>
          ))}

          {/* Gradient — heavy at bottom 20% */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.15) 60%, transparent 100%)' }}
          />

          {/* Slide dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all duration-300',
                  currentSlide === i ? 'bg-white w-4' : 'bg-white/50'
                )}
              />
            ))}
          </div>

          {/* Hero text */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-black/50 text-white backdrop-blur-sm border-0">
                <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" />
                {restaurant.rating.toFixed(1)}
              </Badge>
              <Badge className={cn('backdrop-blur-sm border-0', restaurant.isOpen ? 'bg-emerald-500/80 text-white' : 'bg-black/50 text-white/70')}>
                {restaurant.isOpen ? 'Open' : 'Closed'}
              </Badge>
            </div>

            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{restaurant.name}</h1>

            {/* Hours + tags on same row */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 text-white/80 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                {restaurant.address}
              </span>
              <span className="flex items-center gap-1 text-white/80 text-sm">
                <Clock className="w-3.5 h-3.5" />
                {restaurant.hours}
              </span>
              {restaurant.cuisines.map((c) => (
                <Badge key={c} className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs">
                  {c}
                </Badge>
              ))}
              {restaurant.tags.map((t) => (
                <Badge key={t} className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Content ─── */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8 p-4 md:p-8">
          {/* Main */}
          <div className="lg:col-span-2">
            {/* Order buttons — mobile */}
            <div className="flex gap-3 mb-6 lg:hidden">
              <Button variant="outline" className="flex-1 h-11 rounded-xl gap-2" onClick={() => handleOrder('pickup')}>
                <ShoppingBag className="w-4 h-4" /> Pick Up
              </Button>
              <Button className="flex-1 h-11 rounded-xl gap-2 shadow-sm" onClick={() => handleOrder('delivery')}>
                <Truck className="w-4 h-4" /> Delivery
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full rounded-xl bg-muted/50 p-1">
                <TabsTrigger value="about" className="flex-1 rounded-lg">About</TabsTrigger>
                <TabsTrigger value="menu" className="flex-1 rounded-lg">Menu</TabsTrigger>
                <TabsTrigger value="reserve" className="flex-1 rounded-lg">Reserve</TabsTrigger>
              </TabsList>

              {/* ── About ── */}
              <TabsContent value="about" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">About</h3>
                    <p className="text-muted-foreground leading-relaxed">{restaurant.description}</p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Hours</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{restaurant.hours}</span>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Contact & Links</h3>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" size="sm" className="rounded-full gap-2"><Phone className="w-4 h-4" />Call</Button>
                      <Button variant="outline" size="sm" className="rounded-full gap-2"><MapPin className="w-4 h-4" />Directions</Button>
                      <Button variant="outline" size="sm" className="rounded-full gap-2"><Globe className="w-4 h-4" />Website</Button>
                      <Button variant="outline" size="sm" className="rounded-full gap-2"><Instagram className="w-4 h-4" />Instagram</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ── Menu ── */}
              <TabsContent value="menu" className="mt-6">
                {menuCategories.map((category) => {
                  const categoryItems = menuItems.filter((item) => item.category === category)
                  if (categoryItems.length === 0) return null
                  const PlaceholderIcon = categoryIcons[category] ?? UtensilsCrossed
                  return (
                    <div key={category} className="mb-8">
                      <h3 className="font-semibold text-lg mb-4">{category}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        {categoryItems.slice(0, 4).map((item) => (
                          <Card key={item.id} className="overflow-hidden rounded-2xl border-border/60 pt-0">
                            <CardContent className="p-2.5">
                              <div className="relative aspect-square bg-muted rounded-xl overflow-hidden">
                                {item.image ? (
                                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                                ) : (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted">
                                    <PlaceholderIcon className="w-10 h-10 text-muted-foreground/40" strokeWidth={1.2} />
                                  </div>
                                )}
                              </div>
                              <div className="px-1.5 pt-3 pb-2">
                                <h4 className="font-medium text-sm md:text-base line-clamp-1">{item.name}</h4>
                                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                                <div className="mt-2 flex items-center justify-between">
                                  <p className="font-semibold">${item.price.toFixed(2)}</p>
                                  <Button size="sm" className="h-8 rounded-full px-3 shadow-sm" asChild>
                                    <Link href={`/r/${restaurantSlug}/menu`}>Add</Link>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                })}
                <Button className="w-full h-11 rounded-xl shadow-sm" asChild>
                  <Link href={`/r/${restaurantSlug}/menu`}>View Full Menu & Order</Link>
                </Button>
              </TabsContent>

              {/* ── Reserve ── */}
              <TabsContent value="reserve" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Party Size
                    </h3>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          onClick={() => setGuestCount(num)}
                          className={cn(
                            'w-12 h-12 rounded-full border-2 font-medium transition-colors',
                            guestCount === num ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50'
                          )}
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        onClick={() => setGuestCount(7)}
                        className={cn(
                          'px-4 h-12 rounded-full border-2 font-medium transition-colors',
                          guestCount > 6 ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50'
                        )}
                      >
                        7+
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Select Date</h3>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1 rounded-full hover:bg-muted transition-colors">
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium min-w-[140px] text-center">
                          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </span>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1 rounded-full hover:bg-muted transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {dayNames.map((day) => (
                        <div key={day} className="text-xs text-muted-foreground py-2 font-medium">{day}</div>
                      ))}
                      {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e-${i}`} />)}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1
                        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                        const isSelected = selectedDate?.toDateString() === date.toDateString()
                        const isPast = date < today
                        return (
                          <button
                            key={day}
                            onClick={() => !isPast && handleDateSelect(day)}
                            disabled={isPast}
                            className={cn(
                              'w-10 h-10 mx-auto rounded-full text-sm transition-all flex items-center justify-center',
                              isSelected && 'bg-primary text-primary-foreground font-medium scale-110',
                              isPast && 'text-muted-foreground/40 cursor-not-allowed',
                              !isSelected && !isPast && 'hover:bg-primary/10'
                            )}
                          >
                            {day}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {selectedDate && (
                    <div>
                      <h3 className="font-medium mb-3">Available Times</h3>
                      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={cn(
                              'px-3 py-2 rounded-lg text-sm font-medium border transition-colors',
                              selectedTime === time ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'
                            )}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full h-11 md:h-12 rounded-xl shadow-sm"
                    disabled={!selectedDate || !selectedTime}
                    onClick={handleReserve}
                  >
                    {selectedDate && selectedTime
                      ? `Reserve for ${guestCount} on ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${selectedTime}`
                      : 'Select a date and time'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* ─── Sidebar — desktop ─── */}
          <div className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Order Online</h3>
                  <Button className="w-full h-11 rounded-xl gap-2 shadow-sm" onClick={() => handleOrder('delivery')}>
                    <Truck className="w-4 h-4" /> Delivery
                  </Button>
                  <Button variant="outline" className="w-full h-11 rounded-xl gap-2" onClick={() => handleOrder('pickup')}>
                    <ShoppingBag className="w-4 h-4" /> Pick Up
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Quick Reserve</h3>
                  <p className="text-sm text-muted-foreground">Book a table for your next visit</p>
                  <Button variant="outline" className="w-full h-11 rounded-xl" onClick={() => setActiveTab('reserve')}>
                    Check Availability
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold">Contact</h3>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4" />{restaurant.address}</p>
                    <p className="flex items-center gap-2"><Clock className="w-4 h-4" />{restaurant.hours}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
