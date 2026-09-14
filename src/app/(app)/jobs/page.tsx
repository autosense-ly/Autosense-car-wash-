"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  CarFront,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  UserRound,
} from "lucide-react"
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

function getStatusClass(status: JobStatus) {
  switch (status) {
    case "waiting":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300"
    case "in_progress":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
    case "ready":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
    case "completed":
      return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
  }
}

function getPaymentClass(
  status: "unpaid" | "partial" | "paid",
) {
  switch (status) {
    case "paid":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
    case "partial":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300"
    case "unpaid":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
  }
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
        error instanceof Error ? error.message : "Couldn't load jobs"

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
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="space-y-6">
        <section className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-600 dark:text-blue-400">
              Operations
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">
              Jobs
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Search and manage every vehicle service job.
            </p>
          </div>

          <Link href="/jobs/new">
            <Button className="w-full gap-2 rounded-xl bg-blue-600 px-5 shadow-sm hover:bg-blue-700 sm:w-auto">
              <Plus className="h-4 w-4" />
              New Job
            </Button>
          </Link>
        </section>

        <Card className="rounded-2xl border-2 border-border bg-card shadow-md">
          <CardHeader className="flex flex-col gap-4 border-b border-border/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <CardTitle className="text-base font-semibold">
                All Jobs
              </CardTitle>
              {!loading && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {filteredJobs.length}{" "}
                  {filteredJobs.length === 1 ? "job" : "jobs"}
                  {search ? " found" : ""}
                </p>
              )}
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                className="h-10 rounded-xl border-border/80 bg-background pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading jobs...
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <CarFront className="h-6 w-6" />
                </div>

                <p className="mt-4 font-semibold">
                  {search ? "No matching jobs" : "No jobs yet"}
                </p>

                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  {search
                    ? "Try a different search."
                    : "Create your first job to see it here."}
                </p>

                {!search && (
                  <Link href="/jobs/new">
                    <Button className="mt-4 rounded-xl bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Job
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                      <th className="px-5 py-3.5">Job</th>
                      <th className="px-4 py-3.5">Customer</th>
                      <th className="px-4 py-3.5">Vehicle</th>
                      <th className="px-4 py-3.5">Service</th>
                      <th className="px-4 py-3.5">Total</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right"></th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border/50">
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
                          className="group transition-colors hover:bg-muted/30"
                        >
                          <td className="px-5 py-4 align-middle">
                            <Link
                              href={`/jobs/${job.id}`}
                              className="inline-flex items-center rounded-lg font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              #{job.id.slice(0, 8)}
                            </Link>
                          </td>

                          <td className="px-4 py-4 align-middle">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <UserRound className="h-4 w-4" />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-medium">
                                  {job.customer_name || "Walk-in"}
                                </p>
                                {job.customer_phone && (
                                  <p className="text-xs text-muted-foreground">
                                    {job.customer_phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-middle">
                            <Link
                              href={`/jobs/${job.id}`}
                              className="block rounded-lg transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              <p className="font-medium">
                                {job.car_model || "Unnamed vehicle"}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {job.plate_number || "No plate"}
                              </p>
                            </Link>
                          </td>

                          <td className="px-4 py-4 align-middle">
                            <p className="max-w-[190px] truncate text-muted-foreground">
                              {job.job_services?.length === 1
                                ? job.job_services[0].service_name
                                : job.job_services?.length
                                  ? `${job.job_services[0].service_name} + ${
                                      job.job_services.length - 1
                                    } more`
                                  : "No service"}
                            </p>
                          </td>

                          <td className="px-4 py-4 align-middle">
                            <p className="font-semibold">
                              {total.toFixed(2)} LYD
                            </p>

                            <Badge
                              variant="outline"
                              className={`mt-1.5 rounded-lg text-[10px] font-semibold ${getPaymentClass(
                                paymentStatus,
                              )}`}
                            >
                              {paymentStatus === "paid"
                                ? "Paid"
                                : paymentStatus === "partial"
                                  ? `${paid.toFixed(2)} paid`
                                  : "Unpaid"}
                            </Badge>
                          </td>

                          <td className="px-4 py-4 align-middle">
                            <Badge
                              variant="outline"
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                                job.status,
                              )}`}
                            >
                              {formatStatus(job.status)}
                            </Badge>
                          </td>

                          <td className="px-4 py-4 text-right align-middle">
                            <Link href={`/jobs/${job.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg text-muted-foreground opacity-70 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-foreground"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">
                                  Open job
                                </span>
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
