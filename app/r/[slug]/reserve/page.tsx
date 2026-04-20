'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Calendar, Users, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { restaurants, tables } from '@/lib/data'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

type Step = 'table' | 'details' | 'success'

// Table visual dimensions by capacity
function getTableDims(capacity: number, shape: string) {
  if (shape === 'round') {
    const d = capacity <= 2 ? 52 : capacity <= 4 ? 68 : 80
    return { tw: d, th: d }
  }
  if (capacity <= 2) return { tw: 64, th: 44 }
  if (capacity <= 4) return { tw: 90, th: 62 }
  if (capacity <= 6) return { tw: 114, th: 70 }
  return { tw: 140, th: 78 }
}

// Predefined % positions (cx, cy = center) per section table
const POSITIONS: Record<string, { x: number; y: number }> = {
  // Garden: t1(round2), t2(rect4), t3(rect6 - unavailable)
  t1:  { x: 16, y: 22 },
  t2:  { x: 65, y: 18 },
  t3:  { x: 38, y: 64 },
  // Fountain: t4(round2), t5(rect4), t6(square4), t7(round2), t8(rect6), t9(round2-unavail)
  t4:  { x: 14, y: 14 },
  t5:  { x: 66, y: 12 },
  t6:  { x: 14, y: 48 },
  t7:  { x: 68, y: 50 },
  t8:  { x: 14, y: 79 },
  t9:  { x: 68, y: 80 },
  // 1st Floor: t10(rect8), t11(round4), t12(rect6)
  t10: { x: 18, y: 18 },
  t11: { x: 70, y: 15 },
  t12: { x: 18, y: 65 },
}

function FloorTable({
  table,
  isSelected,
  guestCount,
  onSelect,
}: {
  table: typeof tables[0]
  isSelected: boolean
  guestCount: number
  onSelect: (id: string) => void
}) {
  const { tw, th } = getTableDims(table.capacity, table.shape)
  const pos = POSITIONS[table.id]
  const CHAIR = 9
  const GAP = 5
  const pad = CHAIR + GAP

  const isRound = table.shape === 'round'
  const canSelect = table.isAvailable && table.capacity >= guestCount

  // Build chair positions (relative to table top-left)
  const chairs: Array<{ x: number; y: number; w: number; h: number }> = []
  if (isRound) {
    const count = Math.min(table.capacity, 8)
    const r = tw / 2 + GAP + CHAIR / 2
    for (let i = 0; i < count; i++) {
      const a = (i / count) * 2 * Math.PI - Math.PI / 2
      chairs.push({ x: tw / 2 + r * Math.cos(a) - CHAIR / 2, y: th / 2 + r * Math.sin(a) - CHAIR / 2, w: CHAIR, h: CHAIR })
    }
  } else {
    const hc = table.capacity <= 2 ? 1 : table.capacity <= 4 ? 2 : 3
    const spacing = tw / (hc + 1)
    for (let i = 0; i < hc; i++) {
      chairs.push({ x: spacing * (i + 1) - CHAIR / 2, y: -(GAP + CHAIR), w: CHAIR, h: CHAIR })
      chairs.push({ x: spacing * (i + 1) - CHAIR / 2, y: th + GAP, w: CHAIR, h: CHAIR })
    }
    // left / right side chairs
    chairs.push({ x: -(GAP + CHAIR), y: th / 2 - CHAIR / 2, w: CHAIR, h: CHAIR })
    chairs.push({ x: tw + GAP, y: th / 2 - CHAIR / 2, w: CHAIR, h: CHAIR })
  }

  const chairColor = isSelected
    ? 'bg-blue-400'
    : canSelect
    ? 'bg-blue-200'
    : 'bg-gray-200'

  const tableClass = cn(
    'absolute border-2 flex items-center justify-center transition-all',
    isRound ? 'rounded-full' : 'rounded-xl',
    isSelected
      ? 'bg-blue-100 border-blue-500 shadow-md shadow-blue-200'
      : canSelect
      ? 'bg-blue-50 border-blue-300 hover:border-blue-400 hover:bg-blue-100/60 cursor-pointer'
      : 'bg-gray-50 border-gray-200 cursor-not-allowed'
  )

  if (!pos) return null

  return (
    <div
      className={cn('absolute', !canSelect && 'opacity-50')}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: 'translate(-50%, -50%)',
        width: tw + pad * 2,
        height: th + pad * 2,
      }}
      onClick={() => canSelect && onSelect(table.id)}
    >
      {/* Chair indicators */}
      {chairs.map((c, i) => (
        <div
          key={i}
          className={cn('absolute rounded-sm transition-colors', chairColor)}
          style={{ left: c.x + pad, top: c.y + pad, width: c.w, height: c.h }}
        />
      ))}

      {/* Table surface */}
      <div className={tableClass} style={{ left: pad, top: pad, width: tw, height: th }}>
        <span className={cn(
          'text-sm font-semibold select-none',
          isSelected ? 'text-blue-600' : canSelect ? 'text-blue-400' : 'text-gray-300'
        )}>
          {table.number}
        </span>
      </div>
    </div>
  )
}

