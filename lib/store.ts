import { create } from 'zustand'
import type { CartItem, OrderMode, Reservation, Order } from './types'

export type UserRole = 'guest' | 'client' | 'admin' | 'driver'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AppState {
  // Auth
  user: User | null
  isLoggedIn: boolean
  login: (role: UserRole) => void
  logout: () => void
  // Cart
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (itemId: string) => void
  updateCartItemQuantity: (itemId: string, quantity: number) => void
  updateCartItemNotes: (itemId: string, notes: string) => void
  clearCart: () => void
  getCartTotal: () => number
  
  // Order Mode
  orderMode: OrderMode | null
  tableNumber: string | null
  setOrderMode: (mode: OrderMode | null) => void
  setTableNumber: (table: string | null) => void
  
  // Current Restaurant
  currentRestaurantId: string | null
  setCurrentRestaurantId: (id: string | null) => void
  
  // Reservations
  reservations: Reservation[]
  addReservation: (reservation: Reservation) => void
  updateReservationStatus: (id: string, status: Reservation['status']) => void
  
  // Orders
  orders: Order[]
  addOrder: (order: Order) => void
  updateOrderStatus: (id: string, status: Order['status']) => void
}

const demoUsers: Record<UserRole, User> = {
  guest: { id: '0', name: 'Guest', email: '', role: 'guest' },
  client: { id: '1', name: 'Laura Martinez', email: 'laura@example.com', role: 'client' },
  admin: { id: '2', name: 'Marco Rossi', email: 'marco@restaurant.com', role: 'admin' },
  driver: { id: '3', name: 'Alex Driver', email: 'alex@delivery.com', role: 'driver' },
}

export const useAppStore = create<AppState>((set, get) => ({
  // Auth
  user: null,
  isLoggedIn: false,
  login: (role) => set({ user: demoUsers[role], isLoggedIn: role !== 'guest' }),
  logout: () => set({ user: null, isLoggedIn: false }),
  
  // Cart
  cart: [],
  addToCart: (item) =>
    set((state) => {
      const existingItem = state.cart.find((i) => i.id === item.id)
      if (existingItem) {
        return {
          cart: state.cart.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
        }
      }
      return { cart: [...state.cart, item] }
    }),
  removeFromCart: (itemId) =>
    set((state) => ({
      cart: state.cart.filter((i) => i.id !== itemId),
    })),
  updateCartItemQuantity: (itemId, quantity) =>
    set((state) => ({
      cart:
        quantity <= 0
          ? state.cart.filter((i) => i.id !== itemId)
          : state.cart.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
    })),
  updateCartItemNotes: (itemId, notes) =>
    set((state) => ({
      cart: state.cart.map((i) => (i.id === itemId ? { ...i, notes } : i)),
    })),
  clearCart: () => set({ cart: [] }),
  getCartTotal: () => {
    const state = get()
    return state.cart.reduce((total, item) => total + item.price * item.quantity, 0)
  },
  
  // Order Mode
  orderMode: null,
  tableNumber: null,
  setOrderMode: (mode) => set({ orderMode: mode }),
  setTableNumber: (table) => set({ tableNumber: table }),
  
  // Current Restaurant
  currentRestaurantId: null,
  setCurrentRestaurantId: (id) => set({ currentRestaurantId: id }),
  
  // Reservations
  reservations: [],
  addReservation: (reservation) =>
    set((state) => ({
      reservations: [...state.reservations, reservation],
    })),
  updateReservationStatus: (id, status) =>
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? { ...r, status } : r
      ),
    })),
  
  // Orders
  orders: [],
  addOrder: (order) =>
    set((state) => ({
      orders: [...state.orders, order],
    })),
  updateOrderStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    })),
}))
