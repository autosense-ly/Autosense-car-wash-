"use client"

import {
  Car,
  Clock3,
  Plus,
  Search,
  UserRound,
} from "lucide-react"
import { useMemo, useState } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { getJobs, updateJob } from "@/lib/api/jobs"
import type { Job, JobStatus } from "@/lib/types/job"

function formatStatus(status: JobStatus) {
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

function getStatusClass(status: JobStatus) {
  if (status === "in_progress")
    return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"

  if (status === "ready")
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"

  if (status === "completed")
    return "bg-muted text-muted-foreground"

  if (status === "cancelled")
    return "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"

  return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
}

function getNextStatus(status: JobStatus): JobStatus | null {
  switch (status) {
    case "waiting":
      return "in_progress"
    case "in_progress":
      return "ready"
    case "ready":
      return "completed"
    default:
      return null
  }
}

function getNextActionLabel(status: JobStatus) {
  switch (status) {
    case "waiting":
      return "Start Job"
    case "in_progress":
      return "Mark Ready"
    case "ready":
      return "Complete"
    default:
      return null
  }
}

export default function OperationsPage() {
  const [jobs, setJobs] = useState<Job[]>(() => getJobs())
  const [search, setSearch] = useState("")

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return jobs
    }

    return jobs.filter((job) => {
      return (
        job.id.toLowerCase().includes(query) ||
        job.vehicle.toLowerCase().includes(query) ||
        job.plate.toLowerCase().includes(query) ||
        job.customerName?.toLowerCase().includes(query) ||
        job.worker?.toLowerCase().includes(query)
      )
    })
  }, [jobs, search])

  const counts = useMemo(() => {
    return {
      waiting: jobs.filter((job) => job.status === "waiting").length,
      inProgress: jobs.filter(
        (job) => job.status === "in_progress"
      ).length,
      ready: jobs.filter((job) => job.status === "ready").length,
      completed: jobs.filter(
        (job) => job.status === "completed"
      ).length,
    }
  }, [jobs])

  function advanceJob(job: Job) {
    const nextStatus = getNextStatus(job.status)

    if (!nextStatus) {
      return
    }

    const updated = updateJob(job.id, {
      status: nextStatus,
    })

    if (updated) {
      setJobs(getJobs())
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 lg:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Operations
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage today's vehicles and active jobs.
          </p>
        </div>

        <Link href="/jobs/new">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            New Job
          </Button>
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              Waiting
            </p>

            <p className="mt-1 text-xl font-semibold">
              {counts.waiting}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              In Progress
            </p>

            <p className="mt-1 text-xl font-semibold">
              {counts.inProgress}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              Ready
            </p>

            <p className="mt-1 text-xl font-semibold">
              {counts.ready}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              Completed
            </p>

            <p className="mt-1 text-xl font-semibold">
              {counts.completed}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search plate, customer, vehicle or job..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="font-medium">
                No jobs found
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Create a job or change your search.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => {
            const nextStatus = getNextStatus(job.status)
            const actionLabel = getNextActionLabel(job.status)

            return (
              <Card
                key={job.id}
                className="transition-shadow hover:shadow-sm"
              >
                <CardContent className="p-4 lg:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="flex items-center gap-4 lg:w-[300px]"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                        <Car className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {job.vehicle}
                          </p>

                          <span className="text-xs text-muted-foreground">
                            {job.id}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {job.plate} -{" "}
                          {job.customerName || "Walk-in"}
                        </p>
                      </div>
                    </Link>

                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {job.services
                          .map((service) => service.name)
                          .join(" + ")}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <UserRound className="h-3.5 w-3.5" />
                          {job.worker || "Unassigned"}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {new Date(
                            job.createdAt
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <Badge
                      className={`w-fit border-0 ${getStatusClass(
                        job.status
                      )}`}
                    >
                      {formatStatus(job.status)}
                    </Badge>

                    <div className="flex gap-2">
                      {nextStatus && actionLabel && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => advanceJob(job)}
                        >
                          {actionLabel}
                        </Button>
                      )}

                      <Link href={`/jobs/${job.id}`}>
                        <Button variant="outline" size="sm">
                          Open
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
