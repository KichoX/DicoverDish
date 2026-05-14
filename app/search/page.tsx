'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AppShell } from '@/components/app-shell'
import { restaurants as staticRestaurants } from '@/lib/data'
import { api } from '@/lib/api'
import { useAppStore } from '@/lib/store'

/* ── Inline icon ── */
function Icon({ name, size = 16, className }: { name: string; size?: number; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    search:   <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    grid:     <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
    list:     <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></>,
    map:      <><path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7" /><path d="M9 4v13M15 7v13" /></>,
    heart:    <path d="M12 20s-7-4.5-7-10a4.5 4.5 0 0 1 7-3.7A4.5 4.5 0 0 1 19 10c0 5.5-7 10-7 10Z" />,
    heartFill:<path d="M12 20s-7-4.5-7-10a4.5 4.5 0 0 1 7-3.7A4.5 4.5 0 0 1 19 10c0 5.5-7 10-7 10Z" fill="currentColor" />,
    star:     <path d="M12 3.5 14.6 9l6 .9-4.3 4.2 1 6-5.3-2.8L6.6 20l1-6L3.4 9.9l6-.9Z" fill="currentColor" stroke="none" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
    delivery: <><rect x="2" y="7" width="11" height="10" rx="1" /><path d="M13 10h4l3 4v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
    pickup:   <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    pin:      <><path d="M20 10c0 6-8 13-8 13S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
      className={className}
    >
      {paths[name] ?? null}
    </svg>
  )
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

/* ── Mock data ── */
const neighborhoods = ['Steglitz', 'Mitte', 'Kreuzberg', 'Prenzlauer Berg', 'Schöneberg', 'Charlottenburg', 'Neukölln', 'Friedrichshain', 'Tiergarten']
const getNeighborhood = (id: string) => neighborhoods[parseInt(id) % neighborhoods.length]
const getDistance = (id: string) => ((parseInt(id) * 0.7 + 0.9) % 7 + 0.5).toFixed(1)
const getEta = (id: string) => 15 + (parseInt(id) * 7) % 20
const priceLevel = (rating: number) => {
  const lvl = rating >= 4.7 ? 4 : rating >= 4.4 ? 3 : rating >= 4.0 ? 2 : 1
  return '€'.repeat(lvl)
}

/* ── Editorial restaurant card (no card bg — matches screenshot) ── */
function SearchCard({
  restaurant, isFav, onFav, imageOverride,
}: {
  restaurant: typeof staticRestaurants[0]
  isFav: boolean
  onFav: (id: string) => void
  imageOverride?: { src: string; scale: number; x: number; y: number; rotation: number; flipH: boolean; flipV: boolean } | null
}) {
  const cuisine = restaurant.cuisines?.[0] ?? ''
  const neighborhood = getNeighborhood(restaurant.id)
  const distance = getDistance(restaurant.id)
  const hasDelivery = restaurant.tags?.some(t => t.toLowerCase() === 'delivery')
  const eta = getEta(restaurant.id)

  return (
    <Link href={`/r/${generateSlug(restaurant.name)}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <article className="group" style={{ cursor: 'pointer' }}>
        {/* Image — full bleed, rounded */}
        <div style={{ position: 'relative', aspectRatio: '5/4', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
          {imageOverride ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageOverride.src}
              alt={restaurant.name}
              className="w-full h-full group-hover:scale-[1.04]"
              style={{ objectFit: 'cover', transform: `translate(${imageOverride.x}%, ${imageOverride.y}%) scale(${imageOverride.scale}) rotate(${imageOverride.rotation}deg)${imageOverride.flipH ? ' scaleX(-1)' : ''}${imageOverride.flipV ? ' scaleY(-1)' : ''}`, transformOrigin: 'center', display: 'block', transition: 'transform 0.5s' }}
            />
          ) : (
            <Image
              src={restaurant.image}
              alt={restaurant.name}
              fill
              style={{ objectFit: 'cover', transition: 'transform 0.5s' }}
              className="group-hover:scale-[1.04]"
            />
          )}
          {/* Heart */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFav(restaurant.id) }}
            aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 36, height: 36,
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(6px)',
              borderRadius: '50%',
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: isFav ? '#c1392b' : 'var(--ink)',
              transition: 'color 0.15s, transform 0.15s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
            }}
          >
            <Icon name={isFav ? 'heartFill' : 'heart'} size={15} />
          </button>
          {/* Delivery badge */}
          {hasDelivery && (
            <span style={{
              position: 'absolute', bottom: 12, left: 12,
              background: 'var(--ink)',
              color: 'var(--canvas)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.07em',
              padding: '4px 9px',
              borderRadius: 4,
              textTransform: 'uppercase',
            }}>
              {eta} min · Delivery
            </span>
          )}
        </div>

<<<<<<< Updated upstream
        {/* Content */}
        <div style={{ padding: '14px 16px 16px' }}>
          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 11, color: 'var(--muted-ink)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <span>{cuisine}</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--muted-2)', display: 'inline-block' }} />
            <span>Berlin</span>
=======
        {/* Info below image */}
        <div>
          <div style={{
            fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--muted-2)', fontWeight: 500, marginBottom: 5,
          }}>
            {cuisine} · {neighborhood}
>>>>>>> Stashed changes
          </div>
          <h3 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 22, fontWeight: 400,
            lineHeight: 1.15,
            color: 'var(--ink)',
            margin: '0 0 8px',
            transition: 'text-decoration 0.15s',
          }}
            className="group-hover:underline decoration-[color:var(--brand)] underline-offset-4"
          >
            {restaurant.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted-ink)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--ink)', fontWeight: 600 }}>
              <Icon name="star" size={12} className="text-amber-400" />
              {restaurant.rating.toFixed(1)}
            </span>
            <span style={{ color: 'var(--hairline-2)' }}>·</span>
            <span style={{ letterSpacing: '0.04em' }}>{priceLevel(restaurant.rating)}</span>
            <span style={{ color: 'var(--hairline-2)' }}>·</span>
            <span>{distance} km</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

/* ── Map placeholder card ── */
function MapCard({ onActivate }: { onActivate: () => void }) {
  return (
    <article
      onClick={onActivate}
      className="group"
      style={{ cursor: 'pointer' }}
    >
      <div
        style={{
          aspectRatio: '5/4',
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 14,
          background: 'linear-gradient(135deg, #e8e4dd 0%, #d4cec5 40%, #c8c2b8 100%)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          transition: 'opacity 0.2s',
          border: '1.5px dashed var(--hairline-2)',
        }}
      >
        {/* Grid lines imitating a map */}
        <svg
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }}
          viewBox="0 0 300 240"
          preserveAspectRatio="xMidYMid slice"
        >
          {[30, 70, 110, 150, 190, 230, 270].map(x => (
            <line key={`v${x}`} x1={x} y1={0} x2={x} y2={240} stroke="#5a5040" strokeWidth={0.8} />
          ))}
          {[30, 60, 90, 120, 150, 180, 210].map(y => (
            <line key={`h${y}`} x1={0} y1={y} x2={300} y2={y} stroke="#5a5040" strokeWidth={0.8} />
          ))}
          <rect x="60" y="50" width="80" height="30" rx="4" fill="#5a5040" opacity={0.35} />
          <rect x="160" y="80" width="60" height="50" rx="4" fill="#5a5040" opacity={0.25} />
          <rect x="80" y="130" width="100" height="40" rx="4" fill="#5a5040" opacity={0.3} />
          <circle cx="150" cy="115" r="8" fill="#c1392b" opacity={0.7} />
          <circle cx="150" cy="115" r="3" fill="#fff" opacity={0.9} />
        </svg>

        {/* Map icon + label */}
        <div style={{
          width: 52, height: 52,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          zIndex: 1,
          transition: 'transform 0.2s',
        }}
          className="group-hover:scale-110"
        >
          <Icon name="map" size={24} className="text-[color:var(--ink)]" />
        </div>
        <div style={{ zIndex: 1, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--ink)', fontWeight: 400, margin: 0 }}>
            Map view
          </p>
          <p style={{ fontSize: 11, color: 'var(--muted-ink)', marginTop: 3, letterSpacing: '0.05em' }}>
            Coming soon — tap to explore
          </p>
        </div>
      </div>

      {/* Info row below to match card height */}
      <div>
        <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-2)', fontWeight: 500, marginBottom: 5 }}>
          Interactive · Berlin
        </div>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, color: 'var(--ink)', margin: '0 0 8px' }}>
          Explore on map
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted-ink)' }}>
          <Icon name="pin" size={13} />
          <span>See all places near you</span>
        </div>
      </div>
    </article>
  )
}

/* ── Chip button ── */
function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 500,
        border: '1px solid',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s',
        background: active ? 'var(--ink)' : 'transparent',
        borderColor: active ? 'var(--ink)' : 'var(--hairline-2)',
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
  const [favs, setFavs] = useState<Set<string>>(new Set())
  const [openNow, setOpenNow] = useState(false)
  const [nearby, setNearby] = useState(false)
  const [restaurants, setRestaurants] = useState(staticRestaurants)
  const { restaurantProfile } = useAppStore()

  useEffect(() => {
    api.getRestaurants().then(setRestaurants).catch(() => {})
  }, [])

  const toggleFav = (id: string) => setFavs(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const allCuisines = useMemo(() => {
    const set = new Set<string>()
    restaurants.forEach(r => r.cuisines?.forEach(c => set.add(c)))
    return Array.from(set)
  }, [restaurants])

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
    if (openNow) list = list.filter(r => r.isOpen)
    if (cuisine !== 'all') list = list.filter(r => r.cuisines?.includes(cuisine))
    if (sort === 'rating') list = list.sort((a, b) => b.rating - a.rating)
    if (sort === 'price') list = list.sort((a, b) => a.rating - b.rating)
    return list
  }, [q, cuisine, sort, openNow, restaurants])

  /* Insert map card at index 2 (3rd position = right slot of first row) */
  const gridItems = useMemo(() => {
    if (view !== 'grid') return results
    const arr: (typeof restaurants[0] | 'MAP_CARD')[] = [...results]
    arr.splice(2, 0, 'MAP_CARD')
    return arr
  }, [results, view])

  return (
    <AppShell>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 'calc(100vh - 68px)' }}>

        {/* ── Left sidebar ── */}
        <aside style={{
          borderRight: '1px solid var(--hairline)',
          background: 'var(--paper)',
          position: 'sticky',
          top: 68,
          height: 'calc(100vh - 68px)',
          overflowY: 'auto',
        }}>
          <div style={{ padding: '28px 24px', borderBottom: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-ink)', marginBottom: 10 }}>
              In Berlin
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 400, margin: 0, color: 'var(--ink)', lineHeight: 1.1 }}>
              {results.length} places
            </h2>
            <div style={{ fontSize: 13, color: 'var(--muted-ink)', marginTop: 6 }}>
              {q ? `matching "${q}"` : 'ordered by the editors'}
            </div>
          </div>

          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-ink)', marginBottom: 10 }}>Search</div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-ink)' }}>
                <Icon name="search" size={14} />
              </span>
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="dish, cuisine, vibe"
                style={{
                  width: '100%', padding: '10px 12px 10px 34px',
                  fontSize: 14, background: 'var(--canvas)',
                  border: '1px solid var(--hairline)', borderRadius: 6,
                  color: 'var(--ink)', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-ink)', marginBottom: 10 }}>Cuisine</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <Chip active={cuisine === 'all'} onClick={() => setCuisine('all')}>All</Chip>
              {allCuisines.map(c => (
                <Chip key={c} active={cuisine === c} onClick={() => setCuisine(c)}>{c}</Chip>
              ))}
            </div>
          </div>

          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-ink)', marginBottom: 10 }}>Sort</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {([['editor', "Editor's pick"], ['rating', 'Highest rated'], ['price', 'Price low–high']] as const).map(([k, l]) => (
                <Chip key={k} active={sort === k} onClick={() => setSort(k)}>{l}</Chip>
              ))}
            </div>
          </div>

          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-ink)', marginBottom: 10 }}>Services</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <Chip><span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="calendar" size={11} /> Reserve</span></Chip>
              <Chip><span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="delivery" size={11} /> Delivery</span></Chip>
              <Chip><span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="pickup" size={11} /> Pickup</span></Chip>
            </div>
          </div>

          <div style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-ink)', marginBottom: 10 }}>Price</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['€', '€€', '€€€', '€€€€'].map(p => <Chip key={p}>{p}</Chip>)}
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{ padding: '28px 32px 60px' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Chip active={openNow} onClick={() => setOpenNow(v => !v)}>Open now</Chip>
              <Chip active={nearby} onClick={() => setNearby(v => !v)}>Within 5 km</Chip>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['grid', 'list', 'map'] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-label={v}
                  style={{
                    width: 38, height: 38, borderRadius: 8,
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

          {/* Empty state */}
          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted-ink)' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginBottom: 8, color: 'var(--ink)' }}>No places found</div>
              <div style={{ fontSize: 14 }}>Try a different search or cuisine</div>
            </div>

          /* Grid view — editorial cards, no card bg */
          ) : view === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
              {gridItems.map((item) =>
                item === 'MAP_CARD' ? (
                  <MapCard key="map-card" onActivate={() => setView('map')} />
                ) : (
                  <SearchCard
                    key={item.id}
                    restaurant={item}
                    isFav={favs.has(item.id)}
                    onFav={toggleFav}
                    imageOverride={restaurantProfile.profileImage && item.name === 'Ristorante Matera' ? restaurantProfile.profileImage : null}
                  />
                )
              )}
            </div>

          /* List view */
          ) : view === 'list' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {results.map(r => (
                <Link key={r.id} href={`/r/${generateSlug(r.name)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div
                    className="group"
                    style={{
                      display: 'flex', gap: 18, padding: '14px 16px',
                      borderRadius: 10,
                      border: '1px solid var(--hairline)',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <div style={{ position: 'relative', width: 110, height: 82, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                      <Image src={r.image} alt={r.name} fill style={{ objectFit: 'cover' }} />
                    </div>
<<<<<<< Updated upstream
                    <div>
                      <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)', marginBottom: 4 }}>
                        {r.cuisines?.[0]} · Berlin
=======
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-2)', fontWeight: 500, marginBottom: 4 }}>
                        {r.cuisines?.[0]} · {getNeighborhood(r.id)}
>>>>>>> Stashed changes
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 400, margin: '0 0 8px', color: 'var(--ink)' }}>
                        {r.name}
                      </h3>
                      <div style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--muted-ink)', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600, color: 'var(--ink)' }}>
                          <Icon name="star" size={12} className="text-amber-400" />
                          {r.rating.toFixed(1)}
                        </span>
                        <span style={{ color: 'var(--hairline-2)' }}>·</span>
                        <span>{priceLevel(r.rating)}</span>
                        <span style={{ color: 'var(--hairline-2)' }}>·</span>
                        <span>{getDistance(r.id)} km</span>
                        <span style={{
                          marginLeft: 4, padding: '1px 8px', borderRadius: 999, fontSize: 11,
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

          /* Map view stub */
          ) : (
            <div style={{
              borderRadius: 16, overflow: 'hidden',
              border: '1px solid var(--hairline)',
              minHeight: 540,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 14,
              background: 'linear-gradient(135deg, #e8e4dd 0%, #d4cec5 40%, #c8c2b8 100%)',
              position: 'relative',
            }}>
              <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }} viewBox="0 0 800 540" preserveAspectRatio="xMidYMid slice">
                {[80,160,240,320,400,480,560,640,720].map(x => <line key={`v${x}`} x1={x} y1={0} x2={x} y2={540} stroke="#5a5040" strokeWidth={1} />)}
                {[60,120,180,240,300,360,420,480].map(y => <line key={`h${y}`} x1={0} y1={y} x2={800} y2={y} stroke="#5a5040" strokeWidth={1} />)}
              </svg>
              <div style={{ zIndex: 1, textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 2px 16px rgba(0,0,0,0.12)' }}>
                  <Icon name="map" size={28} />
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--ink)', marginBottom: 8 }}>Map view</div>
                <div style={{ fontSize: 14, color: 'var(--muted-ink)' }}>Coming soon · {results.length} places to explore</div>
              </div>
            </div>
          )}
        </main>
      </div>
    </AppShell>
  )
}
