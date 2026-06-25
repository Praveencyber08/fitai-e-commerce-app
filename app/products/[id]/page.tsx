import { notFound } from "next/navigation"
import { SiteShell } from "@/components/layout/site-shell"
import { ProductDetail } from "@/components/product/product-detail"
import { getProduct, getRelated, PRODUCTS } from "@/lib/data/products"

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }))
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = getProduct(id)
  if (!product) notFound()
  const related = getRelated(product)

  return (
    <SiteShell>
      <ProductDetail product={product} related={related} />
    </SiteShell>
  )
}
