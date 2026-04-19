'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, CalendarDays, Clock, Users, Star, Utensils, ChevronRight, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RestaurantCard } from '@/components/restaurant-card'
import { AppShell } from '@/components/app-shell'
import { restaurants } from '@/lib/data'
import { useAppStore } from '@/lib/store'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const filterPills = [
  { id: 'all', label: 'All Filters', icon: SlidersHorizontal, active: true },
  { id: 'open', label: 'Open now', icon: Clock },
  { id: 'top', label: 'Top rated', icon: Star },
  { id: 'cuisine', label: 'Cuisine', icon: Utensils, hasDropdown: true },
]

export default function HomePage() {
  const { isLoggedIn, user } = useAppStore()
  const [activeFilter, setActiveFilter] = useState('all')
  
  const today = new Date()
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })
  const monthDay = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <AppShell>
      <div className="pb-24 md:pb-8">
        {/* Mobile Header - Greeting */}
        <div className="md:hidden px-4 pt-4 pb-2">
          <h1 className="text-2xl font-bold">
            {isLoggedIn ? `Hi, ${user?.name.split(' ')[0]}` : 'Discover'} <span role="img" aria-label="wave">👋</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            {dayName}, {monthDay} - Today
          </p>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 py-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search your place here"
                className="pl-10 bg-muted border-0 h-12 rounded-xl"
              />
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-border">
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Desktop Filter Bar */}
        <div className="hidden md:block border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Date Select */}
              <Select defaultValue="today">
                <SelectTrigger className="w-[150px] h-11 rounded-xl bg-muted/60 border border-border/50 text-sm font-medium">
                  <CalendarDays className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Time Select */}
              <Select defaultValue="now">
                <SelectTrigger className="w-[140px] h-11 rounded-xl bg-muted/60 border border-border/50 text-sm font-medium">
                  <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">Now</SelectItem>
                  <SelectItem value="12">12:00</SelectItem>
                  <SelectItem value="13">13:00</SelectItem>
                  <SelectItem value="18">18:00</SelectItem>
                  <SelectItem value="19">19:00</SelectItem>
                  <SelectItem value="20">20:00</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Party Size */}
              <Select defaultValue="2">
                <SelectTrigger className="w-[140px] h-11 rounded-xl bg-muted/60 border border-border/50 text-sm font-medium">
                  <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Party" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 person</SelectItem>
                  <SelectItem value="2">2 people</SelectItem>
                  <SelectItem value="3">3 people</SelectItem>
                  <SelectItem value="4">4 people</SelectItem>
                  <SelectItem value="5">5 people</SelectItem>
                  <SelectItem value="6">6+ people</SelectItem>
                </SelectContent>
              </Select>

              <div className="w-px h-8 bg-border mx-2" />

              {/* Filter Pills */}
              {filterPills.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? 'default' : 'outline'}
                  size="sm"
                  className="h-11 px-5 rounded-full gap-2 text-sm font-medium"
                  onClick={() => setActiveFilter(filter.id)}
                >
                  <filter.icon className="w-4 h-4" />
                  {filter.label}
                  {filter.hasDropdown && <ChevronDown className="w-3 h-3 ml-1" />}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {/* Desktop: Title and description */}
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl font-bold mb-2">
              Restaurants in Hamburg <span className="text-muted-foreground font-normal text-base ml-2">{restaurants.length} Restaurants</span>
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
              Hamburg is a paradise for foodies - from fish markets on the Elbe to trendy restaurants on the harbor mile.
              Discover international cuisine, sushi bars, modern tapas, and starred restaurants.
            </p>
          </div>

          {/* Sort Bar - Desktop */}
          <div className="hidden md:flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              Showing {restaurants.length} results
            </span>
            <Select defaultValue="relevance">
              <SelectTrigger className="w-[160px] h-9 text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile: Sections */}
          <div className="md:hidden space-y-8">
            {/* Cafes Nearby */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Cafes nearby</h2>
                <Link
                  href="/search"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-4">
                {restaurants.slice(0, 3).map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            </section>

            {/* My Top - Only when logged in */}
            {isLoggedIn && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">My top</h2>
                  <Link
                    href="/favorites"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    View all
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {restaurants.slice(1, 4).map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Desktop: Two Column Layout */}
          <div className="hidden md:grid md:grid-cols-[1fr_400px] gap-8">
            {/* Restaurant List */}
            <div className="space-y-5">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} variant="default" />
              ))}
            </div>
            
            {/* Map Placeholder */}
            <div className="sticky top-24 h-[calc(100vh-120px)]">
              <div className="w-full h-full bg-muted rounded-xl flex items-center justify-center border border-border overflow-hidden">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground text-sm">Map view</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
