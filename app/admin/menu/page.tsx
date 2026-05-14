'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  Plus, Minus, Pencil, UtensilsCrossed, ChevronDown, ChevronUp,
  X, Upload, Leaf, Pizza, CakeSlice, GlassWater, Fish, Flame,
  Coffee, Wine, Sandwich, Egg, Star, ChefHat, Baby, Sprout,
  Utensils, Sunrise, Users, Waves, Trash2, Loader2, RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import { api, uploadApi } from '@/lib/api'
import type { MenuItem } from '@/lib/types'
import { cn } from '@/lib/utils'

// ── All possible categories with icons ──────────────────────────────
const ALL_CATEGORIES = [
  { id: 'Starters',        label: 'Starters',        icon: Leaf         },
  { id: 'Main Courses',    label: 'Main Courses',    icon: UtensilsCrossed },
  { id: 'Pizza',           label: 'Pizza',            icon: Pizza        },
  { id: 'Pasta',           label: 'Pasta',            icon: Utensils     },
  { id: 'Handmade Pasta',  label: 'Handmade Pasta',  icon: ChefHat      },
  { id: 'Meat',            label: 'Meat',             icon: Flame        },
  { id: 'Fish',            label: 'Fish',             icon: Fish         },
  { id: 'Burgers',         label: 'Burgers',          icon: Sandwich     },
  { id: 'Sushi',           label: 'Sushi',            icon: Utensils     },
  { id: 'Seafood',         label: 'Seafood',          icon: Waves        },
  { id: 'Soups',           label: 'Soups',            icon: Flame        },
  { id: 'Salads',          label: 'Salads',           icon: Sprout       },
  { id: 'Grills & BBQ',    label: 'Grills & BBQ',    icon: Flame        },
  { id: 'Vegetarian',      label: 'Vegetarian',       icon: Leaf         },
  { id: 'Vegan',           label: 'Vegan',            icon: Sprout       },
  { id: 'Desserts',        label: 'Desserts',         icon: CakeSlice    },
  { id: 'Drinks',          label: 'Drinks',           icon: GlassWater   },
  { id: 'Cocktails',       label: 'Cocktails',        icon: Wine         },
  { id: 'Coffee & Tea',    label: 'Coffee & Tea',    icon: Coffee       },
  { id: 'Breakfast',       label: 'Breakfast',        icon: Sunrise      },
  { id: 'Brunch',          label: 'Brunch',           icon: Egg          },
  { id: 'Kids Menu',       label: 'Kids Menu',        icon: Baby         },
  { id: 'Sharing Plates',  label: 'Sharing Plates',  icon: Users        },
  { id: 'Daily Specials',  label: 'Daily Specials',  icon: Star         },
  { id: 'Sides',           label: 'Sides',            icon: ChefHat      },
]

interface EditingItem {
  id: string | null
  name: string
  description: string
  price: number
  image?: string
  category: string
  isAvailable: boolean
}

