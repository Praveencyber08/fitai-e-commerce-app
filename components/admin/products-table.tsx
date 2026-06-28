"use client"

import { useState } from "react"
import Image from "next/image"
import useSWR from "swr"
import { Search, Edit2, Trash2, Plus } from "lucide-react"
import { PRODUCTS } from "@/lib/data/products"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/format"
import { fetcher } from "@/lib/fetcher"
import { useToast } from "@/components/providers/toast-provider"
import { ProductForm } from "@/components/admin/product-form"
import type { Product } from "@/lib/types"

export function AdminProductsTable() {
  const [query, setQuery] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data, mutate } = useSWR<{ products: Product[] }>("/api/products", fetcher)
  const { toast } = useToast()

  const catalog = data?.products && data.products.length > 0 ? data.products : PRODUCTS

  const filtered = catalog.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()),
  )

  async function handleSave(formData: unknown) {
    setIsSubmitting(true)
    try {
      let response
      if (editingProduct) {
        response = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      } else {
        response = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      }

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Save failed")
      }

      toast(editingProduct ? "Product updated!" : "Product added!", "success")
      setModalOpen(false)
      setEditingProduct(null)
      mutate()
    } catch (err) {
      console.error("[v0] save product error:", err)
      toast(err instanceof Error ? err.message : "Could not save product.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Delete failed")
      toast("Product deleted.", "success")
      mutate()
    } catch (err) {
      console.error("[v0] delete product error:", err)
      toast("Could not delete product.", "error")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">{catalog.length} products in catalog</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-64 rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none ring-ring focus:ring-2"
            />
          </div>
          <Button
            onClick={() => {
              setEditingProduct(null)
              setModalOpen(true)
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              <button
                onClick={() => {
                  setModalOpen(false)
                  setEditingProduct(null)
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <ProductForm
              product={editingProduct || undefined}
              onSubmit={handleSave}
              onCancel={() => {
                setModalOpen(false)
                setEditingProduct(null)
              }}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}

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
                <th className="px-5 py-3 font-medium">Actions</th>
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
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(p)
                          setModalOpen(true)
                        }}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
