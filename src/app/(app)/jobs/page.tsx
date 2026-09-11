"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Loader2, MoreHorizontal, Plus, Search } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

type JobStatus =
  | "waiting"
  | "in_progress"
  | "ready"
  | "completed"
  | "cancelled"

type JobRow = {
  id: string
  customer_name: string | null
  customer_phone: string | null
  car_model: string | null
  plate_number: string | null
  status: JobStatus
  subtotal: number | string
  total: number | string
  created_at: string
  updated_at: string
  job_services:
    | {
        id: string
        service_name: string
        quantity: number | string
        unit_price: number | string
        line_total: number | string
      }[]
    | null
  assigned_worker: {
    name: string
  } | null
}

type PaymentRow = {
  job_id: string
  amount: number | string
}

function toNumber(value: number | string | null | undefined) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function formatStatus(status: JobStatus) {
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

function getPaymentStatus(
  total: number,
  paid: number,
): "unpaid" | "partial" | "paid" {
  if (paid <= 0) return "unpaid"
  if (paid >= total) return "paid"
  return "partial"
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  async function loadJobs() {
    setLoading(true)

    try {
      const supabase = createClient()

      const { data: authData, error: authError } =
        await supabase.auth.getUser()

      if (authError || !authData.user) {
        throw new Error("You are not logged in")
      }

      const { data: profile, error: profileError } = await supabase
        .from("app_users")
        .select("business_id")
        .eq("id", authData.user.id)
        .single()

      if (profileError || !profile) {
        throw new Error("Couldn't find your business profile")
      }

      const [jobsResult, paymentsResult] = await Promise.all([
        supabase
          .from("jobs")
          .select(
            "id, customer_name, customer_phone, car_model, plate_number, status, subtotal, total, created_at, updated_at, job_services(id, service_name, quantity, unit_price, line_total), assigned_worker:workers(name)",
          )
          .eq("business_id", profile.business_id)
          .order("created_at", { ascending: false }),

        supabase
          .from("payments")
          .select("job_id, amount")
          .eq("business_id", profile.business_id),
      ])

      if (jobsResult.error) {
        throw new Error(
          `Couldn't load jobs: ${jobsResult.error.message}`,
        )
      }

      if (paymentsResult.error) {
        throw new Error(
          `Couldn't load payments: ${paymentsResult.error.message}`,
        )
      }

      setJobs((jobsResult.data as unknown as JobRow[]) ?? [])
      setPayments((paymentsResult.data as PaymentRow[]) ?? [])
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Couldn't load jobs"

      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  const paymentTotals = useMemo(() => {
    const totals = new Map<string, number>()

    for (const payment of payments) {
      totals.set(
        payment.job_id,
        (totals.get(payment.job_id) ?? 0) +
          toNumber(payment.amount),
      )
    }

    return totals
  }, [payments])

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return jobs

    return jobs.filter((job) => {
      const serviceNames =
        job.job_services
          ?.map((service) => service.service_name)
          .join(" ") ?? ""

      return [
        job.id,
        job.customer_name,
        job.customer_phone,
        job.car_model,
        job.plate_number,
        job.assigned_worker?.name,
        serviceNames,
        formatStatus(job.status),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    })
  }, [jobs, search])

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
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading jobs...
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-medium">
                  {search ? "No matching jobs" : "No jobs yet"}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {search
                    ? "Try a different search."
                    : "Create your first job to see it here."}
                </p>

                {!search && (
                  <Link href="/jobs/new">
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Job
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-3 font-medium">Job</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Vehicle</th>
                    <th className="pb-3 font-medium">Service</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredJobs.map((job) => {
                    const total = toNumber(job.total)
                    const paid = paymentTotals.get(job.id) ?? 0
                    const paymentStatus = getPaymentStatus(
                      total,
                      paid,
                    )

                    return (
                      <tr
                        key={job.id}
                        className="transition-colors hover:bg-muted/50"
                      >
                        <td className="py-4 font-medium">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="hover:underline"
                          >
                            #{job.id.slice(0, 8)}
                          </Link>
                        </td>

                        <td className="py-4">
                          {job.customer_name || "Walk-in"}
                        </td>

                        <td className="py-4">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="block"
                          >
                            <p className="font-medium">
                              {job.car_model || "Unnamed vehicle"}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {job.plate_number || "No plate"}
                            </p>
                          </Link>
                        </td>

                        <td className="py-4">
                          {job.job_services?.length === 1
                            ? job.job_services[0].service_name
                            : job.job_services?.length
                              ? `${job.job_services[0].service_name} + ${
                                  job.job_services.length - 1
                                } more`
                              : "No service"}
                        </td>

                        <td className="py-4 font-medium">
                          {total.toFixed(2)} LYD
                          <div className="mt-1 text-xs text-muted-foreground">
                            {paymentStatus === "paid"
                              ? "Paid"
                              : paymentStatus === "partial"
                                ? `${paid.toFixed(2)} paid`
                                : "Unpaid"}
                          </div>
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
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
