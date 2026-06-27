"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/providers/toast-provider"
import type { Product } from "@/lib/types"

const CATEGORIES = ["men", "women", "kids", "accessories", "footwear", "beauty"]
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"]
const COLORS = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Pink", "Brown", "Gray"]

export function ProductForm({
  product,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  product?: Product
  onSubmit: (data: unknown) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}) {
  const { toast } = useToast()
  const [name, setName] = useState(product?.name || "")
  const [brand, setBrand] = useState(product?.brand || "")
  const [category, setCategory] = useState(product?.category || "men")
  const [subCategory, setSubCategory] = useState(product?.subCategory || "")
  const [price, setPrice] = useState(product?.price.toString() || "")
  const [mrp, setMrp] = useState(product?.mrp.toString() || "")
  const [description, setDescription] = useState(product?.description || "")
  const [image, setImage] = useState(product?.image || "")
  const [sizes, setSizes] = useState<string[]>(product?.sizes || [])
  const [colors, setColors] = useState<string[]>(product?.colors || [])
  const [isTrending, setIsTrending] = useState(product?.isTrending || false)
  const [isNew, setIsNew] = useState(product?.isNew || false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !brand || !price || !category) {
      toast("Please fill all required fields.", "error")
      return
    }

    try {
      await onSubmit({
        name,
        brand,
        category,
        subCategory,
        price: Number(price),
        mrp: Number(mrp) || Number(price),
        description,
        image,
        sizes: sizes.length ? sizes : undefined,
        colors: colors.length ? colors : undefined,
        isTrending,
        isNew,
      })
    } catch (err) {
      console.error("[v0] product form error:", err)
      toast("Failed to save product.", "error")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="e.g., Classic Blue T-Shirt"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Brand *</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="e.g., Nike, Adidas"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sub-Category</label>
          <input
            type="text"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="e.g., Casual, Formal"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Price (₹) *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="999"
            step="1"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">MRP (₹)</label>
          <input
            type="number"
            value={mrp}
            onChange={(e) => setMrp(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="1999"
            step="1"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows={3}
          placeholder="Product details..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Primary Image URL *</label>
        <input
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="https://..."
        />
        {image && <img src={image} alt="preview" className="mt-2 h-24 w-24 rounded-md object-cover" />}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Sizes</label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() =>
                setSizes(sizes.includes(sz) ? sizes.filter((s) => s !== sz) : [...sizes, sz])
              }
              className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                sizes.includes(sz)
                  ? "bg-primary text-primary-foreground"
                  : "border border-input bg-background text-foreground hover:border-primary"
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Colors</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((col) => (
            <button
              key={col}
              type="button"
              onClick={() =>
                setColors(colors.includes(col) ? colors.filter((c) => c !== col) : [...colors, col])
              }
              className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                colors.includes(col)
                  ? "bg-primary text-primary-foreground"
                  : "border border-input bg-background text-foreground hover:border-primary"
              }`}
            >
              {col}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} />
          <span className="text-sm font-medium">Mark as Trending</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
          <span className="text-sm font-medium">Mark as New</span>
        </label>
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : product ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </form>
  )
}
