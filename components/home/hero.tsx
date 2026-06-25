import Link from "next/link"
import Image from "next/image"
import { Sparkles, ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-accent/40 via-background to-background">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20 lg:px-8">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold">
            <Sparkles className="size-3.5 text-primary" />
            AI-powered virtual try-on
          </span>
          <h1 className="text-balance font-heading text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            See it on you <span className="text-primary">before</span> you buy it
          </h1>
          <p className="max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Shop thousands of premium styles and instantly preview how they look on you with FitAI&apos;s virtual
            try-on studio.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Shop Now <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/try-on"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-background px-6 text-sm font-semibold transition-colors hover:bg-muted"
            >
              <Sparkles className="size-4 text-primary" /> Try AI Studio
            </Link>
          </div>
          <div className="flex items-center gap-6 pt-2">
            <Stat value="50k+" label="Products" />
            <Stat value="4.7★" label="Avg. rating" />
            <Stat value="2M+" label="Happy shoppers" />
          </div>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border shadow-sm lg:aspect-[5/4]">
          <Image
            src="/hero-fashion.png"
            alt="Models wearing trending fashion outfits"
            fill
            priority
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-heading text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
