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

          <div className="mt-6 md:mt-8">
            {results.length === 0 ? (
              <Empty className="border border-border bg-card">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Search className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>No matches</EmptyTitle>
                  <EmptyDescription>
                    Try a different search (restaurant name, cuisine, or a tag like “Vegan”).
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button type="button" variant="secondary" onClick={() => setQuery('')}>
                    Clear search
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <div className="space-y-4 md:space-y-5">
                {results.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
