import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, OrderMode, Reservation, Order } from './types'

export type UserRole = 'guest' | 'client' | 'admin' | 'driver' | 'superadmin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  restaurantId?: string | null
  restaurantSlug?: string | null
}

export interface RestaurantImage {
  src: string
  scale: number    // 1.0 – 3.0
  x: number        // pan x, percent of container width
  y: number        // pan y, percent of container height
  rotation: number // degrees, -45 to 45 (or ±90 snaps)
  flipH: boolean
  flipV: boolean
}

export interface RestaurantProfileState {
  name: string
  description: string
  address: string
  phone: string
  hours: string
  tags: string[]
  bannerImages: (RestaurantImage | null)[]
  profileImage: RestaurantImage | null
}

const defaultRestaurantProfile: RestaurantProfileState = {
  name: '',
  description: '',
  address: '',
  phone: '',
  hours: '',
  tags: [],
  bannerImages: [null, null, null] as (RestaurantImage | null)[],
  profileImage: null as RestaurantImage | null,
}

export interface DemoCredential {
  password: string
  user: User
}

interface AppState {
  // Auth
  user: User | null
  isLoggedIn: boolean
  token: string | null
  login: (role: UserRole) => void
  loginWithToken: (token: string, user: User) => void
  logout: () => void
  // Demo accounts created when backend is offline
  demoCredentials: Record<string, DemoCredential>
  addDemoCredential: (email: string, cred: DemoCredential) => void
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

  // Restaurant Profile (admin editable)
  restaurantProfile: RestaurantProfileState
  updateRestaurantProfile: (patch: Partial<RestaurantProfileState>) => void
  setBannerImage: (index: number, img: RestaurantImage | null) => void
  setProfileImage: (img: RestaurantImage | null) => void
}

const demoUsers: Record<Exclude<UserRole, 'superadmin'>, User> = {
  guest: { id: '0', name: 'Guest', email: '', role: 'guest' },
  client: { id: '1', name: 'Laura Martinez', email: 'laura@example.com', role: 'client' },
  admin: { id: '2', name: 'Marco Rossi', email: 'marco@restaurant-matera.de', role: 'admin' },
  driver: { id: '3', name: 'Alex Driver', email: 'alex@delivery.com', role: 'driver' },
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  // Auth
  user: null,
  isLoggedIn: false,
  token: null,
  login: (role) => set({ user: role === 'superadmin' ? null : demoUsers[role as Exclude<UserRole, 'superadmin'>], isLoggedIn: role !== 'guest', token: null }),
  loginWithToken: (token, user) => set({ token, user, isLoggedIn: true }),
  logout: () => set({ user: null, isLoggedIn: false, token: null }),
  demoCredentials: {},
  addDemoCredential: (email, cred) => set(state => ({ demoCredentials: { ...state.demoCredentials, [email.toLowerCase()]: cred } })),
  
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

  // Restaurant Profile
  restaurantProfile: defaultRestaurantProfile,
  updateRestaurantProfile: (patch) =>
    set((state) => ({
      restaurantProfile: { ...state.restaurantProfile, ...patch },
    })),
  setBannerImage: (index, img) =>
    set((state) => {
      const bannerImages = [...state.restaurantProfile.bannerImages]
      bannerImages[index] = img
      return { restaurantProfile: { ...state.restaurantProfile, bannerImages } }
    }),
  setProfileImage: (img) =>
    set((state) => ({
      restaurantProfile: { ...state.restaurantProfile, profileImage: img },
    })),
    }),
    {
      name: 'discoverdish-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
)
