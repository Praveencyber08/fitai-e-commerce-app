"use client"

import { Star } from "lucide-react"
import type { Category } from "@/lib/types"
import { cn } from "@/lib/utils"

export interface Filters {
  categories: Category[]
  brands: string[]
  minRating: number
  maxPrice: number
}

const CATEGORY_OPTIONS: { id: Category; label: string }[] = [
  { id: "men", label: "Men" },
  { id: "women", label: "Women" },
  { id: "kids", label: "Kids" },
  { id: "footwear", label: "Footwear" },
  { id: "ethnic", label: "Ethnic" },
  { id: "accessories", label: "Accessories" },
]

export function FilterSidebar({
  filters,
  setFilters,
  brands,
  priceCeiling,
}: {
  filters: Filters
  setFilters: (f: Filters) => void
  brands: string[]
  priceCeiling: number
}) {
  function toggleCategory(c: Category) {
    setFilters({
      ...filters,
      categories: filters.categories.includes(c)
        ? filters.categories.filter((x) => x !== c)
        : [...filters.categories, c],
    })
  }
  function toggleBrand(b: string) {
    setFilters({
      ...filters,
      brands: filters.brands.includes(b) ? filters.brands.filter((x) => x !== b) : [...filters.brands, b],
    })
  }

  const priceValue = Number.isFinite(filters.maxPrice) ? filters.maxPrice : priceCeiling

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base font-bold">Filters</h2>
        <button
          onClick={() => setFilters({ categories: [], brands: [], minRating: 0, maxPrice: priceCeiling })}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Clear all
        </button>
      </div>

      <FilterGroup title="Category">
        {CATEGORY_OPTIONS.map((c) => (
          <Checkbox
            key={c.id}
            label={c.label}
            checked={filters.categories.includes(c.id)}
            onChange={() => toggleCategory(c.id)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Brand">
        {brands.map((b) => (
          <Checkbox key={b} label={b} checked={filters.brands.includes(b)} onChange={() => toggleBrand(b)} />
        ))}
      </FilterGroup>

      <FilterGroup title={`Price up to ₹${priceValue.toLocaleString("en-IN")}`}>
        <input
          type="range"
          min={500}
          max={priceCeiling}
          step={100}
          value={priceValue}
          onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-[var(--primary)]"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>₹500</span>
          <span>₹{priceCeiling.toLocaleString("en-IN")}</span>
        </div>
      </FilterGroup>

      <FilterGroup title="Customer rating">
        {[4, 3, 2].map((r) => (
          <button
            key={r}
            onClick={() => setFilters({ ...filters, minRating: filters.minRating === r ? 0 : r })}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
              filters.minRating === r ? "bg-primary/10 text-primary" : "hover:bg-muted",
            )}
          >
            <span className="flex items-center gap-0.5">
              {r}
              <Star className="size-3.5 fill-current" />
            </span>
            <span className="text-muted-foreground">& above</span>
          </button>
        ))}
      </FilterGroup>
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-4">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 rounded border-input accent-[var(--primary)]"
      />
      <span className={cn(checked ? "font-medium text-foreground" : "text-muted-foreground")}>{label}</span>
    </label>
  )
}
