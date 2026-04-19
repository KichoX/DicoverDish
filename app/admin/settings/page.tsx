'use client'

import { useState } from 'react'
import { 
  Clock, MapPin, Globe, Instagram, Facebook, Phone, Mail, 
  PawPrint, Cigarette, Baby, Wifi, CreditCard, Utensils,
  Save, LogOut, User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// Mock restaurant data - would come from database in production
const initialSettings = {
  name: 'Le Loup Imperial',
  description: 'Fine French dining in the heart of Hamburg. Our chef creates exquisite dishes using the freshest local ingredients, paired with an extensive wine collection.',
  cuisineType: 'French',
  priceRange: '$$$$',
  address: 'Neuer Wall 25, 20354 Hamburg',
  phone: '+49 40 123 4567',
  email: 'reservations@leloupimperial.de',
  website: 'https://leloupimperial.de',
  instagram: '@leloupimperial',
  facebook: 'leloupimperial',
  openingHours: {
    monday: { open: '12:00', close: '22:00', closed: false },
    tuesday: { open: '12:00', close: '22:00', closed: false },
    wednesday: { open: '12:00', close: '22:00', closed: false },
    thursday: { open: '12:00', close: '23:00', closed: false },
    friday: { open: '12:00', close: '23:00', closed: false },
    saturday: { open: '18:00', close: '23:00', closed: false },
    sunday: { open: '18:00', close: '22:00', closed: true },
  },
  attributes: {
    petFriendly: true,
    nonSmoking: true,
    familyFriendly: true,
    wifi: true,
    creditCards: true,
    wheelchair: true,
    outdoor: true,
    privateRooms: true,
    vegetarianOptions: true,
    veganOptions: true,
  }
}

const cuisineTypes = [
  'French', 'Italian', 'Japanese', 'Chinese', 'Indian', 'Mexican', 
  'American', 'Mediterranean', 'Thai', 'Vietnamese', 'Korean', 'Spanish',
  'Greek', 'German', 'Middle Eastern', 'Seafood', 'Steakhouse', 'Vegetarian'
]

const priceRanges = ['$', '$$', '$$$', '$$$$']

const attributesList = [
  { key: 'petFriendly', label: 'Pet-friendly', icon: PawPrint },
  { key: 'nonSmoking', label: 'Non-smoking', icon: Cigarette },
  { key: 'familyFriendly', label: 'Family-friendly', icon: Baby },
  { key: 'wifi', label: 'Free WiFi', icon: Wifi },
  { key: 'creditCards', label: 'Credit Cards', icon: CreditCard },
  { key: 'wheelchair', label: 'Wheelchair Access', icon: User },
  { key: 'outdoor', label: 'Outdoor Seating', icon: Utensils },
  { key: 'privateRooms', label: 'Private Rooms', icon: Utensils },
  { key: 'vegetarianOptions', label: 'Vegetarian Options', icon: Utensils },
  { key: 'veganOptions', label: 'Vegan Options', icon: Utensils },
]

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(initialSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'hours' | 'attributes' | 'contact'>('profile')

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const updateHours = (day: typeof days[number], field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }))
  }

  const toggleAttribute = (key: string) => {
    setSettings(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key]: !prev.attributes[key as keyof typeof prev.attributes]
      }
    }))
  }

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'hours', label: 'Hours' },
    { id: 'attributes', label: 'Attributes' },
    { id: 'contact', label: 'Contact' },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Restaurant Settings</h1>
          <p className="text-muted-foreground">Manage your restaurant profile and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="rounded-xl h-11 px-6">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your restaurant name, description, and category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Field>
                <FieldLabel htmlFor="name">Restaurant Name</FieldLabel>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="description">About / Description</FieldLabel>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  className="rounded-xl resize-none"
                  rows={4}
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Cuisine Type</FieldLabel>
                  <Select 
                    value={settings.cuisineType}
                    onValueChange={(value) => setSettings({ ...settings, cuisineType: value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                      {cuisineTypes.map((cuisine) => (
                        <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Price Range</FieldLabel>
                  <Select 
                    value={settings.priceRange}
                    onValueChange={(value) => setSettings({ ...settings, priceRange: value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select price range" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map((range) => (
                        <SelectItem key={range} value={range}>{range}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Your restaurant address</CardDescription>
            </CardHeader>
            <CardContent>
              <Field>
                <FieldLabel htmlFor="address">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Address
                </FieldLabel>
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </Field>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hours Tab */}
      {activeTab === 'hours' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Opening Hours
            </CardTitle>
            <CardDescription>Set your restaurant operating hours for each day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {days.map((day) => (
                <div 
                  key={day} 
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl border transition-colors',
                    settings.openingHours[day].closed 
                      ? 'bg-muted/50 border-border' 
                      : 'bg-card border-border'
                  )}
                >
                  <div className="w-28 font-medium capitalize">{day}</div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!settings.openingHours[day].closed}
                      onCheckedChange={(checked) => updateHours(day, 'closed', !checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {settings.openingHours[day].closed ? 'Closed' : 'Open'}
                    </span>
                  </div>

                  {!settings.openingHours[day].closed && (
                    <div className="flex items-center gap-2 ml-auto">
                      <Input
                        type="time"
                        value={settings.openingHours[day].open}
                        onChange={(e) => updateHours(day, 'open', e.target.value)}
                        className="w-32 h-10 rounded-lg"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={settings.openingHours[day].close}
                        onChange={(e) => updateHours(day, 'close', e.target.value)}
                        className="w-32 h-10 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attributes Tab */}
      {activeTab === 'attributes' && (
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Attributes</CardTitle>
            <CardDescription>Features and amenities your restaurant offers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {attributesList.map((attr) => {
                const isActive = settings.attributes[attr.key as keyof typeof settings.attributes]
                return (
                  <button
                    key={attr.key}
                    onClick={() => toggleAttribute(attr.key)}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
                      isActive
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      isActive ? 'bg-primary/20' : 'bg-muted'
                    )}>
                      <attr.icon className={cn(
                        'w-5 h-5',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      )} />
                    </div>
                    <span className={cn(
                      'font-medium',
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {attr.label}
                    </span>
                    {isActive && (
                      <Badge className="ml-auto bg-primary/20 text-primary hover:bg-primary/20 border-0">
                        Active
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Tab */}
      {activeTab === 'contact' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How customers can reach you</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="phone">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media & Web</CardTitle>
              <CardDescription>Your online presence</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="website">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Website
                  </FieldLabel>
                  <Input
                    id="website"
                    type="url"
                    value={settings.website}
                    onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                    className="h-12 rounded-xl"
                    placeholder="https://yourrestaurant.com"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="instagram">
                    <Instagram className="w-4 h-4 inline mr-2" />
                    Instagram
                  </FieldLabel>
                  <Input
                    id="instagram"
                    value={settings.instagram}
                    onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                    className="h-12 rounded-xl"
                    placeholder="@yourusername"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="facebook">
                    <Facebook className="w-4 h-4 inline mr-2" />
                    Facebook
                  </FieldLabel>
                  <Input
                    id="facebook"
                    value={settings.facebook}
                    onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                    className="h-12 rounded-xl"
                    placeholder="yourpagename"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Logout Section */}
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">Account</CardTitle>
              <CardDescription>Manage your admin account</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="rounded-xl">
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
