"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/providers/toast-provider"
import type { Product } from "@/lib/types"

const CATEGORIES = ["accessories", "clothing", "electronics", "shoes", "equipment", "bags"]

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
  const [category, setCategory] = useState(product?.category || "accessories")
  const [price, setPrice] = useState(product?.price.toString() || "")
  const [stock, setStock] = useState(product?.stock?.toString() || "0")
  const [description, setDescription] = useState(product?.description || "")
  const [imageUrl, setImageUrl] = useState(product?.image_url || "")
  const [uploading, setUploading] = useState(false)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')
      const data = await response.json()
      setImageUrl(data.url)
      toast('Image uploaded successfully', 'success')
    } catch (error) {
      console.error('[v0] upload error:', error)
      toast('Image upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !price || !category) {
      toast("Please fill all required fields.", "error")
      return
    }

    try {
      await onSubmit({
        name,
        category,
        price: Number(price),
        stock: Number(stock),
        description,
        image_url: imageUrl,
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
            placeholder="e.g., Yoga Mat"
          />
        </div>
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
            step="0.01"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stock Quantity *</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="50"
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
          rows={4}
          placeholder="Product details..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Product Image</label>
        <div className="relative">
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
          />
          <label
            htmlFor="image-upload"
            className="flex items-center justify-center w-full p-6 border-2 border-dashed border-input rounded-lg cursor-pointer hover:border-primary transition-colors"
          >
            <div className="text-center">
              {imageUrl ? (
                <div className="space-y-2">
                  <img src={imageUrl} alt="preview" className="h-32 w-32 rounded-md object-cover mx-auto" />
                  <p className="text-xs text-muted-foreground">Click to change image</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm font-medium">Drag and drop image here</p>
                  <p className="text-xs text-muted-foreground">or click to select</p>
                </div>
              )}
            </div>
          </label>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
              <p className="text-sm font-medium">Uploading...</p>
            </div>
          )}
        </div>
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
