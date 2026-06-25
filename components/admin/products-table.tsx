"use client"

import { useState } from "react"
import Image from "next/image"
import useSWR from "swr"
import { Search } from "lucide-react"
import { PRODUCTS } from "@/lib/data/products"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/format"
import { fetcher } from "@/lib/fetcher"
import type { Product } from "@/lib/types"

export function AdminProductsTable() {
  const [query, setQuery] = useState("")
  const { data } = useSWR<{ products: Product[] }>("/api/products", fetcher)
  const catalog = data?.products && data.products.length > 0 ? data.products : PRODUCTS

  const filtered = catalog.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.brand.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">{catalog.length} products in catalog</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-64 rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none ring-ring focus:ring-2"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-muted">
                        <Image src={p.image || "/placeholder.svg"} alt={p.name} fill className="object-cover" sizes="40px" />
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 capitalize text-muted-foreground">{p.category}</td>
                  <td className="px-5 py-3 font-medium">{formatPrice(p.price)}</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.stock}</td>
                  <td className="px-5 py-3">
                    {p.stock === 0 ? (
                      <Badge variant="outline" className="text-destructive">
                        Out of stock
                      </Badge>
                    ) : p.stock < 15 ? (
                      <Badge variant="secondary">Low stock</Badge>
                    ) : (
                      <Badge variant="default">In stock</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
