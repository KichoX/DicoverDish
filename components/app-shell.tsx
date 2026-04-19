'use client'

import { SiteHeader } from './site-header'
import { MobileNav } from './mobile-nav'
import { useAppStore } from '@/lib/store'

interface AppShellProps {
  children: React.ReactNode
  showNav?: boolean
  showHeader?: boolean
}

export function AppShell({ children, showNav = true, showHeader = true }: AppShellProps) {
  const { isLoggedIn, user } = useAppStore()
  
  // Don't show mobile nav for admin/driver roles
  const showMobileNav = showNav && (!isLoggedIn || user?.role === 'client')
  
  return (
    <div className="min-h-screen bg-background">
      {/* Site Header */}
      {showHeader && <SiteHeader />}
      
      {/* Main content */}
      <main className="min-h-[calc(100vh-64px)]">
        {children}
      </main>
      
      {/* Mobile Navigation - only for guests and clients */}
      {showMobileNav && <MobileNav />}
    </div>
  )
}
