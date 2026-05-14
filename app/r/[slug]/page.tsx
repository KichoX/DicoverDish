'use client'

import { use, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Share2, Heart, Calendar, ShoppingBag, MapPin, Clock, Phone, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { Footer } from '@/components/footer'
import { restaurants as staticRestaurants } from '@/lib/data'
import { api } from '@/lib/api'

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

const mockReviews = [
  { initial: 'E', name: 'Emma L.',   rating: 5.0, text: 'The tagliatelle al tartufo is what dreams are made of. Service warm, wine list honest.',  ago: '2 weeks ago' },
  { initial: 'J', name: 'Jonas P.',  rating: 5.0, text: 'Been coming for years. The pizza never misses. Ask for the table by the window.',          ago: 'a month ago' },
  { initial: 'S', name: 'Sophie M.', rating: 4.5, text: 'Incredible atmosphere and genuinely the best handmade pasta in the city. Will be back.',   ago: '2 months ago' },
]

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/* ── Generate next 14 days as selectable date pills ── */
function getDateOptions() {
  const dates: { label: string; short: string; iso: string }[] = []
  const now = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    dates.push({
      label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      short: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      iso: d.toISOString().split('T')[0],
    })
  }
  return dates
}

/* ── Time slots ── */
function getTimeSlots() {
  const slots: string[] = []
  for (let h = 12; h <= 22; h++) {
    slots.push(`${h}:00`)
    if (h < 22) slots.push(`${h}:30`)
  }
  return slots
}

