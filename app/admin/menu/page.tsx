'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Pencil, ToggleLeft, ToggleRight, UtensilsCrossed } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { menuItems as initialMenuItems, menuCategories } from '@/lib/data'
import { cn } from '@/lib/utils'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image?: string
  category: string
  isAvailable: boolean
}

export default function MenuBuilderPage() {
  const [items, setItems] = useState<MenuItem[]>(initialMenuItems)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredItems =
    selectedCategory === 'all'
      ? items
      : items.filter((item) => item.category === selectedCategory)

  const toggleAvailability = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      )
    )
  }

  const handleEditItem = (item: MenuItem) => {
    setEditingItem({ ...item })
    setIsDialogOpen(true)
  }

  const handleAddItem = () => {
    setEditingItem({
      id: `new-${Date.now()}`,
      name: '',
      description: '',
      price: 0,
      category: menuCategories[0],
      isAvailable: true,
    })
    setIsDialogOpen(true)
  }

  const handleSaveItem = () => {
    if (!editingItem) return

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === editingItem.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = editingItem
        return updated
      }
      return [...prev, editingItem]
    })
    setIsDialogOpen(false)
    setEditingItem(null)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Menu Builder</h1>
          <p className="text-muted-foreground">Add, edit, and manage menu items</p>
        </div>
        <Button onClick={handleAddItem}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Categories Sidebar */}
        <div className="w-48 hidden md:block">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm transition-colors',
                  selectedCategory === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                All Items
              </button>
              {menuCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm transition-colors',
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  {category}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Items Grid */}
        <div className="flex-1">
          {/* Mobile Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 md:hidden">
            <Badge
              variant={selectedCategory === 'all' ? 'default' : 'secondary'}
              className="cursor-pointer whitespace-nowrap px-4 py-2"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Badge>
            {menuCategories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'secondary'}
                className="cursor-pointer whitespace-nowrap px-4 py-2"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className={cn(!item.isAvailable && 'opacity-60')}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                        <UtensilsCrossed className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {item.description}
                      </p>
                      <p className="font-semibold">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.isAvailable}
                        onCheckedChange={() => toggleAvailability(item.id)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditItem(item)}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem?.id.startsWith('new') ? 'Add Item' : 'Edit Item'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for the menu item
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <FieldGroup className="mt-4">
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, description: e.target.value })
                  }
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="price">Price</FieldLabel>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={editingItem.price}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="category">Category</FieldLabel>
                  <Select
                    value={editingItem.category}
                    onValueChange={(value) =>
                      setEditingItem({ ...editingItem, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {menuCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="image">Image URL</FieldLabel>
                <Input
                  id="image"
                  value={editingItem.image || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, image: e.target.value })
                  }
                  placeholder="https://..."
                />
              </Field>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveItem}>Save Item</Button>
              </div>
            </FieldGroup>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
