"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { SlidersHorizontal, X } from "lucide-react"
import type { Category, Product } from "@/lib/types"
import { PRODUCTS } from "@/lib/data/products"
import { ProductGrid } from "@/components/product/product-grid"
import { FilterSidebar, type Filters } from "@/components/product/filter-sidebar"
import { fetcher } from "@/lib/fetcher"
import { cn } from "@/lib/utils"

type SortOption = "popular" | "price_low" | "price_high" | "rating" | "discount" | "newest"

const SORT_LABELS: Record<SortOption, string> = {
  popular: "Popularity",
  price_low: "Price: Low to High",
  price_high: "Price: High to Low",
  rating: "Customer Rating",
  discount: "Better Discount",
  newest: "What's New",
}

export function ProductListing({
  initialCategory,
  query,
}: {
  initialCategory?: Category
  query?: string
}) {
  const { data } = useSWR<{ products: Product[] }>("/api/products", fetcher)
  const catalog = data?.products && data.products.length > 0 ? data.products : PRODUCTS

  const priceCeiling = useMemo(() => Math.max(...catalog.map((p) => p.price)), [catalog])
  const allBrands = useMemo(() => Array.from(new Set(catalog.map((p) => p.brand))).sort(), [catalog])

  const [filters, setFilters] = useState<Filters>({
    categories: initialCategory ? [initialCategory] : [],
    brands: [],
    minRating: 0,
    maxPrice: Number.POSITIVE_INFINITY,
  })
  const [sort, setSort] = useState<SortOption>("popular")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const filtered = useMemo(() => {
    let result: Product[] = catalog
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)) ||
          p.category.includes(q),
      )
    }
    if (filters.categories.length) result = result.filter((p) => filters.categories.includes(p.category))
    if (filters.brands.length) result = result.filter((p) => filters.brands.includes(p.brand))
    if (filters.minRating) result = result.filter((p) => p.rating >= filters.minRating)
    result = result.filter((p) => p.price <= filters.maxPrice)

    const sorted = [...result]
    switch (sort) {
      case "price_low":
        sorted.sort((a, b) => a.price - b.price)
        break
      case "price_high":
        sorted.sort((a, b) => b.price - a.price)
        break
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating)
        break
      case "discount":
        sorted.sort((a, b) => b.discountPercent - a.discountPercent)
        break
      case "newest":
        sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew))
        break
      default:
        sorted.sort((a, b) => b.ratingCount - a.ratingCount)
    }
    return sorted
  }, [filters, sort, query, catalog])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
            {query ? `Results for "${query}"` : "All Products"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{filtered.length} items</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium lg:hidden"
          >
            <SlidersHorizontal className="size-4" /> Filters
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-ring"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <FilterSidebar filters={filters} setFilters={setFilters} brands={allBrands} priceCeiling={priceCeiling} />
        </aside>

        <div className="flex-1">
          {filtered.length ? (
            <ProductGrid products={filtered} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
              <p className="font-semibold">No products found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search.</p>
            </div>
          )}
        </div>
      </div>

      {/* mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85%] overflow-y-auto bg-background p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-heading font-bold">Filters</span>
              <button aria-label="Close filters" onClick={() => setMobileFiltersOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <FilterSidebar filters={filters} setFilters={setFilters} brands={allBrands} priceCeiling={priceCeiling} />
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className={cn("mt-6 w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground")}
            >
              Show {filtered.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
