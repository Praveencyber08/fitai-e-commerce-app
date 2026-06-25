"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react"
import type { CartItem, Product, Order, User, Address, TryOnResult } from "@/lib/types"

interface AuthResult {
  ok: boolean
  error?: string
  user?: User
}

interface StoreState {
  cart: CartItem[]
  wishlist: Product[]
  orders: Order[]
  tryOnHistory: TryOnResult[]
  user: User | null
  hydrated: boolean
  dbConfigured: boolean
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
  placeOrder: (address: Address, paymentMethod: string) => Promise<Order | null>
  refreshOrders: () => Promise<void>
  // try-on
  addTryOn: (result: TryOnResult) => void
  // auth
  login: (email: string, password: string) => Promise<AuthResult>
  register: (name: string, email: string, password: string) => Promise<AuthResult>
  logout: () => Promise<void>
}

const StoreContext = createContext<StoreState | null>(null)

const LS_KEY = "fitai-store-v1"

interface Persisted {
  cart: CartItem[]
  wishlist: Product[]
  orders: Order[]
  tryOnHistory: TryOnResult[]
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
  const [dbConfigured, setDbConfigured] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Server-backed mode: a real DB is connected AND a user is signed in.
  const serverMode = dbConfigured && !!user
  const serverModeRef = useRef(serverMode)
  serverModeRef.current = serverMode

  // ----- server sync helpers -----
  const syncFromServer = useCallback(async () => {
    try {
      const [cartRes, wishRes, ordersRes, tryRes] = await Promise.all([
        fetch("/api/cart"),
        fetch("/api/wishlist"),
        fetch("/api/orders"),
        fetch("/api/try-on/history"),
      ])
      const cartData = await cartRes.json()
      const wishData = await wishRes.json()
      const ordersData = await ordersRes.json()
      const tryData = await tryRes.json()
      setCart(cartData.items ?? [])
      setWishlist((wishData.items ?? []).map((i: { product: Product }) => i.product))
      setOrders(ordersData.orders ?? [])
      setTryOnHistory(tryData.items ?? [])
    } catch {
      // network issue — keep current state
    }
  }, [])

  // ----- initial hydration -----
  useEffect(() => {
    let guest: Persisted | null = null
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) guest = JSON.parse(raw) as Persisted
    } catch {
      // ignore corrupt storage
    }

