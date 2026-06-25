import { SiteShell } from "@/components/layout/site-shell"
import { WishlistClient } from "@/components/wishlist/wishlist-client"

export const metadata = { title: "My Wishlist — FitAI" }

export default function WishlistPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <WishlistClient />
      </div>
    </SiteShell>
  )
}
