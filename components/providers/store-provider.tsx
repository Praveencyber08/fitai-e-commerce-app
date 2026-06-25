"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import type { CartItem, Product, Order, User, Address, TryOnResult } from "@/lib/types"

interface StoreState {
  cart: CartItem[]
  wishlist: Product[]
  orders: Order[]
  tryOnHistory: TryOnResult[]
  user: User | null
  hydrated: boolean
  // cart
  addToCart: (product: Product, size: string, quantity?: number) => void
  removeFromCart: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
  // wishlist
  toggleWishlist: (product: Product) => void
  isWishlisted: (productId: string) => boolean
  // orders
  placeOrder: (address: Address, paymentMethod: string) => Order
  // try-on
  addTryOn: (result: TryOnResult) => void
  // auth
  login: (email: string, name?: string, role?: "customer" | "admin") => User
  logout: () => void
}

const StoreContext = createContext<StoreState | null>(null)

const LS_KEY = "fitai-store-v1"

interface Persisted {
  cart: CartItem[]
  wishlist: Product[]
  orders: Order[]
  tryOnHistory: TryOnResult[]
  user: User | null
}

function daysFromNow(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [tryOnHistory, setTryOnHistory] = useState<TryOnResult[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const data = JSON.parse(raw) as Persisted
        setCart(data.cart ?? [])
        setWishlist(data.wishlist ?? [])
        setOrders(data.orders ?? [])
        setTryOnHistory(data.tryOnHistory ?? [])
        setUser(data.user ?? null)
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const data: Persisted = { cart, wishlist, orders, tryOnHistory, user }
    localStorage.setItem(LS_KEY, JSON.stringify(data))
  }, [cart, wishlist, orders, tryOnHistory, user, hydrated])

  const addToCart = useCallback((product: Product, size: string, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.size === size)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.size === size ? { ...i, quantity: i.quantity + quantity } : i,
        )
      }
      return [...prev, { product, size, quantity }]
    })
  }, [])

  const removeFromCart = useCallback((productId: string, size: string) => {
    setCart((prev) => prev.filter((i) => !(i.product.id === productId && i.size === size)))
  }, [])

  const updateQuantity = useCallback((productId: string, size: string, quantity: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.product.id === productId && i.size === size ? { ...i, quantity } : i))
        .filter((i) => i.quantity > 0),
    )
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((prev) =>
      prev.find((p) => p.id === product.id) ? prev.filter((p) => p.id !== product.id) : [...prev, product],
    )
  }, [])

  const isWishlisted = useCallback((productId: string) => wishlist.some((p) => p.id === productId), [wishlist])

  const placeOrder = useCallback(
    (address: Address, paymentMethod: string): Order => {
      const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0)
      const order: Order = {
        id: "FAI" + Math.floor(100000 + Math.random() * 900000),
        items: cart.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          brand: i.product.brand,
          image: i.product.image,
          price: i.product.price,
          size: i.size,
          quantity: i.quantity,
        })),
        total,
        status: "processing",
        placedAt: new Date().toISOString(),
        estimatedDelivery: daysFromNow(5),
        address,
        paymentMethod,
      }
      setOrders((prev) => [order, ...prev])
      setCart([])
      return order
    },
    [cart],
  )

  const addTryOn = useCallback((result: TryOnResult) => {
    setTryOnHistory((prev) => [result, ...prev])
  }, [])

  const login = useCallback((email: string, name?: string, role: "customer" | "admin" = "customer"): User => {
    const u: User = {
      id: "u-" + email,
      name: name ?? email.split("@")[0].replace(/\./g, " "),
      email,
      role,
      joinedAt: new Date().toISOString(),
    }
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => setUser(null), [])

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0)

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        orders,
        tryOnHistory,
        user,
        hydrated,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        toggleWishlist,
        isWishlisted,
        placeOrder,
        addTryOn,
        login,
        logout,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