    ;(async () => {
      try {
        const meRes = await fetch("/api/auth/me")
        const me = await meRes.json()
        setDbConfigured(Boolean(me.dbConfigured))
        if (me.user) {
          setUser(me.user)
          await syncFromServer()
        } else if (guest) {
          setCart(guest.cart ?? [])
          setWishlist(guest.wishlist ?? [])
          setOrders(guest.orders ?? [])
          setTryOnHistory(guest.tryOnHistory ?? [])
        }
      } catch {
        if (guest) {
          setCart(guest.cart ?? [])
          setWishlist(guest.wishlist ?? [])
          setOrders(guest.orders ?? [])
          setTryOnHistory(guest.tryOnHistory ?? [])
        }
      } finally {
        setHydrated(true)
      }
    })()
  }, [syncFromServer])

  // ----- persist guest state (only when not server-backed) -----
  useEffect(() => {
    if (!hydrated || serverMode) return
    const data: Persisted = { cart, wishlist, orders, tryOnHistory }
    localStorage.setItem(LS_KEY, JSON.stringify(data))
  }, [cart, wishlist, orders, tryOnHistory, hydrated, serverMode])

  // ----- cart -----
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
    if (serverModeRef.current) {
      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, size, quantity }),
      }).catch(() => {})
    }
  }, [])

  const removeFromCart = useCallback((productId: string, size: string) => {
    setCart((prev) => prev.filter((i) => !(i.product.id === productId && i.size === size)))
    if (serverModeRef.current) {
      fetch(`/api/cart?productId=${encodeURIComponent(productId)}&size=${encodeURIComponent(size)}`, {
        method: "DELETE",
      }).catch(() => {})
    }
  }, [])

  const updateQuantity = useCallback((productId: string, size: string, quantity: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.product.id === productId && i.size === size ? { ...i, quantity } : i))
        .filter((i) => i.quantity > 0),
    )
    if (serverModeRef.current) {
      fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, size, quantity }),
      }).catch(() => {})
    }
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    if (serverModeRef.current) {
      fetch("/api/cart", { method: "DELETE" }).catch(() => {})
    }
  }, [])

  // ----- wishlist -----
  const toggleWishlist = useCallback((product: Product) => {
    let added = false
    setWishlist((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id)
      }
      added = true
      return [...prev, product]
    })
    if (serverModeRef.current) {
      if (added) {
        fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        }).catch(() => {})
      } else {
        fetch(`/api/wishlist/${encodeURIComponent(product.id)}`, { method: "DELETE" }).catch(() => {})
      }
    }
  }, [])

  const isWishlisted = useCallback((productId: string) => wishlist.some((p) => p.id === productId), [wishlist])

  // ----- orders -----
  const refreshOrders = useCallback(async () => {
    if (!serverModeRef.current) return
    try {
      const res = await fetch("/api/orders")
      const data = await res.json()
      setOrders(data.orders ?? [])
    } catch {
      // ignore
    }
  }, [])

  const placeOrder = useCallback(
    async (address: Address, paymentMethod: string): Promise<Order | null> => {
      if (serverModeRef.current) {
        try {
          const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address, paymentMethod }),
          })
          if (!res.ok) return null
          const { orderId } = await res.json()
          setCart([])
          // Fetch the newly created order.
          const orderRes = await fetch(`/api/orders/${orderId}`)
          const orderData = await orderRes.json()
          await refreshOrders()
          return orderData.order ?? null
        } catch {
          return null
        }
      }

      // Guest fallback (no DB / not signed in): build a local order.
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
    [cart, refreshOrders],
  )

  // ----- try-on -----
  const addTryOn = useCallback((result: TryOnResult) => {
    setTryOnHistory((prev) => [result, ...prev])
    if (serverModeRef.current) {
      fetch("/api/try-on/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: result.productId,
          productName: result.productName,
          resultImage: result.resultImage,
        }),
      }).catch(() => {})
    }
  }, [])

  // ----- auth -----
  const mergeGuestCart = useCallback(async (guestCart: CartItem[]) => {
    for (const item of guestCart) {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.product.id, size: item.size, quantity: item.quantity }),
      }).catch(() => {})
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!dbConfigured) {
        // Guest fallback when no DB is connected.
        const role = email.trim().toLowerCase() === "admin@fitai.com" ? "admin" : "customer"
        const u: User = {
          id: "u-" + email,
          name: email.split("@")[0].replace(/\./g, " "),
          email,
          role,
          joinedAt: new Date().toISOString(),
        }
        setUser(u)
        return { ok: true, user: u }
      }
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) return { ok: false, error: data.error ?? "Sign in failed." }
        const guestCart = cart
        setUser(data.user)
        if (guestCart.length) await mergeGuestCart(guestCart)
        await syncFromServer()
        localStorage.removeItem(LS_KEY)
        return { ok: true, user: data.user }
      } catch {
        return { ok: false, error: "Network error. Please try again." }
      }
    },
    [dbConfigured, cart, mergeGuestCart, syncFromServer],
  )

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      if (!dbConfigured) {
        const u: User = {
          id: "u-" + email,
          name,
          email,
          role: email.trim().toLowerCase() === "admin@fitai.com" ? "admin" : "customer",
          joinedAt: new Date().toISOString(),
        }
        setUser(u)
        return { ok: true, user: u }
      }
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        })
        const data = await res.json()
        if (!res.ok) return { ok: false, error: data.error ?? "Could not create account." }
        const guestCart = cart
        setUser(data.user)
        if (guestCart.length) await mergeGuestCart(guestCart)
        await syncFromServer()
        localStorage.removeItem(LS_KEY)
        return { ok: true, user: data.user }
      } catch {
        return { ok: false, error: "Network error. Please try again." }
      }
    },
    [dbConfigured, cart, mergeGuestCart, syncFromServer],
  )

  const logout = useCallback(async () => {
    if (dbConfigured) {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    }
    setUser(null)
    setCart([])
    setWishlist([])
    setOrders([])
    setTryOnHistory([])
  }, [dbConfigured])

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
        dbConfigured,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        toggleWishlist,
        isWishlisted,
        placeOrder,
        refreshOrders,
        addTryOn,
        login,
        register,
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
