import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Product } from "@/lib/types"
import { ProductGrid } from "@/components/product/product-grid"

export function ProductSection({
  title,
  subtitle,
  products,
  href,
}: {
  title: string
  subtitle?: string
  products: Product[]
  href: string
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          View all <ArrowRight className="size-4" />
        </Link>
      </div>
      <ProductGrid products={products} />
    </section>
  )
}
