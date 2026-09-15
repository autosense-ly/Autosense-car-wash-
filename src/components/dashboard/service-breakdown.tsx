import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type ServiceBreakdownItem = {
  name: string
  jobs: number
  revenue: string
  percent: number
}

export function ServiceBreakdown({
  services,
}: {
  services: ServiceBreakdownItem[]
}) {
  return (
    <Card size="sm" className="premium-hover">
      <CardHeader className="px-4 py-4 sm:px-5">
        <CardTitle className="text-[15px] font-semibold">
          Service Breakdown
        </CardTitle>

        <p className="text-[11px] text-muted-foreground">
          Today's service activity
        </p>
      </CardHeader>

      <CardContent className="px-4 pb-5 sm:px-5">
        {services.length === 0 ? (
          <div className="flex min-h-[150px] items-center justify-center px-2 py-6 text-center">
            <div className="max-w-xs">
              <p className="text-sm font-semibold">
                No service activity today
              </p>

              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                Service activity will appear here after jobs are created.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.name}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="truncate text-[12px] font-semibold">
                    {service.name}
                  </span>

                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {service.jobs} {service.jobs === 1 ? "job" : "jobs"}
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all dark:bg-blue-500"
                    style={{
                      width: `${Math.min(service.percent, 100)}%`,
                    }}
                  />
                </div>

                <div className="mt-1 text-[10px] text-muted-foreground">
                  {service.revenue}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
