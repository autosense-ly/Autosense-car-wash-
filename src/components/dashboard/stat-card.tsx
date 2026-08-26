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
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {value}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {trend && (
            <span
              className={
                trendType === "up"
                  ? "flex items-center font-medium text-emerald-600"
                  : trendType === "down"
                    ? "flex items-center font-medium text-red-600"
                    : "flex items-center font-medium text-muted-foreground"
              }
            >
              <TrendIcon className="mr-0.5 h-3.5 w-3.5" />
              {trend}
            </span>
          )}

          <span className="text-muted-foreground">
            {subtitle}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
