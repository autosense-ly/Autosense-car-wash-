"use client"

import Link from "next/link"
import { ArrowLeft, Car, Clock3, CreditCard, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { getJob } from "@/lib/api/jobs"
import type { Job } from "@/lib/types/job"

function formatStatus(status: Job["status"]) {
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

function getStatusClass(status: Job["status"]) {
  switch (status) {
    case "waiting":
      return "bg-amber-50 text-amber-700 border-amber-200"
    case "in_progress":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "ready":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "completed":
      return "bg-muted text-muted-foreground"
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200"
  }
}

export default function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = require("react").use(params) as { id: string }
  const job = getJob(id)

  if (!job) {
    return (
      <div className="mx-auto w-full max-w-[1100px] p-4 lg:p-6">
        <div className="space-y-4">
          <Link href="/jobs">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Jobs
            </Button>
          </Link>

          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-xl font-semibold">
                Job not found
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                This job does not exist in the current job repository.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6 p-4 lg:p-6">

      <div className="flex items-center gap-3">
        <Link href="/jobs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Job {job.id}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            View vehicle, services, status and payment information.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Car className="h-4 w-4 text-blue-600" />
              Vehicle
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">

              <div>
                <p className="text-xs text-muted-foreground">
                  Vehicle
                </p>
                <p className="mt-1 font-medium">
                  {job.vehicle}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Plate Number
                </p>
                <p className="mt-1 font-medium">
                  {job.plate}
                </p>
              </div>

              {job.customerName && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Customer
                  </p>
                  <p className="mt-1 font-medium">
                    {job.customerName}
                  </p>
                </div>
              )}

              {job.customerPhone && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Phone
                  </p>
                  <p className="mt-1 font-medium">
                    {job.customerPhone}
                  </p>
                </div>
              )}

            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Status
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Badge
              variant="outline"
              className={getStatusClass(job.status)}
            >
              {formatStatus(job.status)}
            </Badge>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              {new Date(job.createdAt).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Services
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="divide-y">

              {job.services.map((service) => (
                <div
                  key={service.serviceId}
                  className="flex justify-between gap-4 py-4"
                >
                  <div>
                    <p className="font-medium">
                      {service.name}
                    </p>

                    {service.details && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {service.details.brand && (
                          <span>
                            {service.details.brand}
                          </span>
                        )}

                        {service.details.grade && (
                          <span>
                            {" "}· {service.details.grade}
                          </span>
                        )}

                        {service.details.quantity !== undefined && (
                          <span>
                            {" "}· {service.details.quantity} L
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <span className="font-medium whitespace-nowrap">
                    {service.total.toFixed(2)} LYD
                  </span>
                </div>
              ))}

            </div>

            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Subtotal
                </span>
                <span>
                  {job.subtotal.toFixed(2)} LYD
                </span>
              </div>

              <div className="mt-2 flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>
                  {job.total.toFixed(2)} LYD
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4 text-blue-600" />
              Payment
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-semibold">
              {job.total.toFixed(2)} LYD
            </p>

            <p className="mt-1 text-sm text-muted-foreground capitalize">
              {job.paymentStatus}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="h-4 w-4 text-blue-600" />
              Job Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">

            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                Worker
              </span>

              <span>
                {job.worker || "Not assigned"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                Position
              </span>

              <span>
                {job.position || "Not assigned"}
              </span>
            </div>

            {job.notes && (
              <div>
                <p className="text-muted-foreground">
                  Notes
                </p>

                <p className="mt-1">
                  {job.notes}
                </p>
              </div>
            )}

          </CardContent>
        </Card>

      </div>
    </div>
  )
}
