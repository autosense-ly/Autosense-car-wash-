import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type RecentJob = {
  id: string
  vehicle: string
  plate: string
  service: string
  worker: string
  status:
    | "waiting"
    | "in_progress"
    | "ready"
    | "completed"
    | "cancelled"
  time: string
}

function formatStatus(status: RecentJob["status"]) {
  switch (status) {
    case "waiting":
      return "Waiting"
    case "in_progress":
      return "In Progress"
    case "ready":
      return "Ready"
    case "completed":
      return "Completed"
    case "cancelled":
      return "Cancelled"
  }
}

function getStatusVariant(status: RecentJob["status"]) {
  if (status === "ready") return "default"
  if (status === "completed") return "secondary"
  return "outline"
}

export function RecentJobs({ jobs }: { jobs: RecentJob[] }) {
  return (
    <Card size="sm" className="premium-hover">
      <CardHeader className="flex flex-row items-center justify-between px-4 py-4 sm:px-5">
        <div>
          <CardTitle className="text-[15px] font-semibold">
            Today's Operations
          </CardTitle>

          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Current vehicle activity
          </p>
        </div>

        <Link
          href="/operations"
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
        >
          View all
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {jobs.length === 0 ? (
          <div className="flex min-h-[150px] items-center justify-center px-4 py-6 sm:px-5">
            <div className="max-w-xs text-center">
              <p className="text-sm font-semibold">No jobs today</p>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                New jobs will appear here as they are created.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/70">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center gap-3 px-4 py-3 sm:px-5"
              >
                <div className="hidden w-11 shrink-0 text-[11px] font-semibold text-muted-foreground sm:block">
                  {job.id}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">
                    {job.vehicle}
                  </p>

                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {job.plate} · {job.service}
                  </p>
                </div>

                <div className="hidden shrink-0 text-right md:block">
                  <p className="max-w-[110px] truncate text-[11px] font-semibold">
                    {job.worker}
                  </p>

                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {job.time}
                  </p>
                </div>

                <Badge
                  variant={getStatusVariant(job.status) as any}
                  className="shrink-0 text-[10px]"
                >
                  {formatStatus(job.status)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
