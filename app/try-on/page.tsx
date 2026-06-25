import { Sparkles } from "lucide-react"
import { SiteShell } from "@/components/layout/site-shell"
import { TryOnClient } from "@/components/try-on/try-on-client"

export const metadata = {
  title: "AI Virtual Try-On — FitAI",
  description: "Upload your photo and see how any outfit looks on you with AI-powered virtual try-on.",
}

export default async function TryOnPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>
}) {
  const { product } = await searchParams
  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" /> Powered by AI
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance">Virtual Try-On Studio</h1>
          <p className="mx-auto mt-2 max-w-xl text-pretty text-muted-foreground">
            Upload a photo, pick an outfit, and let AI show you how it looks before you buy.
          </p>
        </div>
        <TryOnClient initialProductId={product} />
      </div>
    </SiteShell>
  )
}
