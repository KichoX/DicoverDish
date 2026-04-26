export interface Restaurant {
  id: string
  name: string
  image: string
  rating: number
  cuisines: string[]
  tags: string[]
  isOpen: boolean
  hours: string
  address: string
  description?: string
  phone?: string
  website?: string
  instagram?: string
}

export interface MenuItem {
  id: string
  restaurantId?: string
  name: string
  description: string
  price: number
  image?: string
  category: string
  isAvailable: boolean
}

export interface CartItem extends MenuItem {
  quantity: number
  notes?: string
}

export interface Reservation {
  id: string
  restaurantId: string
  restaurantName: string
  date: Date
  time: string
  guests: number
  name: string
  phone: string
  tableId?: string
  status: 'pending' | 'confirmed' | 'cancelled'
}

export interface Order {
  id: string
  restaurantId: string
  restaurantName: string
  items: CartItem[]
  type: 'delivery' | 'pickup' | 'dine-in'
  tableNumber?: string
  address?: string
  status: 'new' | 'preparing' | 'ready' | 'delivered'
  total: number
  createdAt: Date
}

export interface Table {
  id: string
  number: number
  section: string
  capacity: number
  shape: 'round' | 'rectangular' | 'square'
  isAvailable: boolean
}

export type OrderMode = 'delivery' | 'pickup' | 'dine-in' | 'qr'
