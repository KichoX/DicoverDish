'use client'

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

export function SiteHeader() {
  const router = useRouter()
  const { user, isLoggedIn, login, logout } = useAppStore()

  const handleLogin = (role: 'client' | 'admin' | 'driver') => {
    login(role)
    if (role === 'admin') {
      router.push('/admin')
    } else if (role === 'driver') {
      router.push('/driver')
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">D</span>
          </div>
          <span className="text-xl font-semibold hidden sm:inline">Dine</span>
        </Link>

        {/* Location - Desktop */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Hamburg</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cuisine, Restaurant name"
              className="pl-10 h-11 bg-muted border-0 rounded-lg"
            />
          </div>
        </div>

        {/* Search Button - Desktop */}
        <Button className="hidden md:flex h-11 px-6 rounded-lg">
          Search
        </Button>

        {/* Mobile Search Icon */}
        <Link
          href="/search"
          aria-label="Search restaurants"
          className="md:hidden ml-auto inline-flex items-center justify-center p-2 rounded-lg hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <Search className="w-5 h-5" />
        </Link>

        {/* Login / User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
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
    </header>
  )
}
