'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Heart, User, CalendarDays, Settings, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'

export function MobileNav() {
  const pathname = usePathname()
  const { isLoggedIn, user } = useAppStore()

  type NavItem = { href: string; icon: React.ComponentType<{ className?: string }>; label: string; isCenter?: boolean }

  // Not logged in
  if (!isLoggedIn) {
    const items: NavItem[] = [
      { href: '/', icon: Home, label: 'Home' },
      { href: '/search', icon: Compass, label: 'Search', isCenter: true },
      { href: '/login', icon: User, label: 'Sign in' },
    ]
    return <NavBar items={items} pathname={pathname} />
  }

  // Client
  if (user?.role === 'client') {
    const items: NavItem[] = [
      { href: '/', icon: Home, label: 'Home' },
      { href: '/search', icon: Compass, label: 'Search' },
      { href: '/reservations', icon: CalendarDays, label: 'Reservations', isCenter: true },
      { href: '/favorites', icon: Heart, label: 'Favourites' },
      { href: '/profile', icon: User, label: 'Profile' },
    ]
    return <NavBar items={items} pathname={pathname} />
  }

  // Admin
  if (user?.role === 'admin') {
    const items: NavItem[] = [
      { href: '/', icon: Home, label: 'Home' },
      { href: '/admin', icon: Settings, label: 'Dashboard', isCenter: true },
      { href: '/profile', icon: User, label: 'Profile' },
    ]
    return <NavBar items={items} pathname={pathname} />
  }

  // Super admin
  if (user?.role === 'superadmin') {
    const items: NavItem[] = [
      { href: '/', icon: Home, label: 'Home' },
      { href: '/super-admin', icon: ShieldCheck, label: 'Super Admin', isCenter: true },
      { href: '/profile', icon: User, label: 'Profile' },
    ]
    return <NavBar items={items} pathname={pathname} />
  }

  return null
}

function NavBar({ items, pathname }: { items: { href: string; icon: React.ComponentType<{ className?: string }>; label: string; isCenter?: boolean }[]; pathname: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" role="navigation" aria-label="Bottom navigation">
      <div className="relative">
        <svg viewBox="0 0 375 80" className="w-full h-20 fill-card drop-shadow-[0_-4px_6px_rgba(0,0,0,0.05)]" preserveAspectRatio="none">
          <path d="M0 20 Q187.5 0 375 20 L375 80 L0 80 Z" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-around px-4 pt-2 pb-[max(env(safe-area-inset-bottom),0px)]">
          {items.map((item) => {
            const isActive = pathname === item.href
            if (item.isCenter) {
              return (
                <Link key={item.href} href={item.href} aria-label={item.label} className="relative -mt-8">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 bg-primary">
                    <item.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="mt-1 text-[11px] font-medium text-center text-muted-foreground">{item.label}</div>
                </Link>
              )
            }
            return (
              <Link key={item.href} href={item.href} aria-label={item.label}
                className={cn('flex flex-col items-center justify-center gap-1 transition-colors py-2 min-w-[64px]',
                  isActive ? 'text-primary' : 'text-muted-foreground')}>
                <item.icon className="w-5 h-5" />
                <span className={cn('text-[11px] font-medium', isActive ? 'text-primary' : 'text-muted-foreground')}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
