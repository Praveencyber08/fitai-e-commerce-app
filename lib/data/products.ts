import type { Product, Category } from "@/lib/types"

const IMAGES = {
  tshirt: "/products/tshirt-white.png",
  dress: "/products/floral-dress.png",
  denim: "/products/denim-jacket.png",
  sneakers: "/products/sneakers.png",
  hoodie: "/products/hoodie-black.png",
  chino: "/products/chino-pants.png",
  saree: "/products/saree-silk.png",
  handbag: "/products/handbag.png",
}

function discount(mrp: number, price: number) {
  return Math.round(((mrp - price) / mrp) * 100)
}

interface Seed {
  name: string
  brand: string
  price: number
  mrp: number
  category: Category
  subCategory: string
  image: string
  sizes: string[]
  colors: string[]
  rating: number
  ratingCount: number
  tags: string[]
  isNew?: boolean
  isTrending?: boolean
}

const SEEDS: Seed[] = [
  {
    name: "Essential Cotton Crew T-Shirt",
    brand: "Urban Thread",
    price: 599,
    mrp: 1299,
    category: "men",
    subCategory: "T-Shirts",
    image: IMAGES.tshirt,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Black", "Navy"],
    rating: 4.3,
    ratingCount: 2840,
    tags: ["casual", "cotton", "basics"],
    isTrending: true,
  },
  {
    name: "Blossom Floral Midi Dress",
    brand: "Aria Studio",
    price: 1799,
    mrp: 3499,
    category: "women",
    subCategory: "Dresses",
    image: IMAGES.dress,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Pink", "Blue"],
    rating: 4.6,
    ratingCount: 1520,
    tags: ["floral", "summer", "party"],
    isNew: true,
    isTrending: true,
  },
  {
    name: "Classic Denim Trucker Jacket",
    brand: "Indigo Co.",
    price: 2299,
    mrp: 4499,
    category: "men",
    subCategory: "Jackets",
    image: IMAGES.denim,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blue", "Light Blue"],
    rating: 4.4,
    ratingCount: 980,
    tags: ["denim", "winter", "layering"],
  },
  {
    name: "Cloud Runner Sneakers",
    brand: "Stride",
    price: 2999,
    mrp: 5999,
    category: "footwear",
    subCategory: "Sneakers",
    image: IMAGES.sneakers,
    sizes: ["6", "7", "8", "9", "10", "11"],
    colors: ["White", "Grey"],
    rating: 4.5,
    ratingCount: 3210,
    tags: ["sports", "running", "everyday"],
    isTrending: true,
  },
  {
    name: "Oversized Fleece Hoodie",
    brand: "Urban Thread",
    price: 1499,
    mrp: 2999,
    category: "men",
    subCategory: "Sweatshirts",
    image: IMAGES.hoodie,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Grey", "Olive"],
    rating: 4.2,
    ratingCount: 1740,
    tags: ["winter", "streetwear", "cozy"],
    isNew: true,
  },
  {
    name: "Slim Fit Stretch Chinos",
    brand: "Norse",
    price: 1299,
    mrp: 2599,
    category: "men",
    subCategory: "Trousers",
    image: IMAGES.chino,
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Beige", "Navy", "Olive"],
    rating: 4.1,
    ratingCount: 860,
    tags: ["formal", "smart-casual"],
  },
  {
    name: "Banarasi Silk Saree",
    brand: "Riti Ethnics",
    price: 3499,
    mrp: 7999,
    category: "ethnic",
    subCategory: "Sarees",
    image: IMAGES.saree,
    sizes: ["Free"],
    colors: ["Red", "Maroon", "Gold"],
    rating: 4.7,
    ratingCount: 640,
    tags: ["festive", "wedding", "traditional"],
    isTrending: true,
  },
  {
    name: "Structured Leather Tote Bag",
    brand: "Maison Lux",
    price: 2799,
    mrp: 5499,
    category: "accessories",
    subCategory: "Bags",
    image: IMAGES.handbag,
    sizes: ["Free"],
    colors: ["Tan", "Black"],
    rating: 4.5,
    ratingCount: 410,
    tags: ["leather", "office", "everyday"],
    isNew: true,
  },
]

// Expand the catalog by generating variants so listing/filtering feel real.
const VARIANT_LABELS = ["", "Premium", "Limited Edition", "Everyday", "Signature", "Pro"]

export const PRODUCTS: Product[] = SEEDS.flatMap((seed, sIdx) =>
  VARIANT_LABELS.map((label, vIdx) => {
    const priceOffset = vIdx * 150
    const price = seed.price + priceOffset
    const mrp = seed.mrp + priceOffset * 2
    const id = `p-${sIdx + 1}-${vIdx + 1}`
    const name = label ? `${seed.name} ${label}` : seed.name
    return {
      id,
      name,
      brand: seed.brand,
      description: `${name} by ${seed.brand}. Crafted with premium materials for an effortless, modern look. ${seed.subCategory} designed for comfort and durability, perfect for everyday wear and special occasions alike.`,
      price,
      mrp,
      discountPercent: discount(mrp, price),
      rating: Math.min(5, +(seed.rating + (vIdx % 3) * 0.1).toFixed(1)),
      ratingCount: seed.ratingCount - vIdx * 37,
      category: seed.category,
      subCategory: seed.subCategory,
      image: seed.image,
      images: [seed.image, seed.image, seed.image],
      sizes: seed.sizes,
      colors: seed.colors,
      tags: seed.tags,
      inStock: vIdx !== 5,
      stock: vIdx === 5 ? 0 : 12 + vIdx * 7,
      isNew: vIdx === 0 ? seed.isNew : vIdx === 2,
      isTrending: vIdx === 0 ? seed.isTrending : false,
    }
  }),
)

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}

export function getRelated(product: Product, count = 4): Product[] {
  return PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, count)
}

export const CATEGORIES: { id: Category; label: string; image: string }[] = [
  { id: "men", label: "Men", image: "/category-men.png" },
  { id: "women", label: "Women", image: "/category-women.png" },
  { id: "footwear", label: "Footwear", image: "/products/sneakers.png" },
  { id: "ethnic", label: "Ethnic", image: "/products/saree-silk.png" },
  { id: "accessories", label: "Accessories", image: "/products/handbag.png" },
  { id: "kids", label: "Kids", image: "/products/tshirt-white.png" },
]
