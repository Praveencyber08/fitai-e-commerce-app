"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { CreditCard, Truck, Wallet, CheckCircle2 } from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/format"
import type { Address } from "@/lib/types"
import { cn } from "@/lib/utils"

const PAYMENT_METHODS = [
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "upi", label: "UPI", icon: Wallet },
  { id: "cod", label: "Cash on Delivery", icon: Truck },
]

export function CheckoutClient() {
  const { cart, cartTotal, placeOrder, hydrated } = useStore()
  const { toast } = useToast()
  const router = useRouter()
  const [payment, setPayment] = useState("card")
  const [address, setAddress] = useState<Address>({
    fullName: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  })

  const shipping = cartTotal > 999 || cartTotal === 0 ? 0 : 99
  const tax = Math.round(cartTotal * 0.05)
  const grandTotal = cartTotal + shipping + tax

  if (hydrated && cart.length === 0) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-xl font-semibold">Nothing to check out</h2>
        <p className="mt-2 text-sm text-muted-foreground">Add some items to your bag first.</p>
        <Button className="mt-4" onClick={() => router.push("/products")}>
          Browse products
        </Button>
      </div>
    )
  }

  function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault()
    const order = placeOrder(address, payment)
    toast("Order placed successfully!", "success")
    router.push(`/orders/${order.id}?new=1`)
  }

  const field =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-ring focus:ring-2"

  return (
    <form onSubmit={handlePlaceOrder} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Delivery Address</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Full name"
              className={field}
              value={address.fullName}
              onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
            />
            <input
              required
              placeholder="Phone number"
              className={field}
              value={address.phone}
              onChange={(e) => setAddress({ ...address, phone: e.target.value })}
            />
            <input
              required
              placeholder="Address line"
              className={cn(field, "sm:col-span-2")}
              value={address.line1}
              onChange={(e) => setAddress({ ...address, line1: e.target.value })}
            />
            <input
              required
              placeholder="City"
              className={field}
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            />
            <input
              required
              placeholder="State"
              className={field}
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
            />
            <input
              required
              placeholder="Pincode"
              className={field}
              value={address.pincode}
              onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Payment Method</h2>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((m) => {
              const Icon = m.icon
              const active = payment === m.id
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md border p-3 text-left text-sm transition-colors",
                    active ? "border-primary bg-primary/5" : "hover:bg-muted",
                  )}
                >
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1 font-medium">{m.label}</span>
                  {active && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </button>
              )
            })}
          </div>
        </section>
      </div>

      <aside className="h-fit space-y-4 rounded-lg border bg-card p-5 lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold">Your Order</h2>
        <ul className="max-h-64 space-y-3 overflow-auto">
          {cart.map((item) => (
            <li key={`${item.product.id}-${item.size}`} className="flex gap-3">
              <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded bg-muted">
                <Image
                  src={item.product.image || "/placeholder.svg"}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="flex-1 text-sm">
                <p className="line-clamp-1 font-medium">{item.product.name}</p>
                <p className="text-muted-foreground">
                  Size {item.size} · Qty {item.quantity}
                </p>
              </div>
              <p className="text-sm font-medium">{formatPrice(item.product.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="space-y-2 border-t pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPrice(cartTotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tax</dt>
            <dd>{formatPrice(tax)}</dd>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(grandTotal)}</dd>
          </div>
        </dl>
        <Button type="submit" size="lg" className="w-full">
          Place Order
        </Button>
      </aside>
    </form>
  )
}
