import Link from "next/link"
import Image from "next/image"
import { CATEGORIES } from "@/lib/data/products"

export function CategorySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="font-heading text-2xl font-bold tracking-tight">Shop by category</h2>
      <p className="mt-1 text-sm text-muted-foreground">Find your style across our curated collections</p>
      <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-6">
        {CATEGORIES.map((c) => (
          <Link
            key={c.id}
            href={`/products?category=${c.id}`}
            className="group flex flex-col items-center gap-2"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-full border border-border bg-muted">
              <Image
                src={c.image || "/placeholder.svg"}
                alt={c.label}
                fill
                sizes="(max-width:768px) 30vw, 15vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span className="text-sm font-medium">{c.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
