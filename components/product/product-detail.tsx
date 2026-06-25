"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, ShoppingBag, Sparkles, Truck, RotateCcw, ShieldCheck, Check } from "lucide-react"
import type { Product } from "@/lib/types"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { Rating } from "@/components/ui/rating"
import { Badge } from "@/components/ui/badge"
import { ProductGrid } from "@/components/product/product-grid"
import { formatINR } from "@/lib/format"
import { cn } from "@/lib/utils"

export function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const router = useRouter()
  const { addToCart, toggleWishlist, isWishlisted, hydrated } = useStore()
  const { toast } = useToast()
  const [activeImg, setActiveImg] = useState(0)
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null)
  const [sizeError, setSizeError] = useState(false)
  const wished = hydrated && isWishlisted(product.id)

  function requireSize(): boolean {
    if (!size) {
      setSizeError(true)
      toast("Please select a size", "info")
      return false
    }
    return true
  }

  function handleAdd() {
    if (!requireSize()) return
    addToCart(product, size!)
    toast("Added to bag")
  }

  function handleBuy() {
    if (!requireSize()) return
    addToCart(product, size!)
    router.push("/cart")
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="mb-4 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link> /{" "}
        <Link href={`/products?category=${product.category}`} className="capitalize hover:text-foreground">
          {product.category}
        </Link>{" "}
        / <span className="text-foreground">{product.subCategory}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex gap-3 sm:flex-col">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={cn(
                  "relative aspect-square w-16 overflow-hidden rounded-md border-2 bg-muted",
                  activeImg === i ? "border-primary" : "border-border",
                )}
              >
                <Image src={img || "/placeholder.svg"} alt={`${product.name} view ${i + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
          <div className="relative aspect-[3/4] flex-1 overflow-hidden rounded-lg border border-border bg-muted">
            <Image
              src={product.images[activeImg] || "/placeholder.svg"}
              alt={product.name}
              fill
              priority
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-sm font-semibold text-muted-foreground">{product.brand}</p>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight">{product.name}</h1>
          <div className="mt-2">
            <Rating value={product.rating} count={product.ratingCount} size="md" />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold">{formatINR(product.price)}</span>
            <span className="text-base text-muted-foreground line-through">{formatINR(product.mrp)}</span>
            <span className="text-base font-semibold text-primary">{product.discountPercent}% OFF</span>
          </div>
          <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">Inclusive of all taxes</p>

          {product.isNew && <Badge className="mt-3">New arrival</Badge>}

          {/* Size */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Select size</span>
              {sizeError && <span className="text-xs font-medium text-destructive">Please select a size</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSize(s)
                    setSizeError(false)
                  }}
                  className={cn(
                    "flex h-11 min-w-11 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors",
                    size === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-foreground/40",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <ShoppingBag className="size-4" /> {product.inStock ? "Add to Bag" : "Out of stock"}
            </button>
            <button
              onClick={() => {
                toggleWishlist(product)
                toast(wished ? "Removed from wishlist" : "Added to wishlist")
              }}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border px-5 text-sm font-semibold transition-colors hover:bg-muted"
            >
              <Heart className={cn("size-4", wished && "fill-primary text-primary")} />
              Wishlist
            </button>
          </div>

          <div className="mt-3 flex gap-3">
            <button
              onClick={handleBuy}
              disabled={!product.inStock}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-md border border-border text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-50"
            >
              Buy Now
            </button>
            <Link
              href={`/try-on?product=${product.id}`}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-accent text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              <Sparkles className="size-4" /> Try it on
            </Link>
          </div>

          {/* Perks */}
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-6">
            <Perk icon={<Truck className="size-5" />} label="Free delivery" />
            <Perk icon={<RotateCcw className="size-5" />} label="7-day returns" />
            <Perk icon={<ShieldCheck className="size-5" />} label="Secure payment" />
          </div>

          {/* Description */}
          <div className="mt-6 border-t border-border pt-6">
            <h2 className="text-sm font-semibold">Product details</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Premium quality fabric</li>
              <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Available colors: {product.colors.join(", ")}</li>
              <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Category: {product.subCategory}</li>
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 font-heading text-xl font-bold tracking-tight">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  )
}

function Perk({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <span className="text-primary">{icon}</span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}
