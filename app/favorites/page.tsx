'use client'

import Link from 'next/link'
import { Heart, ArrowLeft, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Empty, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { RestaurantCard } from '@/components/restaurant-card'
import { AppShell } from '@/components/app-shell'
import { restaurants } from '@/lib/data'
import { useAppStore } from '@/lib/store'

export default function FavoritesPage() {
  const { isLoggedIn } = useAppStore()
  
  // For demo purposes, show some restaurants as favorites
  const favoriteRestaurants = restaurants.slice(0, 2)

  // Not logged in state
  if (!isLoggedIn) {
    return (
      <AppShell>
        <div className="pb-24 md:pb-8">
          <header className="md:hidden px-4 py-4 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold">Favorites</h1>
            </div>
          </header>

          <div className="max-w-md mx-auto px-4 py-16">
            <Empty className="py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <EmptyTitle>Sign in to see favorites</EmptyTitle>
              <EmptyDescription>
                Save your favorite restaurants and access them from any device.
              </EmptyDescription>
              <Button asChild className="mt-6">
                <Link href="/profile">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            </Empty>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="pb-24 md:pb-8">
        {/* Mobile Header */}
        <header className="md:hidden px-4 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold">My Favorites</h1>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="hidden md:block text-2xl font-bold mb-6">My Favorites</h1>
          
          {favoriteRestaurants.length === 0 ? (
            <Empty className="py-12">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <EmptyTitle>No favorites yet</EmptyTitle>
              <EmptyDescription>
                Tap the heart icon on restaurants to save them here
              </EmptyDescription>
              <Button asChild className="mt-4">
                <Link href="/">Explore Restaurants</Link>
              </Button>
            </Empty>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {favoriteRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
