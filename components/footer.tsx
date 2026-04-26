import Link from 'next/link'

export function Footer() {
  return (
    <footer style={{ marginTop: 80, paddingTop: 48, borderTop: '1px solid var(--hairline)', color: 'var(--muted-ink)', fontSize: 13 }}>
      <div className="max-w-[1280px] mx-auto px-8">
        {/* 4-column grid */}
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8 pb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div
              className="mb-3.5"
              style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)' }}
            >
              Discover<em style={{ fontStyle: 'italic', color: 'var(--brand)' }}>Dish</em>
            </div>
            <p style={{ maxWidth: 340, lineHeight: 1.6, color: 'var(--muted-ink)' }}>
              An editor-curated guide to where to eat, reserve, and order —
              rooted in neighborhoods, written by humans.
            </p>
          </div>

          {/* Discover */}
          <div>
            <h4
              className="mb-3.5 uppercase"
              style={{ fontSize: 12, letterSpacing: '0.14em', fontWeight: 500, color: 'var(--ink)', margin: 0, marginBottom: 14 }}
            >
              Discover
            </h4>
            <ul className="flex flex-col gap-2 list-none p-0 m-0">
              {[
                { label: 'Restaurants', href: '/search' },
                { label: 'Collections',  href: '/search' },
                { label: 'Map',          href: '/search' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="transition-colors hover:text-[color:var(--ink)]" style={{ color: 'var(--muted-ink)', textDecoration: 'none' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4
              className="uppercase"
              style={{ fontSize: 12, letterSpacing: '0.14em', fontWeight: 500, color: 'var(--ink)', margin: 0, marginBottom: 14 }}
            >
              Account
            </h4>
            <ul className="flex flex-col gap-2 list-none p-0 m-0">
              {[
                { label: 'Profile',       href: '/profile' },
                { label: 'Reservations',  href: '/reservations' },
                { label: 'Favourites',    href: '/favorites' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="transition-colors hover:text-[color:var(--ink)]" style={{ color: 'var(--muted-ink)', textDecoration: 'none' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partners */}
          <div>
            <h4
              className="uppercase"
              style={{ fontSize: 12, letterSpacing: '0.14em', fontWeight: 500, color: 'var(--ink)', margin: 0, marginBottom: 14 }}
            >
              Partners
            </h4>
            <ul className="flex flex-col gap-2 list-none p-0 m-0">
              {[
                { label: 'For restaurants', href: '/' },
                { label: 'Kitchen display', href: '/admin/kitchen' },
                { label: 'Press',           href: '/' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="transition-colors hover:text-[color:var(--ink)]" style={{ color: 'var(--muted-ink)', textDecoration: 'none' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex items-center justify-between"
          style={{ paddingTop: 20, paddingBottom: 64, borderTop: '1px solid var(--hairline)', fontSize: 12 }}
        >
          <span>© 2026 DiscoverDish — Made in Hamburg</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted-2)' }}>
            v2026.4 · spring edition
          </span>
        </div>
      </div>
    </footer>
  )
}
