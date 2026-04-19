'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Clock, MapPin, Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Restaurant } from '@/lib/types'
import { cn } from '@/lib/utils'

interface RestaurantCardProps {
  restaurant: Restaurant
  variant?: 'default' | 'compact'
}

const cuisineFlags: Record<string, string> = {
  Italian: '🇮🇹',
  French: '🇫🇷',
  Japanese: '🇯🇵',
  Mexican: '🇲🇽',
  Chinese: '🇨🇳',
  Indian: '🇮🇳',
  Thai: '🇹🇭',
  American: '🇺🇸',
  Spanish: '🇪🇸',
  Greek: '🇬🇷',
  German: '🇩🇪',
}

const tagIcons: Record<string, string> = {
  'Pet-friendly': '🐾',
  'Vegetarian': '🌿',
  'Vegan': '🌱',
  'Sushi': '🍣',
  'Omakase': '🎌',
  'Family-friendly': '👨‍👩‍👧‍👦',
  'Pizza': '🍕',
  'Seafood': '🦐',
}

export function RestaurantCard({ restaurant, variant = 'default' }: RestaurantCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <Link href={`/restaurant/${restaurant.id}`} className="block group">
      <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300">
        {/* Mobile: Horizontal layout */}
        <div className="flex md:hidden p-4 gap-4">
          {/* Image */}
          <div className="relative flex-shrink-0">
            <div className="w-28 h-28 rounded-xl overflow-hidden bg-muted">
              <Image
                src={restaurant.image}
                alt={restaurant.name}
                width={112}
                height={112}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsFavorite(!isFavorite)
              }}
              type="button"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={isFavorite}
              className="absolute top-1.5 right-1.5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 after:absolute after:-inset-2"
            >
              <Heart
                className={cn(
                  'w-3.5 h-3.5',
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                )}
              />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Rating & Status */}
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold">{restaurant.rating.toFixed(1)}</span>
              </div>
              <Badge
                className={cn(
                  'text-[10px] px-1.5 py-0 rounded font-medium border-0 h-5',
                  restaurant.isOpen
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                )}
              >
                {restaurant.isOpen ? 'Open' : 'Closed'}
              </Badge>
            </div>

            {/* Name */}
            <h3 className="font-semibold text-base leading-tight mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
              {restaurant.name}
            </h3>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-2">
              {restaurant.cuisines.slice(0, 1).map((cuisine) => (
                <span 
                  key={cuisine} 
                  className="inline-flex items-center gap-0.5 text-xs text-muted-foreground"
                >
                  <span>{cuisineFlags[cuisine] || '🍽️'}</span>
                  <span>{cuisine}</span>
                </span>
              ))}
              {restaurant.tags.slice(0, 1).map((tag) => (
                <span 
                  key={tag} 
                  className="inline-flex items-center gap-0.5 text-xs text-muted-foreground"
                >
                  <span>•</span>
                  <span>{tagIcons[tag] || '✨'}</span>
                  <span>{tag}</span>
                </span>
              ))}
            </div>

            {/* Info */}
            <div className="mt-auto space-y-0.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{restaurant.hours}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{restaurant.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: Two-column layout with larger image */}
        <div className="hidden md:flex">
          {/* Image */}
          <div className="relative flex-shrink-0">
            <div className="w-64 h-48 bg-muted">
              <Image
                src={restaurant.image}
                alt={restaurant.name}
                width={256}
                height={192}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsFavorite(!isFavorite)
              }}
              type="button"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={isFavorite}
              className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 after:absolute after:-inset-2"
            >
              <Heart
                className={cn(
                  'w-4 h-4',
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                )}
              />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-5 flex flex-col">
            {/* Top Row: Rating, Status, Name */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-amber-700">{restaurant.rating.toFixed(1)}</span>
                  </div>
                  <Badge
                    className={cn(
                      'text-xs px-2.5 py-1 rounded-full font-medium border-0',
                      restaurant.isOpen
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {restaurant.isOpen ? 'Open now' : 'Closed'}
                  </Badge>
                </div>
                <h3 className="font-semibold text-xl leading-tight group-hover:text-primary transition-colors">
                  {restaurant.name}
                </h3>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {restaurant.cuisines.map((cuisine) => (
                <span 
                  key={cuisine} 
                  className="inline-flex items-center gap-1.5 text-sm text-foreground bg-muted px-3 py-1.5 rounded-lg"
                >
                  <span>{cuisineFlags[cuisine] || '🍽️'}</span>
                  <span>{cuisine}</span>
                </span>
              ))}
              {restaurant.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="inline-flex items-center gap-1.5 text-sm text-foreground bg-muted px-3 py-1.5 rounded-lg"
                >
                  <span>{tagIcons[tag] || '✨'}</span>
                  <span>{tag}</span>
                </span>
              ))}
            </div>

            {/* Bottom Row: Info + Button */}
            <div className="mt-auto flex items-end justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{restaurant.hours}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{restaurant.address}</span>
                </div>
              </div>

              <Button 
                className="rounded-xl h-11 px-6 text-sm font-medium shadow-sm"
              >
                Check availability
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
