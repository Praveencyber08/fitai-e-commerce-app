import type { Product, Order, OrderStatus, Category } from "@/lib/types"

const splitList = (v: string | null | undefined): string[] =>
  v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []

const num = (v: unknown): number => (typeof v === "string" ? Number.parseFloat(v) : (v as number)) || 0

export interface ProductRow {
  id: string
  name: string
  brand: string
  description: string | null
  category: string
  sub_category: string | null
  price: string | number
  mrp: string | number
  discount_percent: number
  rating: string | number
  rating_count: number
  image: string
  images: string | null
  sizes: string | null
  colors: string | null
  tags: string | null
  stock: number
  in_stock: boolean
  is_trending: boolean
  is_new: boolean
}

export function mapProduct(r: ProductRow): Product {
  const images = splitList(r.images)
  return {
    id: r.id,
    name: r.name,
    brand: r.brand,
    description: r.description ?? "",
    price: num(r.price),
    mrp: num(r.mrp),
    discountPercent: r.discount_percent ?? 0,
    rating: num(r.rating),
    ratingCount: r.rating_count ?? 0,
    category: r.category as Category,
    subCategory: r.sub_category ?? "",
    image: r.image,
    images: images.length ? images : [r.image],
    sizes: splitList(r.sizes),
    colors: splitList(r.colors),
    tags: splitList(r.tags),
    inStock: r.in_stock,
    stock: r.stock,
    isNew: r.is_new,
    isTrending: r.is_trending,
  }
}

export interface OrderRow {
  id: string
  user_id: string
  status: string
  subtotal: string | number
  shipping: string | number
  total: string | number
  payment_method: string
  address_name: string | null
  address_line: string | null
  address_city: string | null
  address_state: string | null
  address_pincode: string | null
  address_phone: string | null
  created_at: string
}

export interface OrderItemRow {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_image: string | null
  size: string | null
  quantity: number
  price: string | number
}

export function mapOrder(r: OrderRow, items: OrderItemRow[]): Order {
  const placedAt = typeof r.created_at === "string" ? r.created_at : new Date(r.created_at).toISOString()
  const estimated = new Date(new Date(placedAt).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString()
  return {
    id: r.id,
    items: items.map((i) => ({
      productId: i.product_id,
      name: i.product_name,
      brand: "",
      image: i.product_image ?? "",
      price: num(i.price),
      size: i.size ?? "",
      quantity: i.quantity,
    })),
    total: num(r.total),
    status: (r.status as OrderStatus) ?? "processing",
    placedAt,
    estimatedDelivery: estimated,
    address: {
      fullName: r.address_name ?? "",
      phone: r.address_phone ?? "",
      line1: r.address_line ?? "",
      city: r.address_city ?? "",
      state: r.address_state ?? "",
      pincode: r.address_pincode ?? "",
    },
    paymentMethod: r.payment_method,
  }
}

export { splitList, num }
