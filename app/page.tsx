'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { SiteHeader } from '@/components/site-header'
import { MobileNav } from '@/components/mobile-nav'
import { Footer } from '@/components/footer'
import { restaurants } from '@/lib/data'

/* ── Inline SVG icons matching the prototype's DDIcon paths ── */
function Icon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    pin:    <><path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12Z" /><circle cx="12" cy="9" r="2.5" /></>,
    chevronD: <path d="m5 9 7 7 7-7" />,
    arrow:  <><path d="M5 12h14" /><path d="M13 5l7 7-7 7" /></>,
    heart:  <path d="M12 20s-7-4.5-7-10a4.5 4.5 0 0 1 7-3.7A4.5 4.5 0 0 1 19 10c0 5.5-7 10-7 10Z" />,
    heartFill: <path d="M12 20s-7-4.5-7-10a4.5 4.5 0 0 1 7-3.7A4.5 4.5 0 0 1 19 10c0 5.5-7 10-7 10Z" fill="currentColor" />,
    star:   <path d="M12 3.5 14.6 9l6 .9-4.3 4.2 1 6-5.3-2.8L6.6 20l1-6L3.4 9.9l6-.9Z" fill="currentColor" stroke="none" />,
    flame:  <path d="M12 3c0 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 2-4M12 14a2 2 0 0 1 2 2 2 2 0 0 1-4 0c0-1 .5-1.5 1-2" />,
    bolt:   <path d="M13 3 5 14h6l-1 7 8-11h-6Z" />,
    sun:    <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></>,
    users:  <><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /><path d="M16 7.5a3 3 0 0 1 0 5.5M21 19.5c0-2-1.5-3.5-3.5-4.2" /></>,
    moon:   <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" /></>,
  }
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={1.6}
      strokeLinecap="round" strokeLinejoin="round"
      className={className}
    >
      {paths[name] ?? null}
    </svg>
  )
}

/* ── Data ── */
const moods = [
  { id: 'date',     icon: 'flame',     label: 'Date night',     desc: 'Low light, slow pace' },
  { id: 'quick',    icon: 'bolt',      label: 'Quick lunch',    desc: 'In and out in 30' },
  { id: 'brunch',   icon: 'sun',       label: 'Weekend brunch', desc: 'Eggs & espresso' },
  { id: 'friends',  icon: 'users',     label: 'With friends',   desc: 'Sharing plates' },
  { id: 'solo',     icon: 'moon',      label: 'Solo dinner',    desc: 'Counter seats' },
  { id: 'business', icon: 'briefcase', label: 'Business',       desc: 'Quiet, reliable' },
]

const trending = ['Natural wine bars', 'Omakase', 'Sunday brunch', '72-hour pizza', 'Date night · €€€']

