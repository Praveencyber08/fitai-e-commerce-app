import type { Order, OrderStatus, User } from "@/lib/types"
import { PRODUCTS } from "@/lib/data/products"

const STATUSES: OrderStatus[] = ["processing", "shipped", "out_for_delivery", "delivered", "cancelled"]

const NAMES = [
  "Aarav Sharma",
  "Diya Patel",
  "Vivaan Reddy",
  "Ananya Iyer",
  "Kabir Singh",
  "Ishita Nair",
  "Reyansh Gupta",
  "Saanvi Rao",
  "Arjun Mehta",
  "Myra Kapoor",
  "Aditya Joshi",
  "Kiara Bose",
]

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function daysFromNow(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

export const ADMIN_ORDERS: Order[] = Array.from({ length: 24 }).map((_, i) => {
  const itemCount = (i % 3) + 1
  const items = Array.from({ length: itemCount }).map((__, j) => {
    const product = PRODUCTS[(i * 3 + j) % PRODUCTS.length]
    return {
      productId: product.id,
      name: product.name,
      brand: product.brand,
      image: product.image,
      price: product.price,
      size: product.sizes[0],
      quantity: (j % 2) + 1,
    }
  })
  const total = items.reduce((s, it) => s + it.price * it.quantity, 0)
  return {
    id: `FAI${(10472 + i).toString()}`,
    items,
    total,
    status: STATUSES[i % STATUSES.length],
    placedAt: daysAgo(i),
    estimatedDelivery: daysFromNow(7 - (i % 7)),
    paymentMethod: i % 2 === 0 ? "UPI" : "Card",
    address: {
      fullName: NAMES[i % NAMES.length],
      phone: "98765 4321" + (i % 10),
      line1: `${12 + i} Residency Road`,
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "5600" + (10 + (i % 80)),
    },
  }
})

export const ADMIN_CUSTOMERS: (User & { orders: number; spend: number })[] = NAMES.map((name, i) => ({
  id: `c-${i + 1}`,
  name,
  email: name.toLowerCase().replace(/\s+/g, ".") + "@example.com",
  role: "customer",
  joinedAt: daysAgo(i * 11 + 5),
  orders: (i % 6) + 1,
  spend: 1499 * ((i % 6) + 1) + i * 220,
}))

export const SALES_BY_MONTH = [
  { month: "Jan", revenue: 142000, orders: 320 },
  { month: "Feb", revenue: 168000, orders: 372 },
  { month: "Mar", revenue: 151000, orders: 341 },
  { month: "Apr", revenue: 189000, orders: 410 },
  { month: "May", revenue: 224000, orders: 488 },
  { month: "Jun", revenue: 198000, orders: 432 },
  { month: "Jul", revenue: 246000, orders: 521 },
  { month: "Aug", revenue: 268000, orders: 564 },
]

export const CATEGORY_SPLIT = [
  { category: "Men", value: 38 },
  { category: "Women", value: 31 },
  { category: "Footwear", value: 14 },
  { category: "Ethnic", value: 9 },
  { category: "Accessories", value: 8 },
]
