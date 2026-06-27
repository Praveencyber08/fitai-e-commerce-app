"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Upload, Sparkles, RefreshCw, Download, Loader2, ShoppingBag, ImageIcon, X } from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { PRODUCTS } from "@/lib/data/products"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/types"

const TRYABLE = PRODUCTS.filter((p) => p.category !== "accessories" && p.category !== "footwear")

export function TryOnClient({ initialProductId }: { initialProductId?: string }) {
  const { addTryOn, addToCart, tryOnHistory } = useStore()
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const [userImage, setUserImage] = useState<string | null>(null)
  const [garment, setGarment] = useState<Product | null>(
    initialProductId ? (TRYABLE.find((p) => p.id === initialProductId) ?? null) : null,
  )
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast("Please upload an image file.", "error")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setUserImage(reader.result as string)
      setResult(null)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  async function handleGenerate() {
    if (!userImage || !garment) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userImage,
          garmentImage: garment.image,
          garmentName: `${garment.brand} ${garment.name}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.")
        return
      }
      setResult(data.image)
      addTryOn({
        id: "to-" + Date.now(),
        productId: garment.id,
        productName: `${garment.brand} ${garment.name}`,
        resultImage: data.image,
        createdAt: new Date().toISOString(),
      })
      toast("Your virtual try-on is ready!", "success")
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Step 1: Upload */}
        <div className="space-y-3 rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              1
            </span>
            <h2 className="font-semibold">Upload your photo</h2>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          {userImage ? (
            <div className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
              <Image src={userImage || "/placeholder.svg"} alt="Your uploaded photo" fill className="object-cover" />
              <button
                onClick={() => {
                  setUserImage(null)
                  setResult(null)
                }}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background"
                aria-label="Remove photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Upload className="h-8 w-8" />
              <span className="text-sm font-medium">Click to upload</span>
              <span className="px-4 text-center text-xs">A clear, front-facing full-body photo works best</span>
            </button>
          )}
        </div>

        {/* Step 2: Select garment */}
        <div className="space-y-3 rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              2
            </span>
            <h2 className="font-semibold">Choose an outfit</h2>
          </div>
          {garment ? (
            <div className="space-y-3">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
                <Image src={garment.image || "/placeholder.svg"} alt={garment.name} fill className="object-cover" sizes="120px" />
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-foreground">{garment.brand}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{garment.name}</p>
              </div>
              <button
                onClick={() => {
                  setGarment(null)
                  setResult(null)
                }}
                className="w-full rounded-md border border-input py-2 text-xs font-medium transition-colors hover:bg-muted"
              >
                Change outfit
              </button>
            </div>
          ) : (
            <div className="grid max-h-[360px] grid-cols-3 gap-2 overflow-auto pr-1">
              {TRYABLE.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setGarment(p)
                    setResult(null)
                  }}
                  className="group relative aspect-[3/4] overflow-hidden rounded-md border-2 border-transparent bg-muted transition-all hover:border-border"
                  title={`${p.brand} ${p.name}`}
                >
                  <Image src={p.image || "/placeholder.svg"} alt={p.name} fill className="object-cover" sizes="120px" />
                  <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="mb-2 text-center text-xs font-medium text-white">Select</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 3: Result */}
        <div className="space-y-3 rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              3
            </span>
            <h2 className="font-semibold">Your try-on</h2>
          </div>
          <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-muted">
            {loading ? (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm">Styling your look…</span>
              </div>
            ) : result ? (
              <Image src={result || "/placeholder.svg"} alt="Virtual try-on result" fill className="object-cover" />
            ) : error ? (
              <div className="flex flex-col items-center gap-2 px-4 text-center">
                <ImageIcon className="h-8 w-8 text-destructive" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">
                    {error.includes("credit card") ? "AI Gateway Billing Required" : "Try-On Generation Failed"}
                  </p>
                  <p className="text-xs text-muted-foreground">{error}</p>
                  {error.includes("credit card") && (
                    <a
                      href="https://vercel.com/dashboard/settings/billing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs font-medium text-primary hover:underline"
                    >
                      Add Payment Method →
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 px-4 text-center text-muted-foreground">
                <Sparkles className="h-8 w-8" />
                <span className="text-sm">Your AI preview will appear here</span>
              </div>
            )}
          </div>
          {result && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={handleGenerate}>
                <RefreshCw className="mr-1 h-4 w-4" /> Retry
              </Button>
              <Button asChild variant="outline" size="sm" className="flex-1">
                <a href={result} download="fitai-tryon.png">
                  <Download className="mr-1 h-4 w-4" /> Save
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button size="lg" disabled={!userImage || !garment || loading} onClick={handleGenerate} className="min-w-56">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Generate Try-On
            </>
          )}
        </Button>
        {garment && result && (
          <div className="flex flex-col items-center gap-2">
            <Button asChild className="gap-2">
              <Link href={`/products/${garment.id}`}>
                <ShoppingBag className="h-4 w-4" /> Buy Now
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                addToCart({
                  productId: garment.id,
                  quantity: 1,
                  size: garment.sizes[0] || "M",
                  price: garment.price,
                })
                toast("Added to cart!", "success")
              }}
            >
              Add to Cart
            </Button>
          </div>
        )}
      </div>

      {tryOnHistory.length > 0 && (
        <section className="space-y-4 border-t pt-8">
          <h2 className="text-lg font-semibold">Your try-on history</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {tryOnHistory.map((t) => (
              <div key={t.id} className="space-y-2">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
                  <Image src={t.resultImage || "/placeholder.svg"} alt={t.productName} fill className="object-cover" sizes="180px" />
                </div>
                <p className="line-clamp-1 text-xs text-muted-foreground">{t.productName}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