export default function ReservePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const searchParams = useSearchParams()
  const { addReservation, user } = useAppStore()

  const restaurant = restaurants.find((r) => generateSlug(r.name) === slug)

  const dateParam = searchParams.get('date')
  const timeParam = searchParams.get('time')
  const guestsParam = searchParams.get('guests')

  const [step, setStep] = useState<Step>('table')
  const [selectedDate] = useState<Date>(dateParam ? new Date(dateParam) : new Date())
  const [selectedTime] = useState<string>(timeParam || '7:00 PM')
  const [guestCount] = useState(guestsParam ? parseInt(guestsParam) : 2)
  const [selectedSection, setSelectedSection] = useState('Fountain')
  const [selectedTable, setSelectedTable] = useState<string | null>(null)

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState(user?.email || '')
  const [specialRequests, setSpecialRequests] = useState('')

  useEffect(() => {
    if (user) { setName(user.name); setEmail(user.email) }
  }, [user])

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Restaurant not found</h1>
          <Button asChild><Link href="/">Browse Restaurants</Link></Button>
        </div>
      </div>
    )
  }

  const tableSections = [...new Set(tables.map((t) => t.section))]
  const sectionTables = tables.filter((t) => t.section === selectedSection)

  const handleConfirm = () => {
    if (!name || !phone) return
    addReservation({
      id: `res-${Date.now()}`,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      date: selectedDate,
      time: selectedTime,
      guests: guestCount,
      name,
      phone,
      tableId: selectedTable || undefined,
      status: 'confirmed' as const,
    })
    setStep('success')
  }

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })

  const sectionEmoji: Record<string, string> = {
    Garden: '🌿', Fountain: '⛲', '1st Floor': '🏠',
  }

  const selectedTableData = tables.find((t) => t.id === selectedTable)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-card border-b border-border flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/r/${slug}`}
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-medium text-sm">{restaurant.name}</span>
          </div>
          {step !== 'success' && (
            <span className="text-xs text-muted-foreground">
              Step {step === 'table' ? '1' : '2'} of 2
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-32">

        {/* ── Step pills ── */}
        {step !== 'success' && (
          <div className="flex items-center gap-3 mb-6">
            <div className={cn(
              'h-8 px-4 rounded-full text-xs font-semibold inline-flex items-center transition-colors',
              step === 'table' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}>
              1. Choose table
            </div>
            <div className="flex-1 h-px bg-border max-w-[2rem]" />
            <div className={cn(
              'h-8 px-4 rounded-full text-xs font-semibold inline-flex items-center border transition-colors',
              step === 'details'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground bg-transparent'
            )}>
              2. Your details
            </div>
          </div>
        )}

        {/* ── Reservation summary card ── */}
        {step !== 'success' && (
          <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-5 py-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">{formattedDate}</p>
                <p className="text-sm text-muted-foreground">{selectedTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="font-medium text-foreground">{guestCount} guests</span>
            </div>
          </div>
        )}

        {/* ── STEP 1: Choose table ── */}
        {step === 'table' && (
          <div className="space-y-5">
            <h1 className="font-serif text-3xl italic">Choose table</h1>

            {/* Section tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {tableSections.map((section) => (
                <button
                  key={section}
                  onClick={() => { setSelectedSection(section); setSelectedTable(null) }}
                  className={cn(
                    'h-9 px-4 rounded-full text-sm font-medium border whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0',
                    selectedSection === section
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'border-border hover:border-primary/30 hover:bg-muted/40 text-foreground'
                  )}
                >
                  <span>{sectionEmoji[section] ?? '🍽️'}</span>
                  <span>{section}</span>
                </button>
              ))}
            </div>

            {/* Floor plan */}
            <div
              className="relative bg-slate-50 rounded-2xl border border-border overflow-hidden"
              style={{ height: 420 }}
            >
              {sectionTables.map((table) => (
                <FloorTable
                  key={table.id}
                  table={table}
                  isSelected={selectedTable === table.id}
                  guestCount={guestCount}
                  onSelect={setSelectedTable}
                />
              ))}

              {/* Legend */}
              <div className="absolute bottom-3 right-3 flex items-center gap-3 text-[10px] text-muted-foreground bg-card/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-border/40">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-300 inline-block" />
                  Available
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200 inline-block" />
                  Taken
                </span>
              </div>
            </div>

            {/* Selected table chip */}
            {selectedTable && (
              <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
                <div>
                  <p className="font-semibold text-sm">Table {selectedTableData?.number}</p>
                  <p className="text-xs text-muted-foreground">
                    Up to {selectedTableData?.capacity} guests · {selectedSection}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Change
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Your details ── */}
        {step === 'details' && (
          <div className="space-y-5">
            <h1 className="font-serif text-3xl italic">Your details</h1>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Your Name *</label>
                <Input
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone *</label>
                  <Input
                    type="tel"
                    placeholder="+1 555 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Special requests</label>
                <Input
                  placeholder="Allergies, special occasions..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            {/* Booking summary */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Booking summary</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Restaurant</span>
                <span className="font-medium">{restaurant.name}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date &amp; time</span>
                <span className="font-medium">{formattedDate} · {selectedTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Party size</span>
                <span className="font-medium">{guestCount} guests</span>
              </div>
              {selectedTableData && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Table</span>
                  <span className="font-medium">#{selectedTableData.number} · {selectedSection}</span>
                </div>
              )}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex gap-3 pt-1">
              <Button
                variant="outline"
                className="h-11 px-5 rounded-xl"
                onClick={() => setStep('table')}
              >
                Back
              </Button>
              <Button
                className="flex-1 h-11 rounded-xl"
                disabled={!name || !phone}
                onClick={handleConfirm}
              >
                Confirm reservation
              </Button>
            </div>
          </div>
        )}

        {/* ── Success ── */}
        {step === 'success' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="font-serif text-3xl italic mb-2">Reservation Confirmed!</h2>
            <p className="text-muted-foreground mb-8">
              We&apos;ve noted your reservation and will send a confirmation shortly.
            </p>

            <Card className="text-left mb-6">
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Restaurant</span>
                  <span className="font-medium">{restaurant.name}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date &amp; time</span>
                  <span className="font-medium">{formattedDate} · {selectedTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Party size</span>
                  <span className="font-medium">{guestCount} guests</span>
                </div>
                {selectedTableData && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Table</span>
                    <span className="font-medium">#{selectedTableData.number} · {selectedSection}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-full h-11" asChild>
                <Link href={`/r/${slug}`}>Back to Restaurant</Link>
              </Button>
              <Button className="flex-1 rounded-full h-11" asChild>
                <Link href="/">Discover More</Link>
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* ── Mobile bottom button ── */}
      {step !== 'success' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30">
          <div className="p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
            <Button
              className="w-full h-13 rounded-2xl text-base font-semibold shadow-xl"
              disabled={step === 'details' && (!name || !phone)}
              onClick={() => {
                if (step === 'table') setStep('details')
                else handleConfirm()
              }}
            >
              {step === 'table'
                ? selectedTable
                  ? `Continue · Table ${selectedTableData?.number}`
                  : 'Continue without table preference'
                : 'Confirm Reservation'}
            </Button>
          </div>
        </div>
      )}

      {/* ── Desktop bottom button for step 1 ── */}
      {step === 'table' && (
        <div className="hidden md:block">
          <div className="max-w-2xl mx-auto px-4 pb-10">
            <div className="flex justify-end">
              <Button
                className="h-11 px-7 rounded-xl text-sm font-semibold"
                onClick={() => setStep('details')}
              >
                {selectedTable ? `Continue · Table ${selectedTableData?.number}` : 'Continue without preference'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
