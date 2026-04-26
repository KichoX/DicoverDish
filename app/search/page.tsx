'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AppShell } from '@/components/app-shell'
import { restaurants } from '@/lib/data'

/* ── Inline icon (stroke-based, matches design system) ── */
function Icon({ name, size = 16 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    search:    <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    grid:      <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
    list:      <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></>,
    map:       <><path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7" /><path d="M9 4v13M15 7v13" /></>,
    heart:     <path d="M12 20s-7-4.5-7-10a4.5 4.5 0 0 1 7-3.7A4.5 4.5 0 0 1 19 10c0 5.5-7 10-7 10Z" />,
    star:      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
    calendar:  <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
    delivery:  <><rect x="2" y="7" width="11" height="10" rx="1" /><path d="M13 10h4l3 4v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
    pickup:    <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    x:         <><path d="M18 6 6 18M6 6l12 12" /></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {paths[name] ?? null}
    </svg>
  )
}

/* ── Editorial search card (vertical, 5:4 image) ── */
function SearchCard({ restaurant }: { restaurant: typeof restaurants[0] }) {
  const [isFav, setIsFav] = useState(false)
  const cuisine = restaurant.cuisines?.[0] ?? ''
  const hasDelivery = restaurant.tags?.includes('Delivery')

  return (
    <Link href={`/r/${restaurant.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <article
        className="group"
        style={{
          background: 'var(--paper)',
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid var(--hairline)',
          transition: 'box-shadow 0.2s',
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '5/4', overflow: 'hidden', background: 'var(--canvas-2)' }}>
          <Image
            src={restaurant.image}
            alt={restaurant.name}
            fill
            style={{ objectFit: 'cover', transition: 'transform 0.4s' }}
            className="group-hover:scale-105"
          />
          {/* Heart */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavourite(restaurant.id) }}
            aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
            style={{
              position: 'absolute', top: 10, right: 10,
              width: 32, height: 32,
              background: 'rgba(251,247,240,0.92)',
              backdropFilter: 'blur(8px)',
              borderRadius: '50%',
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: isFav ? 'var(--brand)' : 'var(--muted-ink)',
            }}
          >
            <Icon name="heart" size={14} />
          </button>
          {/* Delivery badge */}
          {hasDelivery && (
            <span style={{
              position: 'absolute', bottom: 10, left: 10,
              background: 'var(--ink)',
              color: 'var(--canvas)',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.06em',
              padding: '3px 8px',
              borderRadius: 4,
            }}>
              DELIVERY
            </span>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '14px 16px 16px' }}>
          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 11, color: 'var(--muted-ink)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <span>{cuisine}</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--muted-2)', display: 'inline-block' }} />
            <span>Hamburg</span>
          </div>
          {/* Name */}
          <h3 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 18,
            fontWeight: 400,
            lineHeight: 1.2,
            color: 'var(--ink)',
            margin: '0 0 10px',
          }}>
            {restaurant.name}
          </h3>
          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--muted-ink)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="star" size={11} />
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{restaurant.rating.toFixed(1)}</span>
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 500,
              background: restaurant.isOpen ? 'var(--forest-soft)' : 'var(--canvas-2)',
              color: restaurant.isOpen ? 'var(--forest)' : 'var(--muted-ink)',
            }}>
              {restaurant.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

/* ── Chip button ── */
function Chip({
  children, active, onClick,
}: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '5px 12px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        border: '1px solid',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s',
        background: active ? 'var(--ink)' : 'transparent',
        borderColor: active ? 'var(--ink)' : 'var(--hairline)',
        color: active ? 'var(--canvas)' : 'var(--muted-ink)',
      }}
    >
      {children}
    </button>
  )
}

type ViewMode = 'grid' | 'list' | 'map'

export default function SearchPage() {
  const [q, setQ] = useState('')
  const [cuisine, setCuisine] = useState('all')
  const [sort, setSort] = useState('editor')
  const [view, setView] = useState<ViewMode>('grid')

  const allCuisines = useMemo(() => {
    const set = new Set<string>()
    restaurants.forEach(r => r.cuisines?.forEach(c => set.add(c)))
    return Array.from(set)
  }, [])

  const results = useMemo(() => {
    let list = [...restaurants]
    if (q.trim()) {
      const lq = q.toLowerCase()
      list = list.filter(r =>
        r.name.toLowerCase().includes(lq) ||
        r.cuisines?.join(' ').toLowerCase().includes(lq) ||
        r.tags?.join(' ').toLowerCase().includes(lq)
      )
    }
    if (cuisine !== 'all') list = list.filter(r => r.cuisines?.includes(cuisine))
    if (sort === 'rating') list = list.sort((a, b) => b.rating - a.rating)
    if (sort === 'price') list = list.sort((a, b) => (a.rating - b.rating))
    return list
  }, [q, cuisine, sort])

  return (
    <AppShell>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: 'calc(100vh - 68px)' }}>

        {/* ── Left sidebar ── */}
        <aside style={{
          borderRight: '1px solid var(--hairline)',
          background: 'var(--paper)',
          position: 'sticky',
          top: 68,
          height: 'calc(100vh - 68px)',
          overflowY: 'auto',
        }}>
          {/* Header */}
          <div style={{ padding: '28px 24px', borderBottom: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-ink)', marginBottom: 10 }}>
              In Hamburg
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 400, margin: 0, color: 'var(--ink)', lineHeight: 1.1 }}>
              {results.length} places
            </h2>
            <div style={{ fontSize: 13, color: 'var(--muted-ink)', marginTop: 6 }}>
              {q ? `matching "${q}"` : 'ordered by the editors'}
            </div>
          </div>

          {/* Search */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-ink)', marginBottom: 10 }}>
              Search
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-ink)' }}>
                <Icon name="search" size={14} />
              </span>
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="dish, cuisine, vibe"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 34px',
                  fontSize: 14,
                  background: 'var(--canvas)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 6,
                  color: 'var(--ink)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Cuisine */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-ink)', marginBottom: 10 }}>
              Cuisine
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <Chip active={cuisine === 'all'} onClick={() => setCuisine('all')}>All</Chip>
              {allCuisines.map(c => (
                <Chip key={c} active={cuisine === c} onClick={() => setCuisine(c)}>{c}</Chip>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-ink)', marginBottom: 10 }}>
              Sort
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {([['editor', "Editor's pick"], ['rating', 'Highest rated'], ['price', 'Price low–high']] as const).map(([k, l]) => (
                <Chip key={k} active={sort === k} onClick={() => setSort(k)}>{l}</Chip>
              ))}
            </div>
          </div>

          {/* Services */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-ink)', marginBottom: 10 }}>
              Services
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <Chip><span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="calendar" size={11} /> Reserve</span></Chip>
              <Chip><span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="delivery" size={11} /> Delivery</span></Chip>
              <Chip><span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="pickup" size={11} /> Pickup</span></Chip>
            </div>
          </div>

          {/* Price */}
          <div style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-ink)', marginBottom: 10 }}>
              Price
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['€', '€€', '€€€', '€€€€'].map(p => (
                <Chip key={p}>{p}</Chip>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{ padding: '28px 32px 60px' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Chip>Open now</Chip>
              <Chip>Within 5 km</Chip>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['grid', 'list', 'map'] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-label={v}
                  style={{
                    width: 36, height: 36,
                    borderRadius: 6,
                    border: '1px solid',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: view === v ? 'var(--ink)' : 'var(--paper)',
                    borderColor: view === v ? 'var(--ink)' : 'var(--hairline)',
                    color: view === v ? 'var(--canvas)' : 'var(--muted-ink)',
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon name={v} size={15} />
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted-ink)' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginBottom: 8, color: 'var(--ink)' }}>
                No places found
              </div>
              <div style={{ fontSize: 14 }}>Try a different search or cuisine</div>
            </div>
          ) : view === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
              {results.map(r => <SearchCard key={r.id} restaurant={r} />)}
            </div>
          ) : view === 'list' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {results.map(r => (
                <Link key={r.id} href={`/r/${r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{
                    display: 'flex', gap: 16, padding: 16,
                    background: 'var(--paper)',
                    border: '1px solid var(--hairline)',
                    borderRadius: 12,
                  }}>
                    <div style={{ position: 'relative', width: 120, height: 90, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                      <Image src={r.image} alt={r.name} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)', marginBottom: 4 }}>
                        {r.cuisines?.[0]} · Hamburg
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 400, margin: '0 0 8px', color: 'var(--ink)' }}>
                        {r.name}
                      </h3>
                      <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--muted-ink)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Icon name="star" size={11} />
                          <strong style={{ color: 'var(--ink)' }}>{r.rating.toFixed(1)}</strong>
                        </span>
                        <span style={{
                          padding: '1px 8px', borderRadius: 999, fontSize: 11,
                          background: r.isOpen ? 'var(--forest-soft)' : 'var(--canvas-2)',
                          color: r.isOpen ? 'var(--forest)' : 'var(--muted-ink)',
                        }}>
                          {r.isOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Map view stub */
            <div style={{
              borderRadius: 12, overflow: 'hidden',
              border: '1px solid var(--hairline)',
              minHeight: 520,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 12,
              color: 'var(--muted-ink)',
            }}
              className="map-stub"
            >
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)' }}>Map view</div>
              <div style={{ fontSize: 13 }}>Coming soon · {results.length} places</div>
            </div>
          )}
        </main>
      </div>
    </AppShell>
  )
}
