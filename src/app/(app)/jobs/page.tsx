"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  CarFront,
  Loader2,
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
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/lib/i18n/language-provider"
import { jobDetailsTranslations } from "@/lib/i18n/job-details"

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
  const { language, t } = useLanguage()

  const [jobs, setJobs] = useState<JobRow[]>([])
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const formatStatus = (status: JobStatus) => {
    const labels = jobDetailsTranslations[language]

    switch (status) {
      case "waiting":
        return labels.waiting
      case "in_progress":
        return labels.inProgress
      case "ready":
        return labels.ready
      case "completed":
        return labels.completed
      case "cancelled":
        return labels.cancelled
    }
  }

  async function loadJobs() {
    setLoading(true)

    try {
      const supabase = createClient()

      const { data: authData, error: authError } =
        await supabase.auth.getUser()

      if (authError || !authData.user) {
        throw new Error(t.jobs.notLoggedIn)
      }

      const { data: profile, error: profileError } = await supabase
        .from("app_users")
        .select("business_id")
        .eq("id", authData.user.id)
        .single()

      if (profileError || !profile) {
        throw new Error(t.jobs.businessNotFound)
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
          `${t.jobs.loadFailed}: ${jobsResult.error.message}`,
        )
      }

      if (paymentsResult.error) {
        throw new Error(
          `${t.jobs.paymentsLoadFailed}: ${paymentsResult.error.message}`,
        )
      }

      setJobs((jobsResult.data as unknown as JobRow[]) ?? [])
      setPayments((paymentsResult.data as PaymentRow[]) ?? [])
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t.jobs.loadFailed

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
  }, [jobs, search, language])

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="space-y-5">
        <section className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-600 dark:text-blue-400">
              {t.common.operations}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">
              {t.common.jobs}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.jobs.searchManageDescription}
            </p>
          </div>

          <Link href="/jobs/new">
            <Button className="w-full gap-2 rounded-xl bg-blue-600 px-5 shadow-sm hover:bg-blue-700 sm:w-auto">
              <Plus className="h-4 w-4" />
              {t.jobs.newJob}
            </Button>
          </Link>
        </section>

        <Card size="sm" className="premium-hover">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">{t.jobs.allJobs}</p>
                {!loading && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {filteredJobs.length}{" "}
                    {filteredJobs.length === 1
                      ? t.jobs.jobSingular
                      : t.jobs.jobPlural}
                    {search ? ` ${t.jobs.found}` : ""}
                  </p>
                )}
              </div>

              <div className="relative w-full max-w-xl sm:w-80">
                <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t.jobs.searchJobs}
                  className="h-10 rounded-xl border-border/70 bg-background ps-9 text-sm shadow-none focus-visible:ring-2"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <Card size="sm" className="premium-hover">
            <CardContent className="flex min-h-[180px] items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="me-2 h-5 w-5 animate-spin" />
              {t.jobs.loadingJobs}
            </CardContent>
          </Card>
        )}

        {!loading && (
          <div className="space-y-3">
            {filteredJobs.length === 0 ? (
              <Card size="sm" className="premium-hover">
                <CardContent className="flex min-h-[180px] flex-col items-center justify-center px-4 py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <CarFront className="h-6 w-6" />
                  </div>

                  <p className="mt-4 font-semibold">
                    {search ? t.jobs.noMatchingJobs : t.jobs.noJobsYet}
                  </p>

                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    {search
                      ? t.jobs.tryDifferentSearch
                      : t.jobs.createFirstJob}
                  </p>

                  {!search && (
                    <Link href="/jobs/new">
                      <Button className="mt-4 rounded-xl bg-blue-600 hover:bg-blue-700">
                        <Plus className="me-2 h-4 w-4" />
                        {t.jobs.createJob}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredJobs.map((job) => {
                const total = toNumber(job.total)
                const paid = paymentTotals.get(job.id) ?? 0
                const paymentStatus = getPaymentStatus(total, paid)

                return (
                  <Card
                    key={job.id}
                    size="sm"
                    className="premium-hover"
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="flex min-w-0 items-center gap-3.5 xl:w-[280px] xl:shrink-0"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                            <CarFront className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-2">
                              <p className="truncate text-[13px] font-semibold sm:text-sm">
                                {job.car_model || t.jobs.unnamedVehicle}
                              </p>
                              <span className="hidden shrink-0 text-[10px] text-muted-foreground sm:inline">
                                #{job.id.slice(0, 8)}
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">
                              {job.plate_number || t.jobs.noPlate}
                            </p>
                          </div>
                        </Link>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold">
                            {job.job_services?.length === 1
                              ? job.job_services[0].service_name
                              : job.job_services?.length
                                ? `${job.job_services[0].service_name} + ${
                                    job.job_services.length - 1
                                  } ${t.jobs.more}`
                                : t.jobs.noService}
                          </p>

                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-muted-foreground sm:text-xs">
                            <span className="flex min-w-0 items-center gap-1">
                              <UserRound className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">
                                {job.customer_name || t.jobs.walkIn}
                              </span>
                            </span>

                            {job.customer_phone && (
                              <span className="truncate">
                                {job.customer_phone}
                              </span>
                            )}

                            <span className="font-medium text-foreground/80">
                              {total.toFixed(2)} LYD
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`w-fit rounded-full border-0 px-2.5 py-1 text-[10px] font-medium ${getStatusClass(
                              job.status,
                            )}`}
                          >
                            {formatStatus(job.status)}
                          </Badge>

                          <Badge
                            variant="outline"
                            className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-medium ${getPaymentClass(
                              paymentStatus,
                            )}`}
                          >
                            {paymentStatus === "paid"
                              ? t.jobs.paid
                              : paymentStatus === "partial"
                                ? `${paid.toFixed(2)} ${t.jobs.paid.toLowerCase()}`
                                : t.jobs.unpaid}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2 xl:shrink-0">
                          <Link href={`/jobs/${job.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 rounded-xl px-3 text-xs"
                            >
                              {t.jobs.openJob}
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
        )}
      </div>
    </div>
  )
}
