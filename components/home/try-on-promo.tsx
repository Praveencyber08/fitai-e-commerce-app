import Link from "next/link"
import { Sparkles, Upload, Shirt, Wand2 } from "lucide-react"

const STEPS = [
  { icon: Upload, title: "Upload your photo", desc: "Add a clear full-body or upper-body photo." },
  { icon: Shirt, title: "Pick an outfit", desc: "Choose any product from our catalog." },
  { icon: Wand2, title: "Generate preview", desc: "Our AI shows how it looks on you instantly." },
]

export function TryOnPromo() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-accent/20 to-background p-8 lg:p-12">
        <div className="flex flex-col items-start gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold">
            <Sparkles className="size-3.5 text-primary" /> AI Virtual Try-On
          </span>
          <h2 className="text-balance font-heading text-3xl font-extrabold tracking-tight">
            Your personal fitting room, powered by AI
          </h2>
          <p className="max-w-xl text-pretty text-muted-foreground">
            Stop guessing. Upload a photo and see exactly how an outfit looks on you in seconds.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-xl border border-border bg-background/70 p-5 backdrop-blur">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="size-5" />
              </div>
              <p className="mt-3 text-xs font-bold text-primary">STEP {i + 1}</p>
              <h3 className="mt-1 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>

        <Link
          href="/try-on"
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Sparkles className="size-4" /> Launch Try-On Studio
        </Link>
      </div>
    </section>
  )
}
