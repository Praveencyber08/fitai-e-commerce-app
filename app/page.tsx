import { SiteShell } from "@/components/layout/site-shell"
import { Hero } from "@/components/home/hero"
import { CategorySection } from "@/components/home/category-section"
import { ProductSection } from "@/components/home/product-section"
import { TryOnPromo } from "@/components/home/try-on-promo"
import { PRODUCTS } from "@/lib/data/products"

export default function HomePage() {
  const trending = PRODUCTS.filter((p) => p.isTrending).slice(0, 8)
  const trendingFilled = trending.length >= 4 ? trending : PRODUCTS.slice(0, 8)
  const newArrivals = PRODUCTS.filter((p) => p.isNew).slice(0, 8)
  const newFilled = newArrivals.length >= 4 ? newArrivals : PRODUCTS.slice(8, 16)

  return (
    <SiteShell>
      <Hero />
      <CategorySection />
      <ProductSection
        title="Trending now"
        subtitle="The styles everyone is wearing this season"
        products={trendingFilled}
        href="/products"
      />
      <TryOnPromo />
      <ProductSection
        title="New arrivals"
        subtitle="Fresh drops added just for you"
        products={newFilled}
        href="/products"
      />
    </SiteShell>
  )
}
