'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  Settings,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Heart,
  CalendarDays,
  ArrowLeft,
  Mail,
  Truck,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { AppShell } from '@/components/app-shell'
import { useAppStore } from '@/lib/store'

const menuItems = [
  { icon: Heart, label: 'My Favorites', href: '/favorites', description: 'Your saved restaurants' },
  { icon: CalendarDays, label: 'Reservations', href: '/reservations', description: 'Upcoming and past bookings' },
  { icon: CreditCard, label: 'Payment Methods', href: '#', description: 'Manage your cards' },
  { icon: Bell, label: 'Notifications', href: '#', description: 'Customize alerts' },
  { icon: Settings, label: 'Settings', href: '#', description: 'Account preferences' },
  { icon: HelpCircle, label: 'Help & Support', href: '#', description: 'Get assistance' },
]

export default function ProfilePage() {
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

  // Not logged in state
  if (!isLoggedIn) {
    return (
      <AppShell>
        <div className="pb-24 md:pb-8">
          {/* Mobile Header */}
          <header className="md:hidden px-4 py-4 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold">Profile</h1>
            </div>
          </header>

          <div className="max-w-md mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to DiscoverDish</h2>
              <p className="text-muted-foreground">Sign in to access your favorites, reservations, and more.</p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-3">
                <p className="text-sm font-medium text-muted-foreground mb-4">Demo Login Options:</p>
                <Button
                  className="w-full justify-start gap-3 h-14"
                  variant="outline"
                  onClick={() => handleLogin('client')}
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Login as Client</p>
                    <p className="text-xs text-muted-foreground">Laura Martinez</p>
                  </div>
                </Button>
                <Button
                  className="w-full justify-start gap-3 h-14"
                  variant="outline"
                  onClick={() => handleLogin('admin')}
                >
                  <div className="w-10 h-10 bg-chart-3/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Settings className="w-5 h-5 text-chart-3" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Login as Admin</p>
                    <p className="text-xs text-muted-foreground">Marco Rossi - Restaurant Manager</p>
                  </div>
                </Button>
                <Button
                  className="w-full justify-start gap-3 h-14"
                  variant="outline"
                  onClick={() => handleLogin('driver')}
                >
                  <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-success" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Login as Driver</p>
                    <p className="text-xs text-muted-foreground">Alex Driver - Delivery Partner</p>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppShell>
    )
  }

  // Logged in state
  return (
    <AppShell>
      <div className="pb-24 md:pb-8">
        {/* Mobile Header */}
        <header className="md:hidden px-4 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold">Profile</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* User Info Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {user?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{user?.name}</h2>
                  <p className="text-muted-foreground text-sm flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {user?.email}
                  </p>
                  <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">
                    {user?.role}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {menuItems.map((item) => (
              <Link key={item.label} href={item.href} className="block">
                <Card className="h-full rounded-2xl border-border/60 hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-tight">{item.label}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Logout Button */}
          <Button
            variant="outline"
            className="w-full mt-6 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              logout()
              router.push('/')
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
