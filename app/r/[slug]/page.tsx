'use client'

import { use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Star, Clock, MapPin, Phone, Globe, Instagram, 
  Calendar, ShoppingBag, Truck, Share2, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { restaurants } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Footer } from '@/components/footer'

// Helper to generate slug from restaurant name
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function RestaurantMicrosite({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  
  // Find restaurant by slug
  const restaurant = restaurants.find((r) => generateSlug(r.name) === slug)

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold mb-2">Restaurant not found</h1>
          <p className="text-muted-foreground mb-4">The restaurant you&apos;re looking for doesn&apos;t exist.</p>
          <Button asChild>
            <Link href="/">Browse Restaurants</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({
        title: restaurant.name,
        text: `Check out ${restaurant.name}!`,
        url,
      })
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <>
    <div className="min-h-screen bg-background">
      {/* Hero with centered content */}
      <div className="relative h-72 md:h-80">
        <Image
          src={restaurant.image}
          alt={restaurant.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        
        {/* Centered Restaurant Info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-card/90 text-card-foreground shadow-sm">
              <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
              {restaurant.rating.toFixed(1)}
            </Badge>
            <Badge className={cn(
              'shadow-sm',
              restaurant.isOpen 
                ? 'bg-emerald-500 text-white' 
                : 'bg-gray-500 text-white'
            )}>
              {restaurant.isOpen ? 'Open' : 'Closed'}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{restaurant.name}</h1>
          <p className="text-white/80 text-sm">{restaurant.cuisines.join(' • ')}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Quick Actions - 4 equal cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Link href={`/r/${slug}/reserve`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-2">
                <Calendar className="w-6 h-6 text-foreground" />
                <span className="font-medium">Reserve</span>
              </CardContent>
            </Card>
          </Link>
          
          <Link href={`/r/${slug}/menu`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-2">
                <Truck className="w-6 h-6 text-foreground" />
                <span className="font-medium">Delivery</span>
              </CardContent>
            </Card>
          </Link>
          
          <Link href={`/r/${slug}/menu`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-2">
                <ShoppingBag className="w-6 h-6 text-foreground" />
                <span className="font-medium">Pickup</span>
              </CardContent>
            </Card>
          </Link>
          
          <Card 
            className="hover:border-primary/50 transition-colors cursor-pointer"
            onClick={handleShare}
          >
            <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-2">
              <Share2 className="w-6 h-6 text-foreground" />
              <span className="font-medium">Share</span>
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* About Card */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-lg mb-3">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {restaurant.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {restaurant.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-full">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact & Location Card */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-lg">Contact & Location</h3>
              <div className="space-y-3">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{restaurant.address}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
                <p className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{restaurant.hours}</span>
                </p>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 rounded-full gap-2">
                  <Phone className="w-4 h-4" />
                  Call
                </Button>
                <Button variant="outline" size="sm" className="flex-1 rounded-full gap-2">
                  <Globe className="w-4 h-4" />
                  Website
                </Button>
                <Button variant="outline" size="sm" className="flex-1 rounded-full gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test QR Code Section - Only for Le Loup Imperial */}
        {restaurant.id === '1' && (
          <Card className="border-dashed">
            <CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground mb-3">Test QR Code Link (Table 5)</p>
              <Link href={`/r/${slug}/dine-in/table-5`}>
                <Button variant="outline" className="rounded-xl">
                  Scan QR Code (Demo)
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
    <Footer />
    </>
  )
}
