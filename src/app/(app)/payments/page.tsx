"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Banknote,
  Loader2,
  Search,
  Wallet,
  CarFront,
  ArrowRight,
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
import { useLanguage } from "@/lib/i18n/language-provider"
import { paymentsTranslations } from "@/lib/i18n/payments"

type PaymentStatus = "paid" | "partial" | "unpaid"
type Method = "cash" | "bank_transfer"

type JobRow = {
  id: string
  plate_number: string
  car_model: string | null
  customer_name: string | null
  total: number | string
}

type PaymentRow = {
  id: string
  job_id: string
  amount: number | string
  method: Method
  created_at: string
}

function toNumber(value: number | string | null | undefined): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function formatMethod(method: Method) {
  return method === "cash" ? "Cash" : "Bank Transfer"
}

function getPaymentStatusClass(status: PaymentStatus) {
  switch (status) {
    case "paid":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-400"
    case "partial":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-400"
    case "unpaid":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400"
  }
}

function isToday(dateString: string) {
  const d = new Date(dateString)
  const now = new Date()

  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export default function PaymentsPage() {
  const { language } = useLanguage()
  const t = paymentsTranslations[language]

  const [jobs, setJobs] = useState<JobRow[]>([])
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [collectingId, setCollectingId] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)

    const supabase = createClient()

    const [
      { data: jobData, error: jobError },
      { data: paymentData },
    ] = await Promise.all([
      supabase
        .from("jobs")
        .select("id, plate_number, car_model, customer_name, total")
        .order("created_at", { ascending: false }),
      supabase
        .from("payments")
        .select("id, job_id, amount, method, created_at"),
    ])

    if (jobError) {
      toast.error("Couldn't load jobs: " + jobError.message)
      setLoading(false)
      return
    }

    setJobs((jobData as JobRow[]) ?? [])
    setPayments((paymentData as PaymentRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  function paidAmountFor(jobId: string) {
    return payments
      .filter((p) => p.job_id === jobId)
      .reduce((sum, p) => sum + toNumber(p.amount), 0)
  }

  function statusFor(job: JobRow): PaymentStatus {
    const paid = paidAmountFor(job.id)
    const total = toNumber(job.total)

    if (paid <= 0) return "unpaid"
    if (paid < total) return "partial"
    return "paid"
  }

  function latestMethodFor(jobId: string): Method | null {
    const jobPayments = payments
      .filter((p) => p.job_id === jobId)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime(),
      )

    return jobPayments[0]?.method ?? null
  }

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase()

    if (!q) return jobs

    return jobs.filter((job) =>
      [job.plate_number, job.car_model, job.customer_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    )
  }, [jobs, search])

  const totals = useMemo(() => {
    const todays = payments.filter((p) => isToday(p.created_at))

    const collected = todays.reduce(
      (sum, p) => sum + toNumber(p.amount),
      0,
    )

    const cash = todays
      .filter((p) => p.method === "cash")
      .reduce((sum, p) => sum + toNumber(p.amount), 0)

    const bankTransfer = todays
      .filter((p) => p.method === "bank_transfer")
      .reduce((sum, p) => sum + toNumber(p.amount), 0)

    return { collected, cash, bankTransfer }
  }, [payments])

  async function collectPayment(job: JobRow, method: Method) {
    setCollectingId(job.id)

    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Not logged in")
      setCollectingId(null)
      return
    }

    const { data: profile } = await supabase
      .from("app_users")
      .select("business_id")
      .eq("id", user.id)
      .single()

    if (!profile) {
      toast.error("Couldn't find your business")
      setCollectingId(null)
      return
    }

    const remaining = toNumber(job.total) - paidAmountFor(job.id)

    const { error } = await supabase.from("payments").insert({
      business_id: profile.business_id,
      job_id: job.id,
      amount: remaining,
      method,
      collected_by: user.id,
    })

    setCollectingId(null)

    if (error) {
      toast.error("Couldn't record payment: " + error.message)
      return
    }

    toast.success(`Marked as paid via ${formatMethod(method)}`)
    loadData()
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="space-y-6">
        <section className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400">
              Finance
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Payments
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track payments and collection activity.
            </p>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <Card className="rounded-2xl border-2 border-border shadow-md transition-shadow hover:shadow-lg dark:border-border/90">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Collected Today
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {totals.collected.toFixed(2)} LYD
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Total payments received
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <Banknote className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-2 border-border shadow-md transition-shadow hover:shadow-lg dark:border-border/90">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Cash
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {totals.cash.toFixed(2)} LYD
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Cash collected today
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                  <Wallet className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-2 border-border shadow-md transition-shadow hover:shadow-lg dark:border-border/90">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Bank Transfer
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {totals.bankTransfer.toFixed(2)} LYD
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Transfers collected today
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                  <Banknote className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="rounded-2xl border-2 border-border shadow-md dark:border-border/90">
          <CardHeader className="gap-4 border-b border-border/60 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">
                  Payment History
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  View and collect outstanding job payments.
                </p>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t.searchPlaceholder}
                  className="h-9 rounded-xl pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading && (
              <div className="flex items-center justify-center py-14 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading payments...
              </div>
            )}

            {!loading && filteredJobs.length === 0 && (
              <div className="mx-4 my-4 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center sm:mx-5">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                  <Banknote className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="mt-4 font-medium">{t.noJobsFound}</p>
                <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                  Create a job first, then its payment will appear here.
                </p>
              </div>
            )}

            {!loading && filteredJobs.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/20 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                      <th className="px-5 py-3">Job</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Vehicle</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border/50">
                    {filteredJobs.map((job) => {
                      const status = statusFor(job)
                      const latestMethod = latestMethodFor(job.id)
                      const shortId = job.id.slice(0, 8)

                      return (
                        <tr
                          key={job.id}
                          className="transition-colors hover:bg-muted/20"
                        >
                          <td className="px-5 py-4">
                            <Link
                              href={`/jobs/${job.id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              #{shortId}
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </td>

                          <td className="px-4 py-4 font-medium">
                            {job.customer_name || "Walk-in"}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <CarFront className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium">
                                  {job.car_model || "Unnamed vehicle"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {job.plate_number}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 font-semibold">
                            {toNumber(job.total).toFixed(2)} LYD
                          </td>

                          <td className="px-4 py-4">
                            <Badge
                              variant="outline"
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getPaymentStatusClass(status)}`}
                            >
                              {status === "paid"
                                ? "Paid"
                                : status === "partial"
                                  ? "Partial"
                                  : "Unpaid"}
                            </Badge>
                          </td>

                          <td className="px-4 py-4">
                            {latestMethod ? (
                              <span className="text-sm font-medium">
                                {formatMethod(latestMethod)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            {status !== "paid" ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 rounded-lg"
                                  disabled={collectingId === job.id}
                                  onClick={() =>
                                    collectPayment(job, "cash")
                                  }
                                >
                                  {collectingId === job.id && (
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                  )}
                                  Cash
                                </Button>

                                <Button
                                  size="sm"
                                  className="h-8 rounded-lg"
                                  disabled={collectingId === job.id}
                                  onClick={() =>
                                    collectPayment(job, "bank_transfer")
                                  }
                                >
                                  Bank Transfer
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                Collected
                              </span>
                            )}
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
