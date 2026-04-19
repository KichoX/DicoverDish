'use client'

import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { RestaurantCard } from '@/components/restaurant-card'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { restaurants } from '@/lib/data'

export default function SearchPage() {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return restaurants
    return restaurants.filter((r) => {
      const haystack = [
        r.name,
        r.address,
        ...(r.cuisines ?? []),
        ...(r.tags ?? []),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [query])

  return (
    <AppShell>
      <div className="pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search restaurants, cuisine, tags..."
                className="pl-10 h-12 md:h-11 rounded-xl bg-muted border-0"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 md:h-11 md:w-11 rounded-xl"
              aria-label="Filters (coming soon)"
              disabled
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-6 md:mt-8 md:grid md:grid-cols-[1fr_40%] md:gap-6 md:items-start">
            {/* Results */}
            <div>
              {results.length === 0 ? (
                <Empty className="border border-border bg-card">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Search className="size-6" />
                    </EmptyMedia>
                    <EmptyTitle>No matches</EmptyTitle>
                    <EmptyDescription>
                      Try a different search (restaurant name, cuisine, or a tag like "Vegan").
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button type="button" variant="secondary" onClick={() => setQuery('')}>
                      Clear search
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    {results.length} {results.length === 1 ? 'restaurant' : 'restaurants'} found
                  </p>
                  <div className="space-y-4 md:space-y-5">
                    {results.map((restaurant) => (
                      <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Map panel — sticky, right 40% */}
            <div className="hidden md:block sticky top-20 h-[calc(100vh-5rem)]">
              <div className="w-full h-full rounded-2xl border border-border bg-muted overflow-hidden flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center border border-border">
                  <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-muted-foreground">Map coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
