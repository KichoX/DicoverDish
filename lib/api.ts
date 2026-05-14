import type { Restaurant, MenuItem } from './types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

async function get<T>(path: string, token?: string | null): Promise<T> {
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { cache: 'no-store', headers })
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`)
  return res.json()
}

async function put<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(msg || `PUT ${path} → ${res.status}`)
  }
  return res.json()
}

async function post<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(msg || `POST ${path} → ${res.status}`)
  }
  return res.json()
}

async function del(path: string, token?: string | null): Promise<void> {
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE', headers })
  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(msg || `DELETE ${path} → ${res.status}`)
  }
}

async function patch<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(msg || `PATCH ${path} → ${res.status}`)
  }
  return res.json()
}

// ── Mappers (API shape → frontend shape) ────────────────────────────
function mapRestaurant(r: Record<string, unknown>): Restaurant {
  return {
    id:          r.id as string,
    name:        r.name as string,
    image:       r.imageUrl as string,
    rating:      r.rating as number,
    cuisines:    r.cuisines as string[],
    tags:        r.tags as string[],
    isOpen:      r.isOpen as boolean,
    hours:       r.hours as string,
    address:     r.address as string,
    description: r.description as string | undefined,
    phone:       r.phone as string | undefined,
    website:     r.website as string | undefined,
    instagram:   r.instagram as string | undefined,
  }
}

function mapMenuItem(m: Record<string, unknown>): MenuItem {
  return {
    id:           m.id as string,
    restaurantId: m.restaurantId as string,
    name:         m.name as string,
    description:  m.description as string,
    price:        m.price as number,
    image:        m.imageUrl as string | undefined,
    category:     m.category as string,
    isAvailable:  m.isAvailable as boolean,
  }
}

// ── Public API ───────────────────────────────────────────────────────
export const api = {
  /** List all restaurants. Optional filters forwarded to backend. */
  getRestaurants: async (params?: { cuisine?: string; search?: string; isOpen?: boolean }): Promise<Restaurant[]> => {
    const q = new URLSearchParams()
    if (params?.cuisine)             q.set('cuisine', params.cuisine)
    if (params?.search)              q.set('search',  params.search)
    if (params?.isOpen !== undefined) q.set('isOpen', String(params.isOpen))
    const qs = q.toString()
    const data = await get<Record<string, unknown>[]>(`/api/restaurants${qs ? `?${qs}` : ''}`)
    return data.map(mapRestaurant)
  },

  /** Get a single restaurant by slug. */
  getRestaurantBySlug: async (slug: string): Promise<Restaurant> => {
    const data = await get<Record<string, unknown>>(`/api/restaurants/${slug}`)
    return mapRestaurant(data)
  },

  /** Get all menu items for a restaurant (by restaurant GUID). */
  getMenu: async (restaurantId: string): Promise<MenuItem[]> => {
    const data = await get<Record<string, unknown>[]>(`/api/restaurants/${restaurantId}/menu`)
    return data.map(mapMenuItem)
  },

  /** Create a reservation. Returns the saved reservation. */
  createReservation: async (body: {
    restaurantId: string
    guestName: string
    guestPhone: string
    guestEmail?: string
    date: string
    time: string
    guests: number
    occasion?: string
    specialRequests?: string
  }) => post<{ id: string; status: string }>('/api/reservations', body),

  /** Get the admin's own restaurant from JWT claim. */
  getMyRestaurant: (token: string) =>
    get<Record<string, unknown>>('/api/restaurants/me', token).then(mapRestaurant),

  /** Update the admin's own restaurant. */
  updateMyRestaurant: (token: string, body: {
    name?: string; description?: string; address?: string; phone?: string
    hours?: string; tags?: string[]; website?: string; instagram?: string
  }) => put<Record<string, unknown>>('/api/restaurants/me', body, token).then(mapRestaurant),

  /** Create an order. Returns the saved order with totals. */
  createOrder: async (body: {
    restaurantId: string
    type: string
    tableNumber?: string
    deliveryAddress?: string
    guestName: string
    guestPhone: string
    orderNotes?: string
    items: { menuItemId: string; quantity: number; notes?: string }[]
  }) => post<{ id: string; total: number; status: string }>('/api/orders', body),

  /** Admin: get menu items (authenticated). */
  getMenuAdmin: (restaurantId: string, token: string) =>
    get<Record<string, unknown>[]>(`/api/restaurants/${restaurantId}/menu`, token).then(d => d.map(mapMenuItem)),

  /** Admin: add a menu item. */
  addMenuItem: (restaurantId: string, body: {
    name: string; description: string; price: number; imageUrl?: string
    category: string; isAvailable: boolean; sortOrder: number
  }, token: string) =>
    post<Record<string, unknown>>(`/api/restaurants/${restaurantId}/menu`, body, token).then(mapMenuItem),

  /** Admin: update a menu item. */
  updateMenuItem: (restaurantId: string, itemId: string, body: {
    name?: string; description?: string; price?: number; imageUrl?: string
    category?: string; isAvailable?: boolean; sortOrder?: number
  }, token: string) =>
    put<Record<string, unknown>>(`/api/restaurants/${restaurantId}/menu/${itemId}`, body, token).then(mapMenuItem),

  /** Admin: delete a menu item. */
  deleteMenuItem: (restaurantId: string, itemId: string, token: string) =>
    del(`/api/restaurants/${restaurantId}/menu/${itemId}`, token),
}

// ── Auth API ─────────────────────────────────────────────────────────
export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  restaurantId: string | null
  restaurantSlug: string | null
}

export const authApi = {
  login: (email: string, password: string) =>
    post<{ accessToken: string; user: AuthUser }>('/api/auth/login', { email, password }),

  getMe: (token: string) =>
    get<AuthUser>('/api/auth/me', token),

  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    post<void>('/api/auth/change-password', { currentPassword, newPassword }, token),
}

// ── Super Admin API ───────────────────────────────────────────────────
export interface DailyStat { date: string; count: number; revenue: number }
export interface RestaurantStat { id: string; name: string; orders: number; revenue: number }
export interface PlatformStats {
  totalUsers: number
  totalRestaurants: number
  totalOrders: number
  totalReservations: number
  totalRevenue: number
  ordersLast14Days: DailyStat[]
  topRestaurants: RestaurantStat[]
}

export interface RestaurantAccount {
  userId: string
  adminName: string
  email: string
  restaurantId: string
  restaurantName: string
  restaurantSlug: string
  createdAt: string
  totalOrders: number
  totalRevenue: number
  imageUrl: string | null
  address: string | null
  phone: string | null
  isOpen: boolean
}

export const superAdminApi = {
  getStats: (token: string) =>
    get<PlatformStats>('/api/super-admin/stats', token),

  getAccounts: (token: string) =>
    get<RestaurantAccount[]>('/api/super-admin/accounts', token),

  createAccount: (token: string, body: {
    restaurantName: string
    adminName: string
    email: string
    password: string
    imageUrl?: string
    address?: string
    phone?: string
  }) => post<RestaurantAccount>('/api/super-admin/accounts', body, token),

  getUsers: (token: string) =>
    get<AuthUser[]>('/api/super-admin/users', token),
}

// ── Upload API ────────────────────────────────────────────────────────
export const uploadApi = {
  uploadImage: async (file: File, token: string): Promise<{ url: string }> => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${BASE}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
    if (!res.ok) {
      const msg = await res.text().catch(() => '')
      throw new Error(msg || `Upload failed: ${res.status}`)
    }
    return res.json()
  },
}

// ── Admin order / reservation types + API ────────────────────────────
export interface OrderItemDto {
  id: string
  menuItemId: string
  menuItemName: string
  unitPrice: number
  quantity: number
  notes?: string | null
}

export interface OrderDto {
  id: string
  restaurantId: string
  restaurantName: string
  userId?: string | null
  type: string
  tableNumber?: string | null
  deliveryAddress?: string | null
  guestName: string
  guestPhone: string
  orderNotes?: string | null
  subtotal: number
  deliveryFee: number
  total: number
  status: string
  items: OrderItemDto[]
  createdAt: string
}

export interface ReservationDto {
  id: string
  restaurantId: string
  restaurantName: string
  userId?: string | null
  tableId?: string | null
  guestName: string
  guestPhone: string
  guestEmail?: string | null
  date: string
  time: string
  guests: number
  occasion?: string | null
  specialRequests?: string | null
  status: string
  createdAt: string
}

export const adminApi = {
  getOrders: (restaurantId: string, token: string) =>
    get<OrderDto[]>(`/api/orders/restaurant/${restaurantId}`, token),

  updateOrderStatus: (orderId: string, status: string, token: string) =>
    patch<OrderDto>(`/api/orders/${orderId}/status`, { status }, token),

  getReservations: (restaurantId: string, token: string) =>
    get<ReservationDto[]>(`/api/reservations/restaurant/${restaurantId}`, token),

  updateReservationStatus: (reservationId: string, status: string, token: string) =>
    patch<ReservationDto>(`/api/reservations/${reservationId}/status`, { status }, token),
}
