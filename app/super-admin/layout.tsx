'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Store, Users, LogOut,
  ChevronLeft, ChevronRight, UtensilsCrossed, ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

const navItems = [
  { href: '/super-admin',         icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/super-admin/restaurants', icon: Store,       label: 'Restaurants' },
  { href: '/super-admin/users',   icon: Users,           label: 'Users' },
]

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const { logout } = useAppStore()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen flex">
      <aside
        className={cn(
          'hidden md:flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out flex-shrink-0 h-screen sticky top-0',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className={cn('flex-shrink-0 border-b border-border overflow-hidden whitespace-nowrap', collapsed ? 'p-3' : 'p-5')}>
          <Link href="/" className="block hover:opacity-80 transition-opacity">
            {collapsed ? (
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <h1 className="text-lg font-bold leading-tight">DiscoverDish</h1>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Super Admin</p>
              </>
            )}
          </Link>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl transition-colors',
                  collapsed ? 'justify-center' : '',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="flex-shrink-0 px-2 pb-3 pt-3 space-y-0.5 border-t border-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand' : 'Collapse'}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl w-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
              collapsed ? 'justify-center' : ''
            )}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {!collapsed && <span className="text-sm font-medium">Collapse</span>}
          </button>

          <button
            onClick={handleLogout}
            title={collapsed ? 'Log out' : undefined}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors',
              collapsed ? 'justify-center' : ''
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Log Out</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-40 bg-card border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Super Admin</span>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <nav className="flex overflow-x-auto px-4 pb-3 gap-2 scrollbar-hide">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors flex-shrink-0',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
