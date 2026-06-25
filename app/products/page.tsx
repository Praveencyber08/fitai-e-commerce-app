import { SiteShell } from "@/components/layout/site-shell"
import { ProductListing } from "@/components/product/product-listing"
import type { Category } from "@/lib/types"

const VALID: Category[] = ["men", "women", "kids", "footwear", "accessories", "ethnic"]

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const { category, q } = await searchParams
  const initialCategory = category && VALID.includes(category as Category) ? (category as Category) : undefined

  return (
    <SiteShell>
      <ProductListing initialCategory={initialCategory} query={q} />
    </SiteShell>
  )
}
