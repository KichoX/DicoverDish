'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Search, MapPin, ChevronDown, Star, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { MobileNav } from '@/components/mobile-nav'
import { Footer } from '@/components/footer'
import { restaurants } from '@/lib/data'
import { useAppStore } from '@/lib/store'

const cuisineCategories = [
  {
    name: 'Italian',
    image: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=300&h=300&fit=crop',
    count: 3,
  },
  {
    name: 'Japanese',
    image: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=300&h=300&fit=crop',
    count: 1,
  },
  {
    name: 'French',
    image: 'https://images.unsplash.com/photo-1551183053-bf91798d2e9e?w=300&h=300&fit=crop',
    count: 1,
  },
  {
    name: 'Chinese',
    image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=300&h=300&fit=crop',
    count: 2,
  },
  {
    name: 'German',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&h=300&fit=crop',
    count: 1,
  },
  {
    name: 'Vegan',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=300&fit=crop',
    count: 2,
  },
  {
    name: 'Mexican',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300&h=300&fit=crop',
    count: 0,
  },
  {
    name: 'Seafood',
    image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=300&h=300&fit=crop',
    count: 1,
  },
  {
    name: 'Indian',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&h=300&fit=crop',
    count: 0,
  },
]

const quickFilters = ['Open Now', 'Top Rated', 'Italian', 'Sushi', 'Vegan']

function RestaurantScrollCard({ restaurant }: { restaurant: typeof restaurants[number] }) {
  return (
    <Link href={`/restaurant/${restaurant.id}`} className="flex-shrink-0 w-56 group">
      <div className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-200">
        <div className="relative h-44 bg-muted">
          <Image
            src={restaurant.image}
            alt={restaurant.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-white">{restaurant.rating.toFixed(1)}</span>
          </div>
          <div
            className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              restaurant.isOpen ? 'bg-emerald-500/90 text-white' : 'bg-black/50 text-white/70'
            }`}
          >
            {restaurant.isOpen ? 'Open' : 'Closed'}
          </div>
        </div>
        <div className="p-3.5">
          <h3 className="font-semibold text-sm mb-1 line-clamp-1">{restaurant.name}</h3>
          <p className="text-xs text-muted-foreground mb-1.5">{restaurant.cuisines.join(', ')}</p>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {restaurant.description}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const { isLoggedIn, user } = useAppStore()
  const topRated = [...restaurants].sort((a, b) => b.rating - a.rating)
  const openNow = restaurants.filter((r) => r.isOpen)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader heroMode={true} />

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=1080&fit=crop"
            alt="Restaurant ambiance"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/75" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-3xl mx-auto px-4 py-32">
          <p className="text-white/70 text-xs font-semibold tracking-[0.2em] uppercase mb-5">
            Your culinary guide
          </p>
          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-5 leading-tight font-serif"
          >
            {isLoggedIn
              ? `Welcome back, ${user?.name.split(' ')[0]}`
              : 'Discover Restaurants\nYou\'ll Love'}
          </h1>
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto leading-relaxed">
            Explore the best dining experiences, reserve a table, or order from hundreds of restaurants near you.
          </p>

          {/* Search widget */}
          <div className="bg-white rounded-2xl shadow-2xl p-2 flex items-center max-w-2xl mx-auto">
            <div className="flex items-center gap-2 px-4 py-2.5 hover:bg-muted rounded-xl transition-colors cursor-pointer flex-shrink-0">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Hamburg</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div className="w-px h-7 bg-border mx-1 flex-shrink-0" />
            <input
              type="text"
              placeholder="Cuisine, restaurant name..."
              className="flex-1 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none bg-transparent min-w-0"
            />
            <Button className="rounded-xl h-10 px-5 flex-shrink-0 gap-2">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </div>

          {/* Quick filters */}
          <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
            {quickFilters.map((tag) => (
              <button
                key={tag}
                className="px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm border border-white/25 hover:bg-white/25 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
          <div className="w-px h-10 bg-white/40 rounded-full" />
        </div>
      </section>

      {/* ─── POPULAR CUISINES ─── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-1.5">
                Browse by type
              </p>
              <h2 className="text-2xl md:text-3xl font-bold">Popular Cuisines</h2>
            </div>
            <Link
              href="/search"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {cuisineCategories.map((cuisine) => (
              <Link
                key={cuisine.name}
                href={`/search?cuisine=${cuisine.name.toLowerCase()}`}
                className="flex-shrink-0 group text-center w-24 md:w-28"
              >
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden mx-auto mb-3 ring-2 ring-transparent group-hover:ring-primary/40 transition-all duration-200 shadow-sm">
                  <Image
                    src={cuisine.image}
                    alt={cuisine.name}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <p className="text-sm font-semibold">{cuisine.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {cuisine.count > 0 ? `${cuisine.count} places` : 'Coming soon'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BEST RATED ─── */}
      <section className="py-14 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-1.5">
                Guests love these
              </p>
              <h2 className="text-2xl md:text-3xl font-bold">Best Rated</h2>
            </div>
            <Link
              href="/search"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              See all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {topRated.map((r) => (
              <RestaurantScrollCard key={r.id} restaurant={r} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── OPEN NOW ─── */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-1.5">
                Ready to serve
              </p>
              <h2 className="text-2xl md:text-3xl font-bold">Open Right Now</h2>
            </div>
            <Link
              href="/search"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              See all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {openNow.map((r) => (
              <RestaurantScrollCard key={r.id} restaurant={r} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2
            className="text-3xl md:text-5xl font-bold mb-4 leading-tight font-serif"
          >
            Ready to Explore?
          </h2>
          <p className="text-primary-foreground/65 mb-8 text-lg">
            Browse all {restaurants.length} restaurants in Hamburg and find your next favourite spot.
          </p>
          <Link href="/search">
            <Button
              variant="secondary"
              size="lg"
              className="h-12 px-8 text-base rounded-xl"
            >
              View All Restaurants
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
      <MobileNav />
    </div>
  )
}
