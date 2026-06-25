import { notFound } from "next/navigation"
import { SiteShell } from "@/components/layout/site-shell"
import { ProductDetail } from "@/components/product/product-detail"
import { resolveProduct, resolveProducts, relatedFrom } from "@/lib/catalog"

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await resolveProduct(id)
  if (!product) notFound()
  const all = await resolveProducts()
  const related = relatedFrom(all, product)

  return (
    <SiteShell>
      <ProductDetail product={product} related={related} />
    </SiteShell>
  )
}
