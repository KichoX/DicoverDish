'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/lib/store'

/* ── Design-system SVG icon (matches the DDIcon paths from the prototype) ── */
function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    chevronD: <path d="m5 9 7 7 7-7" />,
    bag: <><path d="M6 7h12l-1 13H7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    heart: <path d="M12 20s-7-4.5-7-10a4.5 4.5 0 0 1 7-3.7A4.5 4.5 0 0 1 19 10c0 5.5-7 10-7 10Z" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
    delivery: <><rect x="2" y="7" width="11" height="10" rx="1" /><path d="M13 10h4l3 4v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
    logout: <><path d="M9 12h12M15 7l5 5-5 5" /><path d="M5 20H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h2" /></>,
  }
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={1.6}
      strokeLinecap="round" strokeLinejoin="round"
    >
      {paths[name] ?? null}
    </svg>
  )
}

/* ── LogoMark SVG — the brand icon ── */
function LogoMark() {
  return (
    <svg
      width="30" height="22"
      viewBox="0 0 2733 2035"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="1355" cy="225" r="225" fill="currentColor" />
      <path
        fillRule="evenodd" clipRule="evenodd"
        d="M2602.62 1755.02L2602.66 1744.6C2602.66 1136.63 2165.18 630.785 1587.82 524.762C1766.11 610.164 1889.24 792.301 1889.24 1003.19C1889.24 1193.15 1804.77 1368.55 1707.53 1506.17C1636.08 1607.3 1554.33 1692.9 1484.15 1755.02L2602.62 1755.02ZM122.102 1744.6C122.102 1140.44 554.117 637.133 1126.11 526.805C950.086 613.043 828.887 793.965 828.887 1003.19C828.887 1193.15 913.363 1368.55 1010.6 1506.17C1082.05 1607.3 1163.8 1692.9 1233.98 1755.02L122.141 1755.02L122.102 1744.6ZM1359.07 562.234C1115.53 562.234 918.109 759.656 918.109 1003.19C918.109 1331.42 1212.08 1632.62 1359.07 1742.2C1506.05 1632.62 1800.02 1331.42 1800.02 1003.19C1800.02 759.656 1602.6 562.234 1359.07 562.234ZM1130 1017C1130 1141.27 1230.73 1242 1355 1242C1479.27 1242 1580 1141.27 1580 1017C1580 892.734 1479.27 792 1355 792C1230.73 792 1130 892.734 1130 1017Z"
        fill="currentColor"
      />
      <path
        d="M2679.76 1860.64C2709.16 1860.64 2733 1899.54 2733 1947.52C2733 1995.5 2709.16 2034.39 2679.76 2034.39L53.2395 2034.39C23.8357 2034.39 0 1995.5 0 1947.52C0 1899.54 23.8357 1860.64 53.2395 1860.64L2679.76 1860.64Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function SiteHeader({ heroMode: _ }: { heroMode?: boolean } = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoggedIn, login, logout, cart } = useAppStore()

  const cartCount = cart.reduce((n, i) => n + i.quantity, 0)

  const handleLogin = (role: 'client' | 'admin' | 'driver') => {
    login(role)
    if (role === 'admin') router.push('/admin')
    else if (role === 'driver') router.push('/driver')
  }

  const navLinks = [
    { href: '/search', label: 'Discover' },
    { href: '/reservations', label: 'Reservations' },
    { href: '/favorites', label: 'Favourites' },
  ]

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'color-mix(in srgb, var(--canvas) 88%, transparent)',
        backdropFilter: 'saturate(140%) blur(12px)',
        WebkitBackdropFilter: 'saturate(140%) blur(12px)',
        borderBottom: '1px solid var(--hairline)',
      }}
    >
      <div
        className="max-w-[1280px] mx-auto px-8 flex items-center gap-6"
        style={{ height: 68 }}
      >
        {/* ── Brand: LogoMark + wordmark + edition label ── */}
        <Link
          href="/"
          className="flex items-center gap-2 flex-shrink-0"
          style={{ textDecoration: 'none', color: 'var(--ink)' }}
        >
          <LogoMark />
          <span
            className="hidden sm:inline text-[10px] font-medium uppercase tracking-[0.2em] self-center pl-2"
            style={{
              borderLeft: '1px solid var(--hairline)',
              color: 'var(--muted-ink)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Hamburg Ed.
          </span>
        </Link>

        {/* ── Center search pill ── */}
        <Link
          href="/search"
          className="hidden md:flex flex-1 max-w-[560px] items-center gap-2.5 transition-all hover:border-[color:var(--hairline-2)]"
          style={{
            height: 42,
            padding: '0 14px',
            background: 'var(--paper)',
            border: '1px solid var(--hairline)',
            borderRadius: 999,
            color: 'var(--muted-ink)',
            fontSize: 14,
            textDecoration: 'none',
          }}
          aria-label="Search"
        >
          <Icon name="search" size={16} />
          <span style={{ flex: 1 }}>Restaurants, cuisines, dishes…</span>
          <span style={{ width: 1, height: 18, background: 'var(--hairline)', flexShrink: 0 }} />
          <span style={{ color: 'var(--ink-2)', fontWeight: 500 }}>Hamburg</span>
        </Link>

        {/* ── Right nav ── */}
        <div className="flex items-center gap-[22px] ml-auto">
          {navLinks.map((link) => {
            const active = pathname === link.href || (pathname?.startsWith(link.href + '/') ?? false)
            return (
              <Link
                key={link.href}
                href={link.href}
                className="hidden md:block text-sm relative"
                style={{
                  color: active ? 'var(--ink)' : 'var(--ink-2)',
                  fontWeight: active ? 500 : 400,
                  padding: '6px 0',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            )
          })}
          <Link
            href="/"
            className="hidden md:block text-sm"
            style={{ color: 'var(--muted-ink)', padding: '6px 0', textDecoration: 'none' }}
          >
            For restaurants
          </Link>

          {/* Cart / bag icon */}
          <Link
            href="/r/9/menu"
            className="relative"
            style={{ color: 'var(--ink-2)', display: 'inline-flex' }}
            aria-label="Cart"
          >
            <Icon name="bag" size={20} />
            {cartCount > 0 && (
              <span
                className="absolute"
                style={{
                  top: -6, right: -10,
                  background: 'var(--brand)',
                  color: '#fff',
                  borderRadius: 999,
                  fontSize: 10,
                  minWidth: 16, height: 16,
                  padding: '0 4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                }}
              >
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* User pill */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1.5 cursor-pointer"
                style={{
                  height: 34,
                  padding: '0 14px',
                  background: 'var(--paper)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 999,
                  fontSize: 13,
                  color: 'var(--ink)',
                  gap: 6,
                }}
              >
                <Icon name="user" size={14} />
                <span className="hidden sm:inline">
                  {isLoggedIn ? user?.name.split(' ')[0] : 'Sign in'}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {isLoggedIn ? (
                <>
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-0.5">
                      <span>{user?.name}</span>
                      <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
                      <span className="text-xs font-medium capitalize" style={{ color: 'var(--brand)' }}>{user?.role}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user?.role === 'client' && (
                    <>
                      <DropdownMenuItem onClick={() => router.push('/profile')}>
                        <span className="mr-2"><Icon name="user" size={14} /></span>Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/favorites')}>
                        <span className="mr-2"><Icon name="heart" size={14} /></span>Favourites
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/reservations')}>
                        <span className="mr-2"><Icon name="calendar" size={14} /></span>Reservations
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      <DropdownMenuItem onClick={() => router.push('/admin')}>
                        <span className="mr-2"><Icon name="settings" size={14} /></span>Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user?.role === 'driver' && (
                    <>
                      <DropdownMenuItem onClick={() => router.push('/driver')}>
                        <span className="mr-2"><Icon name="delivery" size={14} /></span>Driver Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => { logout(); router.push('/') }}>
                    <span className="mr-2"><Icon name="logout" size={14} /></span>Sign out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>Demo login</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleLogin('client')}>
                    <div className="flex flex-col">
                      <span>Client</span>
                      <span className="text-xs text-muted-foreground">Laura Martinez</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLogin('admin')}>
                    <div className="flex flex-col">
                      <span>Admin</span>
                      <span className="text-xs text-muted-foreground">Marco Rossi</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLogin('driver')}>
                    <div className="flex flex-col">
                      <span>Driver</span>
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
