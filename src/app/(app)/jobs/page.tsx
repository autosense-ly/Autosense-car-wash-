"use client"

import Link from "next/link"
import { MoreHorizontal, Plus, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getJobs } from "@/lib/api/jobs"
import type { Job } from "@/lib/types/job"

function formatStatus(status: Job["status"]) {
  switch (status) {
    case "in_progress":
      return "In Progress"
    case "waiting":
      return "Waiting"
    case "ready":
      return "Ready"
    case "completed":
      return "Completed"
    case "cancelled":
      return "Cancelled"
  }
}

export default function JobsPage() {
  const jobs = getJobs()

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 lg:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Jobs
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Search and manage every vehicle service job.
          </p>
        </div>

        <Link href="/jobs/new">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            New Job
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">
            All Jobs
          </CardTitle>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search jobs..."
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            {jobs.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-medium">
                  No jobs yet
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first job to see it here.
                </p>

                <Link href="/jobs/new">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Job
                  </Button>
                </Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-3 font-medium">
                      Job
                    </th>

                    <th className="pb-3 font-medium">
                      Customer
                    </th>

                    <th className="pb-3 font-medium">
                      Vehicle
                    </th>

                    <th className="pb-3 font-medium">
                      Service
                    </th>

                    <th className="pb-3 font-medium">
                      Total
                    </th>

                    <th className="pb-3 font-medium">
                      Status
                    </th>

                    <th className="pb-3"></th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="transition-colors hover:bg-muted/50"
                    >
                      <td className="py-4 font-medium">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="hover:underline"
                        >
                          {job.id}
                        </Link>
                      </td>

                      <td className="py-4">
                        {job.customerName || "Walk-in"}
                      </td>

                      <td className="py-4">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="block"
                        >
                          <p className="font-medium">
                            {job.vehicle}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {job.plate}
                          </p>
                        </Link>
                      </td>

                      <td className="py-4">
                        {job.services.length === 1
                          ? job.services[0].name
                          : `${job.services[0]?.name || "No service"} + ${
                              job.services.length - 1
                            } more`}
                      </td>

                      <td className="py-4 font-medium">
                        {job.total.toFixed(2)} LYD
                      </td>

                      <td className="py-4">
                        <Badge variant="outline">
                          {formatStatus(job.status)}
                        </Badge>
                      </td>

                      <td className="py-4 text-right">
                        <Link href={`/jobs/${job.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