export default function MenuBuilderPage() {
  const { token, user } = useAppStore()
  const restaurantId = user?.restaurantId

  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set())
  const [categoriesExpanded, setCategoriesExpanded] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadMenu = useCallback(async () => {
    if (!restaurantId) return
    setLoading(true)
    try {
      // GET /menu is public — no auth needed for reads
      const data = await api.getMenu(restaurantId)
      setItems(data)
      setActiveCategories(new Set(data.map(i => i.category)))
    } catch {
      // backend unreachable
    } finally {
      setLoading(false)
    }
  }, [restaurantId])

  useEffect(() => {
    if (restaurantId) loadMenu()
  }, [loadMenu, restaurantId])

  const activeCategoryList = ALL_CATEGORIES.filter((c) => activeCategories.has(c.id))

  const toggleCategory = (id: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        if (selectedFilter === id) setSelectedFilter('all')
      } else {
        next.add(id)
      }
      return next
    })
  }

  const filteredItems = items.filter((item) => {
    const inActive = activeCategories.has(item.category)
    if (!inActive) return false
    if (selectedFilter === 'all') return true
    return item.category === selectedFilter
  })

  const toggleAvailability = async (item: MenuItem) => {
    if (!restaurantId || !token) return
    const updated = { ...item, isAvailable: !item.isAvailable }
    setItems(prev => prev.map(i => i.id === item.id ? updated : i))
    try {
      await api.updateMenuItem(restaurantId, item.id, { isAvailable: !item.isAvailable }, token)
    } catch {
      setItems(prev => prev.map(i => i.id === item.id ? item : i))
    }
  }

  const handleAddItem = () => {
    setEditingItem({
      id: null,
      name: '',
      description: '',
      price: 0,
      category: activeCategoryList[0]?.id ?? 'Main Courses',
      isAvailable: true,
    })
    setIsDialogOpen(true)
  }

  const handleEditItem = (item: MenuItem) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      category: item.category,
      isAvailable: item.isAvailable,
    })
    setIsDialogOpen(true)
  }

  const handleSaveItem = async () => {
    if (!editingItem || !restaurantId || !token) return
    setSaving(true)
    try {
      const imageUrl = editingItem.image || undefined
      if (editingItem.id === null) {
        const created = await api.addMenuItem(restaurantId, {
          name: editingItem.name,
          description: editingItem.description,
          price: editingItem.price,
          imageUrl,
          category: editingItem.category,
          isAvailable: editingItem.isAvailable,
          sortOrder: items.length,
        }, token)
        setItems(prev => [...prev, created])
        setActiveCategories(prev => new Set(prev).add(created.category))
      } else {
        const updated = await api.updateMenuItem(restaurantId, editingItem.id, {
          name: editingItem.name,
          description: editingItem.description,
          price: editingItem.price,
          imageUrl,
          category: editingItem.category,
          isAvailable: editingItem.isAvailable,
        }, token)
        setItems(prev => prev.map(i => i.id === editingItem.id ? updated : i))
      }
      setIsDialogOpen(false)
      setEditingItem(null)
    } catch (err) {
      console.error('Failed to save item', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!restaurantId || !token) return
    const prev = items
    setItems(items.filter(i => i.id !== id))
    setDeleteConfirm(null)
    try {
      await api.deleteMenuItem(restaurantId, id, token)
    } catch {
      setItems(prev)
    }
  }

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return
    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => {
      setEditingItem(prev => prev ? { ...prev, image: ev.target?.result as string } : null)
    }
    reader.readAsDataURL(file)
    // Upload to backend to get a persistent URL
    setUploadingImage(true)
    try {
      const { url } = await uploadApi.uploadImage(file, token)
      setEditingItem(prev => prev ? { ...prev, image: url } : null)
    } catch {
      // Keep data: URL as fallback preview — it shows but won't survive a reload
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Menu Builder</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading…' : `${items.length} item${items.length !== 1 ? 's' : ''} · Manage categories and items`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={loadMenu} disabled={loading} title="Refresh menu">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
          <Button onClick={handleAddItem} disabled={loading}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* ── Categories section ── */}
          <Card>
            <CardHeader className="pb-3">
              <button
                className="flex items-center justify-between w-full"
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
              >
                <CardTitle className="text-base">
                  Categories
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {activeCategories.size} active
                  </span>
                </CardTitle>
                {categoriesExpanded
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
            </CardHeader>

            {categoriesExpanded && (
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                  {ALL_CATEGORIES.map((cat) => {
                    const isActive = activeCategories.has(cat.id)
                    const Icon = cat.icon
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-center transition-all group',
                          isActive
                            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                            : 'border-border bg-muted/30 hover:border-border/60'
                        )}
                      >
                        <div className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center',
                          isActive ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-muted'
                        )}>
                          <Icon className={cn('w-4 h-4', isActive ? 'text-emerald-600' : 'text-muted-foreground')} />
                        </div>
                        <span className={cn(
                          'text-xs font-medium leading-tight',
                          isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'
                        )}>
                          {cat.label}
                        </span>
                        <div className={cn(
                          'w-5 h-5 rounded-full border flex items-center justify-center transition-colors',
                          isActive
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-border bg-background text-muted-foreground group-hover:border-primary/40'
                        )}>
                          {isActive
                            ? <Minus className="w-2.5 h-2.5" />
                            : <Plus className="w-2.5 h-2.5" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            )}
          </Card>

          {/* ── Filter tabs + Items ── */}
          <div>
            {/* Filter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-4">
              <button
                onClick={() => setSelectedFilter('all')}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium border whitespace-nowrap transition-all flex-shrink-0',
                  selectedFilter === 'all'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:border-primary/40 text-muted-foreground'
                )}
              >
                All Items
              </button>
              {activeCategoryList.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedFilter(cat.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border whitespace-nowrap transition-all flex-shrink-0',
                      selectedFilter === cat.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:border-primary/40 text-muted-foreground'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                )
              })}
            </div>

            {/* Items grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.length === 0 ? (
                <div className="col-span-full text-center py-16 text-muted-foreground text-sm">
                  No items in this category yet.{' '}
                  <button onClick={handleAddItem} className="text-primary underline">Add one</button>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const CategoryIcon = ALL_CATEGORIES.find((c) => c.id === item.category)?.icon ?? UtensilsCrossed
                  return (
                    <Card key={item.id} className={cn(!item.isAvailable && 'opacity-60')}>
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={72}
                              height={72}
                              className="w-18 h-18 rounded-xl object-cover flex-shrink-0"
                              unoptimized
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                              <CategoryIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-0.5">
                              <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                              <Badge variant="outline" className="text-[10px] ml-1 flex-shrink-0">{item.category}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">{item.description}</p>
                            <p className="font-bold text-sm">€{item.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                          <div className="flex items-center gap-2">
                            <Switch checked={item.isAvailable} onCheckedChange={() => toggleAvailability(item)} />
                            <span className="text-xs text-muted-foreground">
                              {item.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                          <div className="flex gap-1.5">
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleEditItem(item)}>
                              <Pencil className="w-3 h-3 mr-1" />Edit
                            </Button>
                            <Button
                              variant="outline" size="sm"
                              className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteConfirm(item.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Delete confirm dialog ── */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete item?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDeleteItem(deleteConfirm)}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem?.id === null ? 'Add Item' : 'Edit Item'}</DialogTitle>
            <DialogDescription>Fill in the details for this menu item</DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-5 mt-2">
              {/* Image upload */}
              <div>
                <p className="text-sm font-medium mb-2">Image</p>
                <div
                  className="relative border-2 border-dashed border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/40 transition-colors"
                  style={{ height: 160 }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {editingItem.image ? (
                    <>
                      <Image src={editingItem.image} alt="Preview" fill className="object-cover" unoptimized />
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingItem({ ...editingItem, image: undefined }) }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                      <Upload className="w-6 h-6" />
                      <span className="text-sm">Click to upload image</span>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                {uploadingImage && (
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" />Uploading image…
                  </p>
                )}
                <div className="mt-2">
                  <Input
                    placeholder="Or paste image URL (https://...)"
                    value={editingItem.image?.startsWith('data:') ? '' : (editingItem.image ?? '')}
                    onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                    className="h-9 text-sm rounded-lg"
                  />
                </div>
              </div>

              {/* Name + Category */}
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="name">Name *</FieldLabel>
                  <Input id="name" value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} className="h-10 rounded-lg" />
                </Field>
                <Field>
                  <FieldLabel>Category *</FieldLabel>
                  <Select value={editingItem.category} onValueChange={(v) => setEditingItem({ ...editingItem, category: v })}>
                    <SelectTrigger className="h-10 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {/* Description */}
              <Field>
                <FieldLabel htmlFor="desc">Description</FieldLabel>
                <Textarea id="desc" rows={2} value={editingItem.description} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className="rounded-lg resize-none text-sm" />
              </Field>

              {/* Price */}
              <Field>
                <FieldLabel htmlFor="price">Price (€)</FieldLabel>
                <Input id="price" type="number" step="0.01" min="0" value={editingItem.price} onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })} className="h-10 rounded-lg" />
              </Field>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>Cancel</Button>
                <Button onClick={handleSaveItem} disabled={!editingItem.name || !editingItem.category || saving}>
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : 'Save Item'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
