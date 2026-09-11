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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">
            Today's Operations
          </CardTitle>

          <p className="mt-1 text-xs text-muted-foreground">
            Current vehicle activity
          </p>
        </div>

        <Link
          href="/operations"
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          View all
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {jobs.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm font-medium">
              No jobs today
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              New jobs will appear here as they are created.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center gap-4 px-6 py-4"
              >
                <div className="hidden w-12 text-xs font-medium text-muted-foreground sm:block">
                  {job.id}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {job.vehicle}
                  </p>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {job.plate} - {job.service}
                  </p>
                </div>

                <div className="hidden text-right md:block">
                  <p className="text-xs font-medium">
                    {job.worker}
                  </p>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {job.time}
                  </p>
                </div>

                <Badge variant={getStatusVariant(job.status) as any}>
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
