'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, MapPin, User, ChevronDown, Heart, CalendarDays, Settings, Truck, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

function LogoMark({ className }: { className?: string }) {
  return (
    <svg width="38" height="28" viewBox="0 0 2733 2035" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className={className}>
      <circle cx="1355" cy="225" r="225" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M2602.62 1755.02L2602.66 1744.6C2602.66 1136.63 2165.18 630.785 1587.82 524.762C1766.11 610.164 1889.24 792.301 1889.24 1003.19C1889.24 1193.15 1804.77 1368.55 1707.53 1506.17C1636.08 1607.3 1554.33 1692.9 1484.15 1755.02L2602.62 1755.02ZM122.102 1744.6C122.102 1140.44 554.117 637.133 1126.11 526.805C950.086 613.043 828.887 793.965 828.887 1003.19C828.887 1193.15 913.363 1368.55 1010.6 1506.17C1082.05 1607.3 1163.8 1692.9 1233.98 1755.02L122.141 1755.02L122.102 1744.6ZM1359.07 562.234C1115.53 562.234 918.109 759.656 918.109 1003.19C918.109 1331.42 1212.08 1632.62 1359.07 1742.2C1506.05 1632.62 1800.02 1331.42 1800.02 1003.19C1800.02 759.656 1602.6 562.234 1359.07 562.234ZM1130 1017C1130 1141.27 1230.73 1242 1355 1242C1479.27 1242 1580 1141.27 1580 1017C1580 892.734 1479.27 792 1355 792C1230.73 792 1130 892.734 1130 1017Z" fill="currentColor"/>
      <path d="M2679.76 1860.64C2709.16 1860.64 2733 1899.54 2733 1947.52C2733 1995.5 2709.16 2034.39 2679.76 2034.39L53.2395 2034.39C23.8357 2034.39 0 1995.5 0 1947.52C0 1899.54 23.8357 1860.64 53.2395 1860.64L2679.76 1860.64Z" fill="currentColor"/>
    </svg>
  )
}

export function SiteHeader({ heroMode = false }: { heroMode?: boolean }) {
  const router = useRouter()
  const { user, isLoggedIn, login, logout } = useAppStore()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!heroMode) return
    const onScroll = () => setScrolled(window.scrollY > 480)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [heroMode])

  const isTransparent = heroMode && !scrolled

  const handleLogin = (role: 'client' | 'admin' | 'driver') => {
    login(role)
    if (role === 'admin') router.push('/admin')
    else if (role === 'driver') router.push('/driver')
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header
      className={cn(
        'z-50 transition-all duration-300',
        heroMode ? 'fixed top-0 left-0 right-0' : 'sticky top-0',
        isTransparent
          ? 'bg-transparent border-transparent'
          : 'bg-card/95 backdrop-blur-sm border-b border-border shadow-sm'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className={cn(
            'flex items-center gap-2 flex-shrink-0 transition-colors',
            isTransparent ? 'text-white' : 'text-foreground'
          )}
        >
          <LogoMark />
          <span
            className="text-xl hidden sm:inline font-serif"
          >
            DiscoverDish
          </span>
        </Link>

        {/* Center: Search — only visible when not transparent */}
        <div
          className={cn(
            'hidden md:flex items-center gap-3 flex-1 max-w-xl mx-6 transition-all duration-300',
            isTransparent ? 'opacity-0 pointer-events-none' : 'opacity-100'
          )}
        >
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg cursor-pointer whitespace-nowrap flex-shrink-0 hover:bg-muted/80 transition-colors">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Hamburg</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cuisine, Restaurant name"
              className="pl-10 h-11 bg-muted border-0 rounded-lg"
            />
          </div>
          <Button className="h-11 px-5 rounded-lg flex-shrink-0">Search</Button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Mobile search icon — only when not transparent */}
          {!isTransparent && (
            <Link
              href="/search"
              aria-label="Search restaurants"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>
          )}

          {/* Login / User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={isTransparent ? 'outline' : 'ghost'}
                className={cn(
                  'gap-2',
                  isTransparent && 'text-black border-black/30 hover:bg-black/10 hover:text-black'
                )}
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {isLoggedIn ? user?.name.split(' ')[0] : 'Login'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isLoggedIn ? (
                <>
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.name}</span>
                      <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
                      <span className="text-xs text-primary font-medium capitalize mt-1">{user?.role}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user?.role === 'client' && (
                    <>
                      <DropdownMenuItem onClick={() => router.push('/profile')}>
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/favorites')}>
                        <Heart className="w-4 h-4 mr-2" />
                        Favorites
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/reservations')}>
                        <CalendarDays className="w-4 h-4 mr-2" />
                        My Reservations
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      <DropdownMenuItem onClick={() => router.push('/admin')}>
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user?.role === 'driver' && (
                    <>
                      <DropdownMenuItem onClick={() => router.push('/driver')}>
                        <Truck className="w-4 h-4 mr-2" />
                        Driver Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>Demo Login</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleLogin('client')}>
                    <User className="w-4 h-4 mr-2" />
                    <div className="flex flex-col">
                      <span>Login as Client</span>
                      <span className="text-xs text-muted-foreground">Laura Martinez</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLogin('admin')}>
                    <Settings className="w-4 h-4 mr-2" />
                    <div className="flex flex-col">
                      <span>Login as Admin</span>
                      <span className="text-xs text-muted-foreground">Marco Rossi</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLogin('driver')}>
                    <Truck className="w-4 h-4 mr-2" />
                    <div className="flex flex-col">
                      <span>Login as Driver</span>
                      <span className="text-xs text-muted-foreground">Alex Driver</span>
                    </div>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
