import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"

export function Rating({
  value,
  count,
  size = "sm",
  className,
}: {
  value: number
  count?: number
  size?: "sm" | "md"
  className?: string
}) {
  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded bg-emerald-500/15 px-1.5 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400",
          size === "sm" ? "text-xs" : "text-sm",
        )}
      >
        {value.toFixed(1)}
        <Star className={cn("fill-current", size === "sm" ? "size-3" : "size-3.5")} />
      </span>
      {count !== undefined && (
        <span className={cn("text-muted-foreground", size === "sm" ? "text-xs" : "text-sm")}>
          ({formatNumber(count)})
        </span>
      )}
    </div>
  )
}
