"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { ProductGrid } from "@/components/product/product-grid"
import { Button } from "@/components/ui/button"

export function WishlistClient() {
  const { wishlist } = useStore()

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Heart className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Your wishlist is empty</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Save the styles you love and find them all here whenever you&apos;re ready to shop.
        </p>
        <Button asChild>
          <Link href="/products">Explore products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Wishlist</h1>
        <p className="text-sm text-muted-foreground">
          {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
        </p>
      </div>
      <ProductGrid products={wishlist} />
    </div>
  )
}
