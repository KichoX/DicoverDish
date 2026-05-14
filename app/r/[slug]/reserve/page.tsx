'use client'

import { use, useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { restaurants as staticRestaurants } from '@/lib/data'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api'

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

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

function getTimeSlots() {
  const slots: string[] = []
  for (let h = 12; h <= 22; h++) {
    slots.push(`${h}:00`)
    if (h < 22) slots.push(`${h}:30`)
  }
  return slots
}

const OCCASIONS = ['Date night', 'Birthday', 'Anniversary', 'Business', 'Just hungry']

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: 10, marginTop: 0 }}>
      {children}
    </p>
  )
}

function Field({ label, placeholder, value, onChange, type = 'text' }: {
  label: string; placeholder: string; value: string
  onChange: (v: string) => void; type?: string
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '14px 16px', borderRadius: 8,
          border: '1px solid var(--hairline)',
          background: 'var(--paper)',
          fontSize: 15, color: 'var(--ink)',
          outline: 'none',
          fontFamily: 'var(--font-sans)',
        }}
      />
    </div>
  )
}

/* ── Animated success checkmark ── */
function SuccessCheck() {
  return (
    <>
      <style>{`
        @keyframes circle-pop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.12); opacity: 1; }
          80%  { transform: scale(0.94); }
          100% { transform: scale(1); }
        }
        @keyframes check-draw {
          0%   { stroke-dashoffset: 60; opacity: 0; }
          30%  { opacity: 1; }
          100% { stroke-dashoffset: 0; }
        }
        .success-circle {
          animation: circle-pop 0.55s cubic-bezier(0.22,1,0.36,1) both;
        }
        .success-check {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: check-draw 0.45s 0.35s cubic-bezier(0.22,1,0.36,1) forwards;
        }
      `}</style>
      <div style={{ margin: '0 auto 28px', width: 80, height: 80 }}>
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 80, height: 80 }}>
          <circle className="success-circle" cx="40" cy="40" r="40" fill="#2e7d48" />
          <polyline
            className="success-check"
            points="22,41 35,54 58,28"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    </>
  )
}

