'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  ArrowLeft, Calendar, Users, Check, ChevronLeft, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { restaurants, tables } from '@/lib/data'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

type Step = 'table' | 'details' | 'success'

export default function ReservePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addReservation, user } = useAppStore()
  
  const restaurant = restaurants.find((r) => generateSlug(r.name) === slug)

  // Get params from URL (coming from profile page)
  const dateParam = searchParams.get('date')
  const timeParam = searchParams.get('time')
  const guestsParam = searchParams.get('guests')

  const [step, setStep] = useState<Step>('table')
  const [selectedDate] = useState<Date | null>(dateParam ? new Date(dateParam) : new Date())
  const [selectedTime] = useState<string | null>(timeParam || '7:00 PM')
  const [guestCount] = useState(guestsParam ? parseInt(guestsParam) : 2)
  const [selectedSection, setSelectedSection] = useState('Fountain')
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState(user?.email || '')
  const [specialRequests, setSpecialRequests] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user])

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Restaurant not found</h1>
          <Button asChild>
            <Link href="/">Browse Restaurants</Link>
          </Button>
        </div>
      </div>
    )
  }

  const tableSections = [...new Set(tables.map((t) => t.section))]
  const filteredTables = tables.filter(t => t.section === selectedSection && t.capacity >= guestCount)

  const handleConfirmReservation = () => {
    if (!selectedDate || !selectedTime || !name || !phone) return
    
    const reservation = {
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
    }
    addReservation(reservation)
    setStep('success')
  }

  const getTableSize = (capacity: number) => {
    if (capacity <= 2) return { w: 56, h: 40, seats: 2 }
    if (capacity <= 4) return { w: 72, h: 56, seats: 4 }
    if (capacity <= 6) return { w: 88, h: 64, seats: 6 }
    return { w: 104, h: 72, seats: 8 }
  }

  const renderTableWithSeats = (table: typeof tables[0]) => {
    const size = getTableSize(table.capacity)
    const isSelectedTable = selectedTable === table.id
    const seats = []
    
    // Add seats around the table
    if (table.capacity >= 2) {
      seats.push({ top: '50%', left: -8, transform: 'translateY(-50%)' })
      seats.push({ top: '50%', right: -8, transform: 'translateY(-50%)' })
    }
    if (table.capacity >= 4) {
      seats.push({ top: -8, left: '50%', transform: 'translateX(-50%)' })
      seats.push({ bottom: -8, left: '50%', transform: 'translateX(-50%)' })
    }
    if (table.capacity >= 6) {
      seats.push({ top: -8, left: '25%', transform: 'translateX(-50%)' })
      seats.push({ bottom: -8, left: '75%', transform: 'translateX(-50%)' })
    }
    if (table.capacity >= 8) {
      seats.push({ top: -8, left: '75%', transform: 'translateX(-50%)' })
      seats.push({ bottom: -8, left: '25%', transform: 'translateX(-50%)' })
    }

    return (
      <button
        key={table.id}
        onClick={() => table.isAvailable && setSelectedTable(table.id)}
        disabled={!table.isAvailable}
        className={cn(
          'relative flex items-center justify-center',
          !table.isAvailable && 'opacity-40 cursor-not-allowed'
        )}
        style={{ width: size.w, height: size.h }}
      >
        {/* Seats */}
        {seats.slice(0, table.capacity).map((style, i) => (
          <div
            key={i}
            className={cn(
              'absolute w-3 h-3 rounded-sm',
              isSelectedTable ? 'bg-primary/60' : 'bg-primary/20'
            )}
            style={style as React.CSSProperties}
          />
        ))}
        
        {/* Table */}
        <div
          className={cn(
            'w-full h-full rounded-lg border-2 flex items-center justify-center transition-colors',
            table.shape === 'round' && 'rounded-full',
            isSelectedTable
              ? 'bg-primary/20 border-primary'
              : 'bg-primary/5 border-primary/30 hover:border-primary/50'
          )}
        >
          <span className={cn(
            'text-sm font-medium',
            isSelectedTable ? 'text-primary' : 'text-primary/70'
          )}>
            {table.number}
          </span>
        </div>
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-card">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/r/${slug}`}
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-sm text-muted-foreground">{restaurant.name}</span>
          </div>
          {step !== 'success' && (
            <span className="text-xs text-muted-foreground">
              Step {step === 'table' ? '1' : '2'} of 2
            </span>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Reservation Summary Bar */}
        {step !== 'success' && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {selectedDate?.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-muted-foreground">{selectedTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{guestCount} guests</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Table Selection */}
        {step === 'table' && (
          <div className="space-y-6">
            <h1 className="font-serif text-3xl italic">Choose table</h1>

            {/* Section Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {tableSections.map((section) => (
                <button
                  key={section}
                  onClick={() => setSelectedSection(section)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-colors flex items-center gap-2',
                    selectedSection === section
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {section === 'Garden' && '🌿'}
                  {section === 'Fountain' && '⛲'}
                  {section === '1st Floor' && '🏠'}
                  {section}
                </button>
              ))}
            </div>

            {/* Floor Plan */}
            <div className="bg-muted/30 rounded-2xl p-6 min-h-[300px]">
              <div className="flex flex-wrap gap-6 justify-center items-center">
                {filteredTables.length > 0 ? (
                  filteredTables.map((table) => renderTableWithSeats(table))
                ) : (
                  <p className="text-sm text-muted-foreground py-12">
                    No available tables for {guestCount} guests in this section
                  </p>
                )}
              </div>
            </div>

            {selectedTable && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      Table {tables.find(t => t.id === selectedTable)?.number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {tables.find(t => t.id === selectedTable)?.capacity} seats - {selectedSection}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTable(null)}>
                    Change
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 2: Details */}
        {step === 'details' && (
          <div className="space-y-6">
            <h1 className="font-serif text-3xl italic">Your details</h1>

            {/* Contact Details */}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Your Name *</FieldLabel>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="phone">Phone *</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 555 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="requests">Special Requests</FieldLabel>
                <Input
                  id="requests"
                  placeholder="Any dietary requirements or special occasions?"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </Field>
            </FieldGroup>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="font-serif text-3xl italic mb-2">Reservation Confirmed!</h2>
            <p className="text-muted-foreground mb-8">
              We&apos;ve sent a confirmation to your phone and email
            </p>

            <Card className="text-left mb-6">
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Restaurant</span>
                  <span className="font-medium">{restaurant.name}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">
                    {selectedDate?.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Party Size</span>
                  <span className="font-medium">{guestCount} guests</span>
                </div>
                {selectedTable && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Table</span>
                    <span className="font-medium">
                      Table {tables.find((t) => t.id === selectedTable)?.number}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl h-12" asChild>
                <Link href={`/r/${slug}`}>Back to Restaurant</Link>
              </Button>
              <Button className="flex-1 rounded-xl h-12" asChild>
                <Link href="/">Discover More</Link>
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Fixed Bottom Button */}
      {step !== 'success' && (
        <div className="fixed bottom-0 left-0 right-0">
          <div className="bg-primary rounded-t-[2rem]">
            <div className="max-w-lg mx-auto">
              <Button
                className="w-full h-14 text-lg bg-transparent hover:bg-transparent text-primary-foreground"
                disabled={step === 'details' && (!name || !phone)}
                onClick={() => {
                  if (step === 'table') setStep('details')
                  else if (step === 'details') handleConfirmReservation()
                }}
              >
                {step === 'table' && (selectedTable ? 'Continue with Table ' + tables.find(t => t.id === selectedTable)?.number : 'Skip table selection')}
                {step === 'details' && 'Confirm Reservation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
