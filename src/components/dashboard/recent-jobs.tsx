import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const jobs = [
  {
    id: "#104",
    vehicle: "Toyota Camry",
    plate: "ABC-123",
    service: "Full Wash",
    worker: "Mohammed",
    status: "In Progress",
    time: "10:24",
  },
  {
    id: "#103",
    vehicle: "BMW 5 Series",
    plate: "TRP-442",
    service: "Interior",
    worker: "Ahmed",
    status: "Ready",
    time: "10:05",
  },
  {
    id: "#102",
    vehicle: "Toyota Corolla",
    plate: "LY-881",
    service: "Exterior",
    worker: "Ali",
    status: "Waiting",
    time: "09:48",
  },
  {
    id: "#101",
    vehicle: "Mercedes C-Class",
    plate: "TR-209",
    service: "Full Wash + Wax",
    worker: "Hassan",
    status: "Completed",
    time: "09:31",
  },
]

function getStatusVariant(status: string) {
  if (status === "Ready") return "default"
  if (status === "Completed") return "secondary"
  return "outline"
}

export function RecentJobs() {
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

        <button className="text-xs font-medium text-blue-600 hover:underline">
          View all
        </button>
      </CardHeader>

      <CardContent className="p-0">
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
                {job.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