function ReservePageInner({ slug }: { slug: string }) {
  const searchParams = useSearchParams()
  const { addReservation, user } = useAppStore()

  const dateOptions = getDateOptions()
  const timeSlots = getTimeSlots()

  const paramGuests = searchParams.get('guests')
  const paramDate   = searchParams.get('date')
  const paramTime   = searchParams.get('time')

  const initDateIdx = paramDate
    ? Math.max(0, dateOptions.findIndex(d => d.iso === paramDate))
    : 0

  const [step, setStep]         = useState<'select' | 'details' | 'success'>('select')
  const [guests, setGuests]     = useState(paramGuests ? parseInt(paramGuests) : 2)
  const [selectedDateIdx, setSelectedDateIdx] = useState(initDateIdx)
  const [selectedTime, setSelectedTime]       = useState<string | null>(paramTime ?? null)
  const [dateOffset, setDateOffset]           = useState(Math.floor(initDateIdx / 5) * 5)

  const [name,     setName]     = useState(user?.name  || '')
  const [phone,    setPhone]    = useState('')
  const [email,    setEmail]    = useState(user?.email || '')
  const [occasion, setOccasion] = useState<string | null>(null)
  const [requests, setRequests] = useState('')
  const [restaurants, setRestaurants] = useState(staticRestaurants)

  useEffect(() => {
    api.getRestaurantBySlug(slug).then(r => setRestaurants([r])).catch(() => {})
  }, [slug])

  const restaurant = restaurants.find(r => generateSlug(r.name) === slug) ?? restaurants[0]
  const canSecure  = selectedTime !== null

  if (!restaurant) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--canvas)' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--ink)' }}>Restaurant not found</h1>
          <Link href="/search" style={{ color: 'var(--brand)', fontSize: 14 }}>Browse restaurants</Link>
        </div>
      </div>
    )
  }

  const selectedDateLabel = dateOptions[selectedDateIdx]?.label ?? ''
  const visibleDates = dateOptions.slice(dateOffset, dateOffset + 5)

  const handleConfirm = async () => {
    if (!name || !phone) return
    const dateIso = dateOptions[selectedDateIdx].iso
    // Save to DB
    await api.createReservation({
      restaurantId: restaurant.id,
      guestName: name,
      guestPhone: phone,
      guestEmail: email || undefined,
      date: dateIso,
      time: selectedTime!,
      guests,
      occasion: occasion ?? undefined,
      specialRequests: requests || undefined,
    }).catch(() => {})
    // Mirror in local store for instant UI
    addReservation({
      id: `res-${Date.now()}`,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      date: new Date(dateIso),
      time: selectedTime!,
      guests,
      name,
      phone,
      status: 'confirmed' as const,
    })
    setStep('success')
  }

  const HR = () => <div style={{ height: 1, background: 'var(--hairline)', margin: '28px 0' }} />

  return (
    <div style={{ background: 'var(--canvas)', minHeight: '100vh' }}>

      {/* ── Minimal header — no full navbar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'var(--paper)',
        borderBottom: '1px solid var(--hairline)',
        padding: '0 24px',
        height: 56,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <Link
          href={`/r/${slug}`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 34, height: 34, borderRadius: '50%',
            border: '1px solid var(--hairline)',
            color: 'var(--ink)', textDecoration: 'none',
            background: 'var(--canvas)', flexShrink: 0,
          }}
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <p style={{ fontSize: 11, color: 'var(--muted-ink)', margin: 0, lineHeight: 1.2 }}>Reserving at</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: 0, lineHeight: 1.2 }}>{restaurant.name}</p>
        </div>
      </header>

      <main style={{ maxWidth: 740, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* ══ SUCCESS ══ */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', paddingTop: 48 }}>
            <SuccessCheck />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 38, fontWeight: 400, color: 'var(--ink)', margin: '0 0 12px' }}>
              Reservation confirmed!
            </h2>
            <p style={{ fontSize: 15, color: 'var(--muted-ink)', marginBottom: 36 }}>
              We&apos;ve noted your reservation and will send a confirmation shortly.
            </p>

            {/* Summary table */}
            <div style={{ border: '1px solid var(--hairline)', borderRadius: 14, overflow: 'hidden', marginBottom: 40, textAlign: 'left', background: 'var(--paper)' }}>
              {[
                { label: 'Restaurant', value: restaurant.name },
                { label: 'Date',       value: selectedDateLabel },
                { label: 'Time',       value: selectedTime! },
                { label: 'Guests',     value: `${guests} guest${guests > 1 ? 's' : ''}` },
                { label: 'Name',       value: name },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '16px 24px',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--hairline)' : 'none',
                    fontSize: 15,
                  }}
                >
                  <span style={{ color: 'var(--muted-ink)' }}>{row.label}</span>
                  <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Single CTA text */}
            <p style={{ fontSize: 15, color: 'var(--muted-ink)' }}>
              Plan your next dish at{' '}
              <Link
                href="/"
                style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}
              >
                DiscoverDish
              </Link>
            </p>
          </div>
        )}

        {step !== 'success' && (
          <>
            {/* ══ STEP 1 ══ */}
            <div style={{
              border: '1px solid var(--hairline)', borderRadius: 16,
              padding: '28px 28px 24px', background: 'var(--paper)', marginBottom: 28,
              opacity: step === 'details' ? 0.6 : 1,
              pointerEvents: step === 'details' ? 'none' : 'auto',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: step === 'details' ? 'var(--muted-2)' : 'var(--brand)' }}>
                  Step 1 · Date &amp; time
                </span>
                {step === 'details' && (
                  <button onClick={() => setStep('select')} style={{ fontSize: 13, color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}>
                    Edit
                  </button>
                )}
              </div>

              {/* Summary when collapsed */}
              {step === 'details' ? (
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {[
                    { icon: <Users size={15} />, text: `${guests} guest${guests > 1 ? 's' : ''}` },
                    { text: selectedDateLabel },
                    { text: selectedTime! },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>
                      {item.icon}
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Guests */}
                  <div style={{ marginBottom: 28 }}>
                    <Label>How many guests?</Label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <button key={n} onClick={() => setGuests(n)} style={{ width: 52, height: 52, borderRadius: 12, border: '1px solid', borderColor: guests === n ? 'var(--brand)' : 'var(--hairline)', background: guests === n ? 'color-mix(in srgb, var(--brand) 8%, transparent)' : 'var(--canvas)', color: guests === n ? 'var(--brand)' : 'var(--ink)', fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                          {n === 6 ? '6+' : n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date */}
                  <div style={{ marginBottom: 28 }}>
                    <Label>When?</Label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => setDateOffset(Math.max(0, dateOffset - 1))} disabled={dateOffset === 0} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--hairline)', background: 'var(--canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: dateOffset === 0 ? 'not-allowed' : 'pointer', opacity: dateOffset === 0 ? 0.3 : 1, flexShrink: 0 }}>
                        <ChevronLeft size={16} />
                      </button>
                      <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                        {visibleDates.map((d, i) => {
                          const gIdx = dateOffset + i
                          const isSel = selectedDateIdx === gIdx
                          return (
                            <button key={d.iso} onClick={() => setSelectedDateIdx(gIdx)} style={{ flex: 1, padding: '10px 4px', borderRadius: 10, border: '1px solid', borderColor: isSel ? 'var(--brand)' : 'var(--hairline)', background: isSel ? 'color-mix(in srgb, var(--brand) 8%, transparent)' : 'var(--canvas)', color: isSel ? 'var(--brand)' : 'var(--ink)', fontSize: 12, fontWeight: isSel ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center', whiteSpace: 'nowrap' }}>
                              {d.short}
                            </button>
                          )
                        })}
                      </div>
                      <button onClick={() => setDateOffset(Math.min(dateOptions.length - 5, dateOffset + 1))} disabled={dateOffset >= dateOptions.length - 5} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--hairline)', background: 'var(--canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: dateOffset >= dateOptions.length - 5 ? 'not-allowed' : 'pointer', opacity: dateOffset >= dateOptions.length - 5 ? 0.3 : 1, flexShrink: 0 }}>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Time slots */}
                  <div style={{ marginBottom: 28 }}>
                    <Label>What time?</Label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                      {timeSlots.map((t) => (
                        <button key={t} onClick={() => setSelectedTime(t)} style={{ padding: '10px 4px', borderRadius: 8, border: '1px solid', borderColor: selectedTime === t ? 'var(--brand)' : 'var(--hairline)', background: selectedTime === t ? 'color-mix(in srgb, var(--brand) 8%, transparent)' : 'var(--canvas)', color: selectedTime === t ? 'var(--brand)' : 'var(--ink)', fontSize: 13, fontWeight: selectedTime === t ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center' }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setStep('details')}
                    disabled={!canSecure}
                    style={{ width: '100%', padding: '15px', borderRadius: 999, background: canSecure ? 'var(--brand)' : 'var(--hairline)', color: canSecure ? '#fff' : 'var(--muted-ink)', fontSize: 15, fontWeight: 600, border: 'none', cursor: canSecure ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
                  >
                    {canSecure ? `Secure date · ${selectedTime}` : 'Select a time to continue'}
                  </button>
                </>
              )}
            </div>

            {/* ══ STEP 2 ══ */}
            {step === 'details' && (
              <div style={{ border: '1px solid var(--hairline)', borderRadius: 16, padding: '28px 28px 24px', background: 'var(--paper)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand)', display: 'block', marginBottom: 24 }}>
                  Step 2 · Guest details
                </span>

                <div style={{ marginBottom: 28 }}>
                  <Label>Guest details</Label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <Field label="Full name" placeholder="Elena Weber" value={name} onChange={setName} />
                    <Field label="Phone" placeholder="+49 170 1234567" value={phone} onChange={setPhone} type="tel" />
                  </div>
                  <Field label="Email" placeholder="elena@example.com" value={email} onChange={setEmail} type="email" />
                </div>

                <HR />

                <div style={{ marginBottom: 28 }}>
                  <Label>Occasion (optional)</Label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {OCCASIONS.map((o) => (
                      <button key={o} onClick={() => setOccasion(occasion === o ? null : o)} style={{ padding: '9px 18px', borderRadius: 999, border: '1px solid', borderColor: occasion === o ? 'var(--brand)' : 'var(--hairline)', background: occasion === o ? 'color-mix(in srgb, var(--brand) 8%, transparent)' : 'var(--paper)', color: occasion === o ? 'var(--brand)' : 'var(--ink)', fontSize: 14, cursor: 'pointer', transition: 'all 0.15s' }}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                <HR />

                <div style={{ marginBottom: 32 }}>
                  <Label>Special requests</Label>
                  <textarea
                    placeholder="Allergies, seating preferences, surprises..."
                    value={requests}
                    onChange={e => setRequests(e.target.value)}
                    rows={4}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px', borderRadius: 8, border: '1px solid var(--hairline)', background: 'var(--paper)', fontSize: 15, color: 'var(--ink)', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-sans)' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => setStep('select')} style={{ padding: '13px 24px', borderRadius: 999, border: '1px solid var(--hairline)', background: 'var(--paper)', fontSize: 14, fontWeight: 500, color: 'var(--ink)', cursor: 'pointer' }}>
                    Back
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!name || !phone}
                    style={{ padding: '13px 32px', borderRadius: 999, background: name && phone ? 'var(--brand)' : 'var(--hairline)', color: name && phone ? '#fff' : 'var(--muted-ink)', fontSize: 15, fontWeight: 600, border: 'none', cursor: name && phone ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
                  >
                    Confirm reservation
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default function ReservePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return (
    <Suspense>
      <ReservePageInner slug={slug} />
    </Suspense>
  )
}
