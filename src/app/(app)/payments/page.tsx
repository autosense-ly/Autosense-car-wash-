"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Banknote, Loader2, Search, Wallet } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

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
    case "paid": return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "partial": return "bg-amber-50 text-amber-700 border-amber-200"
    case "unpaid": return "bg-red-50 text-red-700 border-red-200"
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
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [collectingId, setCollectingId] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    const supabase = createClient()

    const [{ data: jobData, error: jobError }, { data: paymentData }] = await Promise.all([
      supabase
        .from("jobs")
        .select("id, plate_number, car_model, customer_name, total")
        .order("created_at", { ascending: false }),
      supabase.from("payments").select("id, job_id, amount, method, created_at"),
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
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return jobPayments[0]?.method ?? null
  }

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return jobs
    return jobs.filter((job) =>
      [job.plate_number, job.car_model, job.customer_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    )
  }, [jobs, search])

  const totals = useMemo(() => {
    const todays = payments.filter((p) => isToday(p.created_at))
    const collected = todays.reduce((sum, p) => sum + toNumber(p.amount), 0)
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

    const { data: { user } } = await supabase.auth.getUser()
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
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track payments and collection activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Collected Today</p>
                <p className="mt-2 text-2xl font-semibold">{totals.collected.toFixed(2)} LYD</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <Banknote className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cash</p>
                <p className="mt-2 text-2xl font-semibold">{totals.cash.toFixed(2)} LYD</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bank Transfer</p>
                <p className="mt-2 text-2xl font-semibold">{totals.bankTransfer.toFixed(2)} LYD</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <Banknote className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Payment History</CardTitle>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading...
            </div>
          )}

          {!loading && filteredJobs.length === 0 && (
            <div className="py-12 text-center">
              <p className="font-medium">No jobs found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a job first, then its payment will appear here.
              </p>
            </div>
          )}

          {!loading && filteredJobs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-3 font-medium">Job</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Vehicle</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Method</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredJobs.map((job) => {
                    const status = statusFor(job)
                    const latestMethod = latestMethodFor(job.id)
                    const shortId = job.id.slice(0, 8)

                    return (
                      <tr key={job.id}>
                        <td className="py-4">
                          <Link href={`/jobs/${job.id}`} className="font-medium hover:underline">
                            #{shortId}
                          </Link>
                        </td>
                        <td className="py-4">{job.customer_name || "Walk-in"}</td>
                        <td className="py-4">
                          <p className="font-medium">{job.car_model || "Unnamed vehicle"}</p>
                          <p className="text-xs text-muted-foreground">{job.plate_number}</p>
                        </td>
                        <td className="py-4 font-semibold">{toNumber(job.total).toFixed(2)} LYD</td>
                        <td className="py-4">
                          <Badge variant="outline" className={getPaymentStatusClass(status)}>
                            {status === "paid" ? "Paid" : status === "partial" ? "Partial" : "Unpaid"}
                          </Badge>
                        </td>
                        <td className="py-4">
                          {latestMethod ? (
                            formatMethod(latestMethod)
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          {status !== "paid" ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={collectingId === job.id}
                                onClick={() => collectPayment(job, "cash")}
                              >
                                Cash
                              </Button>
                              <Button
                                size="sm"
                                disabled={collectingId === job.id}
                                onClick={() => collectPayment(job, "bank_transfer")}
                              >
                                Bank Transfer
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Collected</span>
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
  )
}
