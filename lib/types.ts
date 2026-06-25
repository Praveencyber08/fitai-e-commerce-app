export type Category = "men" | "women" | "kids" | "footwear" | "accessories" | "ethnic"

export interface Product {
  id: string
  name: string
  brand: string
  description: string
  price: number
  mrp: number
  discountPercent: number
  rating: number
  ratingCount: number
  category: Category
  subCategory: string
  image: string
  images: string[]
  sizes: string[]
  colors: string[]
  tags: string[]
  inStock: boolean
  stock: number
  isNew?: boolean
  isTrending?: boolean
}

export interface CartItem {
  product: Product
  size: string
  quantity: number
}

export interface WishlistItem {
  product: Product
}

export type OrderStatus = "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled"

export interface OrderItem {
  productId: string
  name: string
  brand: string
  image: string
  price: number
  size: string
  quantity: number
}

export interface Order {
  id: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  placedAt: string
  estimatedDelivery: string
  address: Address
  paymentMethod: string
}

export interface Address {
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
}

export interface User {
  id: string
  name: string
  email: string
  role: "customer" | "admin"
  joinedAt: string
  avatar?: string
}

export interface TryOnResult {
  id: string
  productId: string
  productName: string
  resultImage: string
  createdAt: string
}
