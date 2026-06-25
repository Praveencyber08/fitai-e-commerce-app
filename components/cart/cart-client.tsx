"use client"

import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/format"

export function CartClient() {
  const { cart, updateQuantity, removeFromCart, cartTotal, hydrated } = useStore()

  if (hydrated && cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Your bag is empty</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Looks like you haven&apos;t added anything yet. Start exploring our latest styles.
        </p>
        <Button asChild>
          <Link href="/products">Start shopping</Link>
        </Button>
      </div>
    )
  }

  const shipping = cartTotal > 999 || cartTotal === 0 ? 0 : 99
  const tax = Math.round(cartTotal * 0.05)
  const grandTotal = cartTotal + shipping + tax

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Shopping Bag <span className="text-base font-normal text-muted-foreground">({cart.length})</span>
        </h1>
        <ul className="divide-y rounded-lg border">
          {cart.map((item) => (
            <li key={`${item.product.id}-${item.size}`} className="flex gap-4 p-4">
              <Link
                href={`/products/${item.product.id}`}
                className="relative h-28 w-24 shrink-0 overflow-hidden rounded-md bg-muted"
              >
                <Image
                  src={item.product.image || "/placeholder.svg"}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{item.product.brand}</p>
                    <Link href={`/products/${item.product.id}`} className="font-medium hover:text-primary">
                      {item.product.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">Size: {item.size}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id, item.size)}
                    className="h-fit text-muted-foreground transition-colors hover:text-destructive"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-md border">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit space-y-4 rounded-lg border bg-card p-5 lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold">Order Summary</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPrice(cartTotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tax (5%)</dt>
            <dd>{formatPrice(tax)}</dd>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(grandTotal)}</dd>
          </div>
        </dl>
        <Button asChild size="lg" className="w-full">
          <Link href="/checkout">
            Checkout <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          {cartTotal > 999 ? "You unlocked free shipping!" : "Free shipping on orders over ₹999"}
        </p>
      </aside>
    </div>
  )
}