/* ── Inline reservation widget (shown on Reserve tab of restaurant profile) ── */
function ReserveWidget({ slug, restaurantName }: { slug: string; restaurantName: string }) {
  const router = useRouter()
  const dateOptions = getDateOptions()
  const timeSlots = getTimeSlots()

  const [guests, setGuests] = useState(2)
  const [selectedDateIdx, setSelectedDateIdx] = useState(0)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [dateOffset, setDateOffset] = useState(0)
  const visibleDates = dateOptions.slice(dateOffset, dateOffset + 5)

  const canSecure = selectedTime !== null

  const handleSecure = () => {
    const params = new URLSearchParams({
      guests: String(guests),
      date: dateOptions[selectedDateIdx].iso,
      time: selectedTime!,
    })
    router.push(`/r/${slug}/reserve?${params.toString()}`)
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Guests */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: 14 }}>
          How many guests?
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              onClick={() => setGuests(n)}
              style={{
                width: 52, height: 52, borderRadius: 12,
                border: '1px solid',
                borderColor: guests === n ? 'var(--brand)' : 'var(--hairline)',
                background: guests === n ? 'color-mix(in srgb, var(--brand) 8%, transparent)' : 'var(--paper)',
                color: guests === n ? 'var(--brand)' : 'var(--ink)',
                fontSize: 16, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {n === 6 ? '6+' : n}
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: 14 }}>
          When?
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setDateOffset(Math.max(0, dateOffset - 1))}
            disabled={dateOffset === 0}
            style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--hairline)', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: dateOffset === 0 ? 'not-allowed' : 'pointer', opacity: dateOffset === 0 ? 0.35 : 1, flexShrink: 0 }}
          >
            <ChevronLeft size={16} />
          </button>
          <div style={{ display: 'flex', gap: 8, flex: 1, overflow: 'hidden' }}>
            {visibleDates.map((d, i) => {
              const globalIdx = dateOffset + i
              const isSelected = selectedDateIdx === globalIdx
              return (
                <button
                  key={d.iso}
                  onClick={() => setSelectedDateIdx(globalIdx)}
                  style={{
                    flex: 1, padding: '10px 6px', borderRadius: 10,
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--brand)' : 'var(--hairline)',
                    background: isSelected ? 'color-mix(in srgb, var(--brand) 8%, transparent)' : 'var(--paper)',
                    color: isSelected ? 'var(--brand)' : 'var(--ink)',
                    fontSize: 13, fontWeight: isSelected ? 600 : 400,
                    cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {d.short}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setDateOffset(Math.min(dateOptions.length - 5, dateOffset + 1))}
            disabled={dateOffset >= dateOptions.length - 5}
            style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--hairline)', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: dateOffset >= dateOptions.length - 5 ? 'not-allowed' : 'pointer', opacity: dateOffset >= dateOptions.length - 5 ? 0.35 : 1, flexShrink: 0 }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Time slots */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: 14 }}>
          What time?
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {timeSlots.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTime(t)}
              style={{
                padding: '10px 6px', borderRadius: 10,
                border: '1px solid',
                borderColor: selectedTime === t ? 'var(--brand)' : 'var(--hairline)',
                background: selectedTime === t ? 'color-mix(in srgb, var(--brand) 8%, transparent)' : 'var(--paper)',
                color: selectedTime === t ? 'var(--brand)' : 'var(--ink)',
                fontSize: 13, fontWeight: selectedTime === t ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleSecure}
        disabled={!canSecure}
        style={{
          width: '100%', padding: '16px', borderRadius: 999,
          background: canSecure ? 'var(--brand)' : 'var(--hairline)',
          color: canSecure ? '#fff' : 'var(--muted-ink)',
          fontSize: 16, fontWeight: 600,
          border: 'none', cursor: canSecure ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
        }}
      >
        {canSecure ? `Secure date · ${selectedTime} · ${guests} guest${guests > 1 ? 's' : ''}` : 'Select a time to continue'}
      </button>
    </div>
  )
}

export default function RestaurantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'about' | 'reserve'>('about')
  const [restaurants, setRestaurants] = useState(staticRestaurants)
  const [bannerIdx, setBannerIdx] = useState(0)

  useEffect(() => {
    api.getRestaurantBySlug(slug).then(r => setRestaurants([r])).catch(() => {})
  }, [slug])

  const restaurant = restaurants.find((r) => generateSlug(r.name) === slug) ?? restaurants[0]

  const bannerSlides = [{ src: restaurant?.image ?? '', scale: 1, x: 0, y: 0, rotation: 0, flipH: false, flipV: false }]
  const totalSlides = bannerSlides.length

  // Auto-advance carousel
  useEffect(() => {
    if (totalSlides <= 1) return
    const id = setInterval(() => setBannerIdx(i => (i + 1) % totalSlides), 5000)
    return () => clearInterval(id)
  }, [totalSlides])

  if (!restaurant) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--canvas)' }}>
        <div style={{ textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, marginBottom: 12, color: 'var(--ink)' }}>Restaurant not found</h1>
          <p style={{ color: 'var(--muted-ink)', marginBottom: 24 }}>The restaurant you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/search" style={{ display: 'inline-block', padding: '10px 24px', background: 'var(--ink)', color: 'var(--canvas)', borderRadius: 999, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
            Browse Restaurants
          </Link>
        </div>
      </div>
    )
  }

  const etaMin = 15 + (parseInt(restaurant.id) * 7) % 20
  const reviewCount = 842

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: restaurant.name, url })
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  return (
    <div style={{ background: 'var(--canvas)', minHeight: '100vh' }}>
      <SiteHeader />

      {/* ── Hero / Banner Carousel ── */}
      <div style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
        {/* Slides */}
        {bannerSlides.map((slide, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', inset: 0,
              opacity: i === bannerIdx ? 1 : 0,
              transition: 'opacity 0.7s ease',
              background: '#111',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.src}
              alt={restaurant.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `translate(${slide.x}%, ${slide.y}%) scale(${slide.scale}) rotate(${slide.rotation}deg)${slide.flipH ? ' scaleX(-1)' : ''}${slide.flipV ? ' scaleY(-1)' : ''}`, transformOrigin: 'center', display: 'block' }}
            />
          </div>
        ))}

        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.52) 60%, rgba(0,0,0,0.78) 100%)', zIndex: 1 }} />

        {/* Back */}
        <div style={{ position: 'absolute', top: 28, left: 36, zIndex: 3 }}>
          <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 999, padding: '9px 18px', color: '#fff', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
            <ArrowLeft size={15} /> Back to Berlin
          </Link>
        </div>

        {/* Carousel controls — only when multiple banners */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={() => setBannerIdx(i => (i - 1 + totalSlides) % totalSlides)}
              style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 3, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setBannerIdx(i => (i + 1) % totalSlides)}
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 3, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ChevronRight size={18} />
            </button>
            {/* Dots */}
            <div style={{ position: 'absolute', bottom: 90, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 3 }}>
              {bannerSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setBannerIdx(i)}
                  style={{ width: i === bannerIdx ? 20 : 6, height: 6, borderRadius: 3, background: i === bannerIdx ? '#fff' : 'rgba(255,255,255,0.45)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }}
                />
              ))}
            </div>
          </>
        )}

        {/* Hero info */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 36px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              {restaurant.isOpen && (
                <span style={{ background: '#2e7d48', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', padding: '4px 10px', borderRadius: 5, textTransform: 'uppercase' }}>Open now</span>
              )}
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={14} fill="#f5c518" color="#f5c518" />
                <strong style={{ fontWeight: 600 }}>{restaurant.rating.toFixed(1)}</strong>
                <span style={{ opacity: 0.7 }}>({reviewCount})</span>
                <span style={{ opacity: 0.45 }}>·</span>
                <span>{restaurant.cuisines.join(', ')}</span>
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 4.5vw, 64px)', fontWeight: 400, color: '#fff', margin: '0 0 10px', lineHeight: 1.05 }}>
              {restaurant.name}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: 0 }}>
              Berlin, Germany · Chef Giulia Romano
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <button onClick={() => setSaved(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: saved ? 'var(--brand)' : 'rgba(255,255,255,0.14)', backdropFilter: 'blur(10px)', border: `1px solid ${saved ? 'transparent' : 'rgba(255,255,255,0.3)'}`, borderRadius: 999, padding: '10px 20px', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}>
              <Heart size={15} fill={saved ? '#fff' : 'none'} /> {saved ? 'Saved' : 'Save'}
            </button>
            <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 999, padding: '10px 20px', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              <Share2 size={15} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* ── Sticky tab bar ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--paper)', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 36px' }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {(['about', 'reserve'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 0', marginRight: 32,
                fontSize: 15, fontWeight: 500,
                color: activeTab === tab ? 'var(--ink)' : 'var(--muted-ink)',
                background: 'none', border: 'none',
                borderBottom: `2px solid ${activeTab === tab ? 'var(--brand)' : 'transparent'}`,
                cursor: 'pointer', textTransform: 'capitalize',
                transition: 'color 0.15s',
              }}
            >
              {tab === 'about' ? 'About' : 'Reserve'}
            </button>
          ))}
          <Link href={`/r/${slug}/menu`} style={{ display: 'block', padding: '16px 0', marginRight: 32, fontSize: 15, fontWeight: 500, color: 'var(--muted-ink)', textDecoration: 'none', borderBottom: '2px solid transparent' }}>
            Menu
          </Link>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href={`/r/${slug}/menu`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--ink)', color: 'var(--canvas)', borderRadius: 999, padding: '9px 20px', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
            <ShoppingBag size={15} /> Order · {etaMin} min
          </Link>
          <button
            onClick={() => setActiveTab('reserve')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: 'var(--ink)', border: '1px solid var(--hairline)', borderRadius: 999, padding: '9px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            <Calendar size={15} /> Reserve table
          </button>
        </div>
      </div>

      {/* ── ABOUT tab ── */}
      {activeTab === 'about' && (
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 36px 80px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 64 }}>
          {/* Left */}
          <div>
            <section style={{ marginBottom: 48, paddingBottom: 48, borderBottom: '1px solid var(--hairline)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: 18 }}>About</p>
              <p style={{ fontSize: 17, lineHeight: 1.75, color: 'var(--ink)', margin: '0 0 28px', maxWidth: 600 }}>{restaurant.description}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--muted-ink)' }}>
                  <MapPin size={16} style={{ flexShrink: 0, color: 'var(--muted-2)' }} /><span>{restaurant.address}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--muted-ink)' }}>
                  <Clock size={16} style={{ flexShrink: 0, color: 'var(--muted-2)' }} /><span>{restaurant.hours}</span>
                </div>
                {restaurant.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--muted-ink)' }}>
                    <Phone size={16} style={{ flexShrink: 0, color: 'var(--muted-2)' }} />
                    <a href={`tel:${restaurant.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{restaurant.phone}</a>
                  </div>
                )}
              </div>
            </section>

            <section style={{ marginBottom: 48, paddingBottom: 48, borderBottom: '1px solid var(--hairline)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: 18 }}>What to know</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {restaurant.tags.map((tag) => (
                  <span key={tag} style={{ padding: '8px 18px', borderRadius: 999, border: '1px solid var(--hairline)', fontSize: 14, color: 'var(--ink)', background: 'var(--paper)' }}>{tag}</span>
                ))}
              </div>
            </section>

            <section>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: 8 }}>Reviews ({reviewCount})</p>
              {mockReviews.map((review, idx) => (
                <div key={idx} style={{ padding: '24px 0', borderBottom: idx < mockReviews.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--canvas-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: 'var(--muted-ink)', flexShrink: 0 }}>{review.initial}</div>
                      <span style={{ fontWeight: 500, fontSize: 15, color: 'var(--ink)' }}>{review.name}</span>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                      <Star size={13} fill="#f5c518" color="#f5c518" /> {review.rating.toFixed(1)}
                    </span>
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink)', margin: '0 0 8px' }}>{review.text}</p>
                  <p style={{ fontSize: 13, color: 'var(--muted-ink)', margin: 0 }}>{review.ago}</p>
                </div>
              ))}
            </section>
          </div>

          {/* Sidebar */}
          <div>
            <div style={{ border: '1px solid var(--hairline)', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--hairline)' }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', margin: 0 }}>Location</p>
              </div>
              <div style={{ height: 200, position: 'relative', background: 'linear-gradient(135deg, #eae6df 0%, #d9d4ca 50%, #cdc8bd 100%)', overflow: 'hidden' }}>
                <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }} viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice">
                  {[36,72,108,144,180,216,252,288,324].map(x => <line key={`v${x}`} x1={x} y1={0} x2={x} y2={200} stroke="#4a3f2f" strokeWidth={0.8} />)}
                  {[28,56,84,112,140,168,196].map(y => <line key={`h${y}`} x1={0} y1={y} x2={360} y2={y} stroke="#4a3f2f" strokeWidth={0.8} />)}
                  <rect x="70" y="38" width="80" height="28" rx="3" fill="#4a3f2f" opacity={0.28} />
                  <rect x="170" y="68" width="55" height="42" rx="3" fill="#4a3f2f" opacity={0.22} />
                  <rect x="90" y="112" width="100" height="36" rx="3" fill="#4a3f2f" opacity={0.28} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(0,0,0,0.25)' }}>
                    <MapPin size={18} color="#fff" />
                  </div>
                </div>
              </div>
              <div style={{ padding: '16px 18px' }}>
                <p style={{ fontSize: 14, color: 'var(--ink)', margin: '0 0 14px', lineHeight: 1.5 }}>{restaurant.address}</p>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', padding: '11px', background: 'var(--canvas)', border: '1px solid var(--hairline)', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--ink)', textDecoration: 'none' }}>
                  Get directions
                </a>
              </div>
            </div>

            <div style={{ border: '1px solid var(--hairline)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--hairline)' }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', margin: 0 }}>Hours this week</p>
              </div>
              <div style={{ padding: '4px 18px 12px' }}>
                {weekDays.map((day, idx) => (
                  <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: idx < weekDays.length - 1 ? '1px solid var(--hairline)' : 'none', fontSize: 14 }}>
                    <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{day}</span>
                    <span style={{ color: 'var(--muted-ink)' }}>{restaurant.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESERVE tab ── */}
      {activeTab === 'reserve' && (
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '52px 36px 80px' }}>
          <div style={{ marginBottom: 36 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: 10 }}>
              Reserving at
            </p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 400, color: 'var(--ink)', margin: 0 }}>
              {restaurant.name}
            </h2>
          </div>
          <ReserveWidget slug={slug} restaurantName={restaurant.name} />
        </div>
      )}

      <Footer />
    </div>
  )
}
