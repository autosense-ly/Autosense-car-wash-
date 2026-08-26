import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const services = [
  { name: "Full Wash", jobs: 28, revenue: "840 LYD", percent: 62 },
  { name: "Interior", jobs: 12, revenue: "360 LYD", percent: 28 },
  { name: "Exterior", jobs: 9, revenue: "270 LYD", percent: 20 },
  { name: "Oil Change", jobs: 6, revenue: "360 LYD", percent: 14 },
]

export function ServiceBreakdown() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Service Breakdown
        </CardTitle>

        <p className="text-xs text-muted-foreground">
          Today's service activity
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {services.map((service) => (
          <div key={service.name}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">
                {service.name}
              </span>

              <span className="text-xs text-muted-foreground">
                {service.jobs} jobs
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{
                  width: `${Math.min(service.percent, 100)}%`,
                }}
              />
            </div>

            <div className="mt-1.5 text-xs text-muted-foreground">
              {service.revenue}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
