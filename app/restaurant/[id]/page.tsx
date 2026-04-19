'use client'

import { use, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Star, Clock, MapPin, Heart, Truck, ShoppingBag, 
  ChevronDown, ChevronLeft, ChevronRight, Users, Globe, Instagram, Phone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { restaurants, menuItems, menuCategories } from '@/lib/data'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { setOrderMode, setCurrentRestaurantId, isLoggedIn } = useAppStore()
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState('about')
  
  // Calendar state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [guestCount, setGuestCount] = useState(2)

  const restaurant = restaurants.find((r) => r.id === id)

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Restaurant not found</p>
      </div>
    )
  }

  // Create slug from restaurant name
  const restaurantSlug = restaurant.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  // Calendar helpers
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const timeSlots = [
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'
  ]

  const handleDateSelect = (day: number) => {
    setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
    setSelectedTime(null) // Reset time when date changes
  }

  const handleReserve = () => {
    if (!selectedDate || !selectedTime) return
    // Navigate to the restaurant's reservation page with preselected data
    const dateStr = selectedDate.toISOString().split('T')[0]
    router.push(`/r/${restaurantSlug}/reserve?date=${dateStr}&time=${encodeURIComponent(selectedTime)}&guests=${guestCount}`)
  }

  const handleOrder = (type: 'delivery' | 'pickup') => {
    setCurrentRestaurantId(id)
    setOrderMode(type)
    router.push(`/r/${restaurantSlug}/menu`)
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-medium hidden sm:inline">{restaurant.name}</span>
          </div>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Heart
              className={cn(
                'w-5 h-5',
                isFavorite ? 'fill-destructive text-destructive' : 'text-muted-foreground'
              )}
            />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="relative h-64 md:h-80 lg:h-96">
          <Image
            src={restaurant.image}
            alt={restaurant.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-card/90 text-card-foreground backdrop-blur-sm">
                <Star className="w-3 h-3 mr-1 fill-warning text-warning" />
                {restaurant.rating.toFixed(1)}
              </Badge>
              <Badge
                className={cn(
                  'backdrop-blur-sm',
                  restaurant.isOpen
                    ? 'bg-success/90 text-success-foreground'
                    : 'bg-muted/90 text-muted-foreground'
                )}
              >
                {restaurant.isOpen ? 'Open' : 'Closed'}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-1">{restaurant.name}</h1>
            <p className="text-white/80 text-sm md:text-base flex items-center gap-4">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {restaurant.address}
              </span>
              <span className="hidden md:flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {restaurant.hours}
              </span>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8 p-4 md:p-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {restaurant.cuisines.map((cuisine) => (
                <Badge key={cuisine} variant="secondary" className="rounded-full px-3 py-1">
                  {cuisine}
                </Badge>
              ))}
              {restaurant.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-full px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Order Buttons - Mobile */}
            <div className="flex gap-3 mb-6 lg:hidden">
              <Button
                variant="outline"
                className="flex-1 h-11 rounded-xl gap-2"
                onClick={() => handleOrder('pickup')}
              >
                <ShoppingBag className="w-4 h-4" />
                Pick Up
              </Button>
              <Button
                className="flex-1 h-11 rounded-xl gap-2 shadow-sm"
                onClick={() => handleOrder('delivery')}
              >
                <Truck className="w-4 h-4" />
                Delivery
              </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full rounded-xl bg-muted/50 p-1">
                <TabsTrigger value="about" className="flex-1 rounded-lg">About</TabsTrigger>
                <TabsTrigger value="menu" className="flex-1 rounded-lg">Menu</TabsTrigger>
                <TabsTrigger value="reserve" className="flex-1 rounded-lg">Reserve</TabsTrigger>
              </TabsList>

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
                      <Button variant="outline" size="sm" className="rounded-full gap-2">
                        <Phone className="w-4 h-4" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full gap-2">
                        <MapPin className="w-4 h-4" />
                        Directions
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full gap-2">
                        <Globe className="w-4 h-4" />
                        Website
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full gap-2">
                        <Instagram className="w-4 h-4" />
                        Instagram
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="menu" className="mt-6">
                {menuCategories.map((category) => {
                  const categoryItems = menuItems.filter((item) => item.category === category)
                  if (categoryItems.length === 0) return null
                  return (
                    <div key={category} className="mb-8">
                      <h3 className="font-semibold text-lg mb-4">{category}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        {categoryItems.slice(0, 4).map((item) => (
                          <Card key={item.id} className="overflow-hidden rounded-2xl border-border/60 pt-0">
                            <CardContent className="p-2.5">
                              <div className="relative aspect-square bg-muted rounded-xl overflow-hidden">
                                {item.image ? (
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : null}
                              </div>
                              <div className="px-1.5 pt-3 pb-2">
                                <h4 className="font-medium text-sm md:text-base line-clamp-1">{item.name}</h4>
                                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {item.description}
                                </p>
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
                <Button
                  className="w-full h-11 rounded-xl shadow-sm"
                  asChild
                >
                  <Link href={`/r/${restaurantSlug}/menu`}>View Full Menu & Order</Link>
                </Button>
              </TabsContent>

              <TabsContent value="reserve" className="mt-6">
                <div className="space-y-6">
                  {/* Guest Count */}
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Party Size
                    </h3>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          onClick={() => setGuestCount(num)}
                          className={cn(
                            'w-12 h-12 rounded-full border-2 font-medium transition-colors',
                            guestCount === num
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        onClick={() => setGuestCount(7)}
                        className={cn(
                          'px-4 h-12 rounded-full border-2 font-medium transition-colors',
                          guestCount > 6
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        7+
                      </button>
                    </div>
                  </div>

                  {/* Calendar */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Select Date</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={prevMonth}
                          className="p-1 rounded-full hover:bg-muted transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium min-w-[140px] text-center">
                          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </span>
                        <button
                          onClick={nextMonth}
                          className="p-1 rounded-full hover:bg-muted transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {dayNames.map((day) => (
                        <div key={day} className="text-xs text-muted-foreground py-2 font-medium">
                          {day}
                        </div>
                      ))}
                      {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="py-2" />
                      ))}
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

                  {/* Time Slots */}
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
                              selectedTime === time
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'border-border hover:border-primary/50'
                            )}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reserve Button */}
                  <Button
                    className="w-full h-11 md:h-12 rounded-xl text-sm md:text-base shadow-sm"
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

          {/* Sidebar - Desktop */}
          <div className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              {/* Quick Actions Card */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Order Online</h3>
                  <Button
                    className="w-full h-11 rounded-xl gap-2 shadow-sm"
                    onClick={() => handleOrder('delivery')}
                  >
                    <Truck className="w-4 h-4" />
                    Delivery
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-xl gap-2"
                    onClick={() => handleOrder('pickup')}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Pick Up
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Reserve Card */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Quick Reserve</h3>
                  <p className="text-sm text-muted-foreground">
                    Book a table for your next visit
                  </p>
                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-xl"
                    onClick={() => setActiveTab('reserve')}
                  >
                    Check Availability
                  </Button>
                </CardContent>
              </Card>

              {/* Restaurant Info Card */}
              <Card>
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold">Contact</h3>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {restaurant.address}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {restaurant.hours}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