const cities = [
  { name: 'Hamburg', count: 9,    img: 'https://images.unsplash.com/photo-1552751753-0fc84ae6b9e3?w=800&q=80' },
  { name: 'Berlin',  count: 1214, img: 'https://images.unsplash.com/photo-1587330979470-3595ac045ab0?w=800&q=80' },
  { name: 'Munich',  count: 844,  img: 'https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800&q=80' },
  { name: 'Cologne', count: 438,  img: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80' },
]

function priceLevel(rating: number) {
  const lvl = rating >= 4.7 ? 4 : rating >= 4.4 ? 3 : rating >= 4.0 ? 2 : 1
  return (
    <span style={{ fontSize: 13, letterSpacing: 1, color: 'var(--muted-ink)' }}>
      <span style={{ color: 'var(--ink)' }}>{'€'.repeat(lvl)}</span>
      <span>{'€'.repeat(4 - lvl)}</span>
    </span>
  )
}

/* ── Restaurant card (5/4 aspect, editorial) ── */
function RestaurantCard({ r, faved = false, onFav }: {
  r: (typeof restaurants)[number]
  faved?: boolean
  onFav?: (id: string) => void
}) {
  const hasDelivery = r.tags.some((t) => t.toLowerCase() === 'delivery')
  const etaMin = 15 + (parseInt(r.id) * 7) % 20

  return (
    <Link href={`/r/${r.id}`} className="block group" style={{ textDecoration: 'none' }}>
      <div
        className="relative overflow-hidden mb-3.5"
        style={{ aspectRatio: '5/4', borderRadius: 'var(--radius)' }}
      >
        <Image
          src={r.image}
          alt={r.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {/* Fav button */}
        <button
          onClick={(e) => { e.preventDefault(); onFav?.(r.id) }}
          className="absolute top-3 right-3 flex items-center justify-center transition-colors"
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)',
            border: 'none', cursor: 'pointer',
            color: faved ? 'var(--brand)' : 'var(--ink)',
            backdropFilter: 'blur(6px)',
          }}
          aria-label="Favourite"
        >
          <Icon name={faved ? 'heartFill' : 'heart'} size={16} />
        </button>
        {/* Delivery badge */}
        {hasDelivery && (
          <span
            className="absolute bottom-3 left-3 flex items-center gap-1.5 uppercase"
            style={{
              background: 'var(--ink)',
              color: 'var(--canvas)',
              padding: '3px 8px',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.05em',
            }}
          >
            {etaMin} min · delivery
          </span>
        )}
      </div>
      <div>
        <div
          className="mb-1 uppercase"
          style={{ fontSize: 11, letterSpacing: '0.08em', fontWeight: 500, color: 'var(--muted-2)' }}
        >
          {r.cuisines.join(' · ')} · Hamburg
        </div>
        <h3
          className="mb-1.5 group-hover:underline decoration-[color:var(--brand)] underline-offset-4"
          style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, color: 'var(--ink)', margin: 0, marginBottom: 6 }}
        >
          {r.name}
        </h3>
        <div className="flex items-center gap-2.5" style={{ fontSize: 13, color: 'var(--muted-ink)' }}>
          <span className="flex items-center gap-1">
            <Icon name="star" size={13} className="text-[color:var(--gold)]" />
            <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{r.rating.toFixed(1)}</span>
          </span>
          <span style={{ color: 'var(--hairline-2)' }}>·</span>
          {priceLevel(r.rating)}
        </div>
      </div>
    </Link>
  )
}

