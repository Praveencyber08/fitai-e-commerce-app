import { SiteShell } from "@/components/layout/site-shell"
import { Hero } from "@/components/home/hero"
import { CategorySection } from "@/components/home/category-section"
import { ProductSection } from "@/components/home/product-section"
import { TryOnPromo } from "@/components/home/try-on-promo"
import { resolveProducts } from "@/lib/catalog"

export default async function HomePage() {
  const products = await resolveProducts()
  
  // Split products into two sections
  // First section: first 8 products
  // Second section: next 8 products
  const firstSection = products.slice(0, 8)
  const secondSection = products.slice(8, 16)

  return (
    <SiteShell>
      <Hero />
      <CategorySection />
      <ProductSection
        title="Trending now"
        subtitle="The styles everyone is wearing this season"
        products={firstSection}
        href="/products"
      />
      <TryOnPromo />
      <ProductSection
        title="New arrivals"
        subtitle="Fresh drops added just for you"
        products={secondSection}
        href="/products"
      />
    </SiteShell>
  )
}
