import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type StatCardProps = {
  title: string
  value: string
  subtitle: string
  trend?: string
  trendType?: "up" | "down" | "neutral"
  icon: React.ElementType
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendType = "neutral",
  icon: Icon,
}: StatCardProps) {
  const TrendIcon =
    trendType === "up"
      ? ArrowUpRight
      : trendType === "down"
        ? ArrowDownRight
        : Minus

  return (
    <Card size="sm" className="premium-hover">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {title}
            </p>

            <p className="mt-2 text-[22px] font-semibold tracking-tight sm:text-2xl">
              {value}
            </p>
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <Icon className="h-[18px] w-[18px]" />
          </div>
        </div>

        <div className="mt-2.5 flex min-h-4 items-center gap-1.5 text-[11px]">
          {trend && (
            <span
              className={
                trendType === "up"
                  ? "flex items-center font-semibold text-emerald-600 dark:text-emerald-400"
                  : trendType === "down"
                    ? "flex items-center font-semibold text-red-600 dark:text-red-400"
                    : "flex items-center font-semibold text-muted-foreground"
              }
            >
              <TrendIcon className="mr-0.5 h-3.5 w-3.5" />
              {trend}
            </span>
          )}

          <span className="truncate text-muted-foreground">
            {subtitle}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
