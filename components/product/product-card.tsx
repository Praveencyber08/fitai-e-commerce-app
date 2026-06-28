"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, Sparkles } from "lucide-react"
import type { Product } from "@/lib/types"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { Rating } from "@/components/ui/rating"
import { Badge } from "@/components/ui/badge"
import { formatINR } from "@/lib/format"
import { cn } from "@/lib/utils"

export function ProductCard({ product }: { product: Product }) {
  const { toggleWishlist, isWishlisted, hydrated } = useStore()
  const { toast } = useToast()
  const wished = hydrated && isWishlisted(product.id)

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
      <Link href={`/products/${product.id}`} className="relative block aspect-[3/4] overflow-hidden bg-muted">
        <Image
          src={product.image_url || product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={false}
          unoptimized={true}
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isNew && <Badge>New</Badge>}
          {product.isTrending && <Badge variant="accent">Trending</Badge>}
          {!product.inStock && <Badge variant="muted">Out of stock</Badge>}
        </div>
      </Link>

      <button
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        onClick={() => {
          toggleWishlist(product)
          toast(wished ? "Removed from wishlist" : "Added to wishlist")
        }}
        className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
      >
        <Heart className={cn("size-4", wished && "fill-primary text-primary")} />
      </button>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-xs font-semibold text-muted-foreground capitalize">{product.category}</p>
        <Link href={`/products/${product.id}`} className="mt-0.5">
          <h3 className="line-clamp-1 text-sm font-medium text-foreground">{product.name}</h3>
        </Link>
        <div className="mt-1.5">
          <Rating value={product.rating || 0} count={product.ratingCount || 0} />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-bold">{formatINR(product.price)}</span>
          <span className="text-xs font-semibold text-green-500">In Stock</span>
        </div>
        <Link
          href={`/try-on?product=${product.id}`}
          className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-md border border-border py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Sparkles className="size-3.5" /> Try it on
        </Link>
      </div>
    </div>
  )
}