/* ── Collection section ── */
function Collection({
  label = 'Collection',
  title,
  sub,
  items,
  favs,
  onFav,
}: {
  label?: string
  title: string
  sub?: string
  items: (typeof restaurants)[number][]
  favs?: Set<string>
  onFav?: (id: string) => void
}) {
  return (
    <section className="py-14" style={{ borderBottom: '1px solid var(--hairline)' }}>
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="flex items-baseline justify-between gap-4 mb-7">
          <div>
            <p className="uppercase mb-2.5" style={{ fontSize: 10, letterSpacing: '0.14em', fontWeight: 500, color: 'var(--muted-2)' }}>
              {label}
            </p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 38, fontWeight: 400, letterSpacing: '-0.01em', color: 'var(--ink)', margin: 0 }}>
              {title}
            </h2>
            {sub && (
              <p className="mt-1.5" style={{ fontSize: 14, color: 'var(--muted-ink)' }}>{sub}</p>
            )}
          </div>
          <Link
            href="/search"
            className="flex items-center gap-1.5 flex-shrink-0 transition-colors hover:text-[color:var(--ink)]"
            style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontStyle: 'italic', color: 'var(--muted-ink)', textDecoration: 'none' }}
          >
            See all <Icon name="arrow" size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-7">
          {items.map((r) => (
            <RestaurantCard key={r.id} r={r} faved={favs?.has(r.id)} onFav={onFav} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Main page ── */
export default function HomePage() {
  const [query, setQuery] = useState('')
  const [favs, setFavs] = useState<Set<string>>(new Set())
  const router = useRouter()

  const toggleFav = (id: string) =>
    setFavs((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const openNow  = restaurants.filter((r) => r.isOpen)
  const topRated = [...restaurants].sort((a, b) => b.rating - a.rating).slice(0, 4)
  const walkIn   = openNow.slice(0, 4)
  const featured = restaurants.find((r) => r.id === '9') ?? restaurants[0]

  const avgRating = (restaurants.reduce((s, r) => s + r.rating, 0) / restaurants.length).toFixed(1)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search${query.trim() ? `?q=${encodeURIComponent(query)}` : ''}`)
  }

  return (
    <div style={{ background: 'var(--canvas)' }}>
      <SiteHeader />

      {/* ════════ HERO ════════ */}
      <section
        className="home-hero relative overflow-hidden"
        style={{ padding: '48px 0 80px', borderBottom: '1px solid var(--hairline)' }}
      >
        {/* Soft glow decoration */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            top: -120, right: -160,
            width: 520, height: 520,
            background: `radial-gradient(circle, color-mix(in srgb, var(--brand-soft) 70%, transparent), transparent 60%)`,
          }}
        />

        <div className="max-w-[1280px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-16 items-center">

            {/* Left */}
            <div>
              <p
                className="uppercase mb-5"
                style={{ fontSize: 11, letterSpacing: '0.12em', fontWeight: 500, color: 'var(--muted-ink)' }}
              >
                Issue №17 · Spring 2026 · Hamburg
              </p>

              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(48px, 5.5vw, 88px)',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  color: 'var(--ink)',
                  margin: 0,
                }}
              >
                Eat somewhere<br />
                <em style={{ fontStyle: 'italic', color: 'var(--brand)' }}>worth remembering</em><br />
                tonight.
              </h1>

              <p
                style={{
                  margin: '26px 0 32px',
                  fontSize: 17,
                  lineHeight: 1.6,
                  color: 'var(--muted-ink)',
                  maxWidth: 480,
                }}
              >
                An editor-curated guide to where to book, walk into, and order in from —
                written by people who actually eat there.
              </p>

              {/* Search bar */}
              <form
                onSubmit={handleSearch}
                className="flex items-stretch gap-1 max-w-[580px] mb-5"
                style={{
                  background: 'var(--paper)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 999,
                  padding: 6,
                  boxShadow: '0 1px 2px rgba(26,23,20,0.04), 0 4px 12px rgba(26,23,20,0.04)',
                }}
              >
                <div
                  className="flex items-center gap-1.5 flex-shrink-0"
                  style={{
                    padding: '0 16px',
                    borderRight: '1px solid var(--hairline)',
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon name="pin" size={16} />
                  <span>Hamburg</span>
                  <Icon name="chevronD" size={14} />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ramen, natural wine, terrace, anniversary…"
                  className="flex-1 min-w-0 bg-transparent border-none outline-none"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 15,
                    color: 'var(--ink)',
                    padding: '0 14px',
                  }}
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 flex-shrink-0 transition-opacity hover:opacity-85"
                  style={{
                    padding: '0 22px',
                    height: 'auto',
                    background: 'var(--brand)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <Icon name="search" size={16} />
                  <span>Search</span>
                </button>
              </form>

              {/* Trending chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', marginRight: 4 }}>
                  Trending
                </span>
                {trending.map((t) => (
                  <Link
                    key={t}
                    href={`/search?q=${encodeURIComponent(t)}`}
                    className="flex items-center gap-1.5 transition-colors"
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      fontSize: 12.5,
                      background: 'var(--paper)',
                      border: '1px solid var(--hairline)',
                      color: 'var(--ink-2)',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right — cover card + stats */}
            <div className="hidden md:flex flex-col gap-5">
              {/* Cover card */}
              <div
                style={{
                  background: 'var(--paper)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 20,
                  padding: 28,
                  boxShadow: '0 1px 2px rgba(26,23,20,0.04), 0 4px 12px rgba(26,23,20,0.04)',
                }}
              >
                <p
                  className="uppercase mb-3"
                  style={{ fontSize: 10, letterSpacing: '0.14em', fontWeight: 500, color: 'var(--muted-2)' }}
                >
                  On the cover
                </p>
                <blockquote
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 22,
                    lineHeight: 1.3,
                    fontStyle: 'italic',
                    margin: '14px 0 22px',
                    fontWeight: 400,
                    color: 'var(--ink)',
                  }}
                >
                  "Authentic Italian, celebrated for stone-oven pizzas baked to perfection."
                </blockquote>
                <div className="flex items-center gap-3.5">
                  <div
                    className="relative flex-shrink-0 overflow-hidden"
                    style={{ width: 64, height: 64, borderRadius: 8 }}
                  >
                    <Image src={featured.image} alt={featured.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 400, color: 'var(--ink)' }}>{featured.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted-ink)' }}>Hamburg · Italian</div>
                  </div>
                  <Link
                    href={`/r/${featured.id}`}
                    className="flex-shrink-0 flex items-center gap-1 transition-colors"
                    style={{
                      height: 34, padding: '0 14px',
                      background: 'var(--paper)',
                      border: '1px solid var(--hairline)',
                      borderRadius: 999,
                      fontSize: 13,
                      color: 'var(--ink)',
                      textDecoration: 'none',
                      marginLeft: 'auto',
                    }}
                  >
                    Read →
                  </Link>
                </div>
              </div>

              {/* Stats row */}
              <div
                className="grid grid-cols-3 overflow-hidden"
                style={{
                  background: 'var(--hairline)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 20,
                  gap: 1,
                }}
              >
                {[
                  { n: String(restaurants.length), l: 'places in Hamburg' },
                  { n: String(openNow.length),     l: 'open tonight' },
                  { n: avgRating + '★',            l: 'avg rating' },
                ].map((s) => (
                  <div key={s.l} style={{ background: 'var(--paper)', padding: 20 }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 32,
                        fontWeight: 400,
                        letterSpacing: '-0.01em',
                        marginBottom: 4,
                        color: 'var(--ink)',
                      }}
                    >
                      {s.n}
                    </div>
                    <div
                      className="uppercase"
                      style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--muted-ink)' }}
                    >
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════ MOOD ROW ════════ */}
      <section
        style={{
          borderBottom: '1px solid var(--hairline)',
          background: 'var(--paper)',
          padding: '28px 0',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="flex items-center gap-8 md:gap-10">
            {/* Label col */}
            <div
              className="hidden md:block flex-shrink-0 pr-8"
              style={{ borderRight: '1px solid var(--hairline)', width: 200 }}
            >
              <p
                style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 400, color: 'var(--ink)', marginBottom: 4 }}
              >
                What&apos;s the occasion?
              </p>
              <p style={{ fontSize: 13, color: 'var(--muted-ink)' }}>We&apos;ll shortlist accordingly.</p>
            </div>
            {/* Scroll tiles */}
            <div className="flex gap-3 overflow-x-auto scrollbar-hide flex-1 min-w-0 py-0.5">
              {moods.map((m) => (
                <Link
                  key={m.id}
                  href={`/search?mood=${m.id}`}
                  className="flex items-center gap-3 flex-shrink-0 transition-all hover:-translate-y-px hover:border-[color:var(--hairline-2)]"
                  style={{
                    padding: '12px 16px 12px 12px',
                    background: 'var(--canvas)',
                    border: '1px solid var(--hairline)',
                    borderRadius: 'var(--radius)',
                    textDecoration: 'none',
                    scrollSnapAlign: 'start',
                  }}
                >
                  <span
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 40, height: 40,
                      borderRadius: 10,
                      background: 'var(--canvas-2)',
                      color: 'var(--brand)',
                    }}
                  >
                    <Icon name={m.icon} size={20} />
                  </span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 400, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{m.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted-ink)', whiteSpace: 'nowrap' }}>{m.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════ COLLECTION: dining tonight ════════ */}
      <Collection
        title="Dining tonight in Hamburg"
        sub={`${openNow.length} tables still open for 8pm`}
        items={openNow.slice(0, 4)}
        favs={favs}
        onFav={toggleFav}
      />

      {/* ════════ EDITORIAL FEATURE ════════ */}
      <section
        className="py-20"
        style={{ background: 'var(--ink)', color: 'var(--canvas)' }}
      >
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-[72px] items-center">
            {/* Image left */}
            <div
              className="relative hidden md:block"
              style={{ aspectRatio: '4/5', borderRadius: 'var(--radius)', overflow: 'hidden' }}
            >
              <Image
                src={featured.image}
                alt={featured.name}
                fill
                className="object-cover"
              />
            </div>
            {/* Text right */}
            <div>
              <p
                className="uppercase mb-5"
                style={{ fontSize: 10, letterSpacing: '0.14em', fontWeight: 500, color: 'var(--muted-2)' }}
              >
                Editor&apos;s essay · No. 17
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(28px, 3.5vw, 54px)',
                  fontWeight: 400,
                  lineHeight: 1.05,
                  color: 'var(--canvas)',
                  margin: 0,
                }}
              >
                Why the best meal in Hamburg<br />
                is also the{' '}
                <em style={{ fontStyle: 'italic', color: 'var(--brand)' }}>shortest menu</em>.
              </h2>
              <p
                style={{
                  marginTop: 26,
                  fontSize: 17,
                  lineHeight: 1.7,
                  color: 'var(--canvas-2)',
                  maxWidth: 520,
                }}
              >
                There is no list. There are no choices beyond still or sparkling.
                Ten plates arrive in the order the kitchen decides, sourced entirely from within
                fifty kilometres of the counter you're sitting at — and most of them from within ten.
              </p>
              <div className="flex flex-wrap gap-3.5 mt-8">
                <Link
                  href={`/r/${featured.id}`}
                  className="flex items-center gap-2 transition-opacity hover:opacity-85"
                  style={{
                    height: 52, padding: '0 24px',
                    background: 'var(--brand)',
                    color: '#fff',
                    borderRadius: 999,
                    fontSize: 15, fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  Read the full essay
                </Link>
                <Link
                  href={`/r/${featured.id}/reserve`}
                  className="flex items-center gap-2 transition-all hover:bg-[color:var(--ink)] hover:text-[color:var(--canvas)]"
                  style={{
                    height: 52, padding: '0 24px',
                    background: 'transparent',
                    color: 'var(--canvas)',
                    border: '1px solid var(--canvas-2)',
                    borderRadius: 999,
                    fontSize: 15, fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  Check availability
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ COLLECTION: best rated ════════ */}
      <Collection
        title="Best rated"
        sub="Hamburg's highest-reviewed tables"
        items={topRated}
        favs={favs}
        onFav={toggleFav}
      />

      {/* ════════ COLLECTION: walk-in worthy ════════ */}
      <Collection
        title="Walk-in worthy"
        sub="Rarely a wait, always worth it"
        items={walkIn.slice(0, 3)}
        favs={favs}
        onFav={toggleFav}
      />

      {/* ════════ CITY DIAL ════════ */}
      <section className="py-14" style={{ borderTop: '1px solid var(--hairline)' }}>
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="flex items-baseline justify-between gap-4 mb-7">
            <div>
              <p
                className="uppercase mb-2.5"
                style={{ fontSize: 10, letterSpacing: '0.14em', fontWeight: 500, color: 'var(--muted-2)' }}
              >
                Travelling?
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 28,
                  fontWeight: 400,
                  color: 'var(--ink)',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Other cities we&apos;ve been through lately.
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cities.map((c) => (
              <Link
                key={c.name}
                href="/search"
                className="group relative block overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
                style={{ borderRadius: 'var(--radius)', textDecoration: 'none' }}
              >
                <div style={{ aspectRatio: '3/4' }}>
                  <Image
                    src={c.img}
                    alt={c.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div
                  className="absolute inset-0 flex flex-col justify-end"
                  style={{
                    background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)',
                    padding: 18,
                  }}
                >
                  <div
                    style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: '#fff' }}
                  >
                    {c.name}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.85, color: '#fff' }}>{c.count} places</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <MobileNav />
    </div>
  )
}
