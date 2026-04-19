'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChefHat, ClipboardList, CalendarDays, UtensilsCrossed, LayoutDashboard, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/kitchen', icon: ChefHat, label: 'Kitchen' },
  { href: '/admin/orders', icon: ClipboardList, label: 'Orders' },
  { href: '/admin/reservations', icon: CalendarDays, label: 'Reservations' },
  { href: '/admin/menu', icon: UtensilsCrossed, label: 'Menu' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden md:block">
        <div className="p-6">
          <Link href="/" className="block hover:opacity-80 transition-opacity">
            <h1 className="text-xl font-bold">Dine Admin</h1>
            <p className="text-sm text-muted-foreground">Restaurant Dashboard</p>
          </Link>
        </div>
        <nav className="px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden sticky top-0 z-40 bg-card border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold hover:opacity-80 transition-opacity">Dine Admin</Link>
          </div>
          <nav className="flex overflow-x-auto px-4 pb-3 gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
