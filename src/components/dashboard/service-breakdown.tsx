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
        {services.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm font-medium">
              No service activity today
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Service activity will appear here after jobs are created.
            </p>
          </div>
        ) : (
          services.map((service) => (
            <div key={service.name}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">
                  {service.name}
                </span>

                <span className="text-xs text-muted-foreground">
                  {service.jobs} {service.jobs === 1 ? "job" : "jobs"}
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
          ))
        )}
      </CardContent>
    </Card>
  )
}
