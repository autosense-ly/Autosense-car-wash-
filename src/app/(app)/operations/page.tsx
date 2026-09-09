"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Car, Clock3, Loader2, Plus, Search, UserRound } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

type JobStatus = "waiting" | "in_progress" | "ready" | "completed" | "cancelled"
type Method = "cash" | "bank_transfer"
type PaymentStatus = "paid" | "partial" | "unpaid"

type Payment = {
  id: string
  job_id: string
  amount: number | string
}

type Job = {
  id: string
  plate_number: string
  car_model: string | null
  customer_name: string | null
  status: JobStatus
  total: number | string
  created_at: string
  job_services: { service_name: string }[] | null
  assigned_worker: { name: string } | null
}

function toNumber(value: number | string | null | undefined): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function formatStatus(status: JobStatus) {
  switch (status) {
    case "waiting": return "Waiting"
    case "in_progress": return "In Progress"
    case "ready": return "Ready"
    case "completed": return "Completed"
    case "cancelled": return "Cancelled"
  }
}

function getStatusClass(status: JobStatus) {
  if (status === "in_progress") return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
  if (status === "ready") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
  if (status === "completed") return "bg-muted text-muted-foreground"
  if (status === "cancelled") return "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
  return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
}

function getPaymentBadgeClass(status: PaymentStatus) {
  if (status === "paid") return "bg-emerald-50 text-emerald-700 border-emerald-200"
  if (status === "partial") return "bg-amber-50 text-amber-700 border-amber-200"
  return "bg-red-50 text-red-700 border-red-200"
}

function getNextStatus(status: JobStatus): JobStatus | null {
  switch (status) {
    case "waiting": return "in_progress"
    case "in_progress": return "ready"
    case "ready": return "completed"
    default: return null
  }
}

function getNextActionLabel(status: JobStatus) {
  switch (status) {
    case "waiting": return "Start Job"
    case "in_progress": return "Mark Ready"
    case "ready": return "Complete"
    default: return null
  }
}

export default function OperationsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [collectingId, setCollectingId] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    const supabase = createClient()

    const [{ data: jobData, error: jobError }, { data: paymentData }] = await Promise.all([
      supabase
        .from("jobs")
        .select("*, job_services(service_name), assigned_worker:workers(name)")
        .order("created_at", { ascending: false }),
      supabase.from("payments").select("id, job_id, amount"),
    ])

    if (jobError) {
      toast.error("Couldn't load jobs: " + jobError.message)
    } else {
      setJobs((jobData as unknown as Job[]) ?? [])
    }
    setPayments((paymentData as Payment[]) ?? [])
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

  function paymentStatusFor(job: Job): PaymentStatus {
    const paid = paidAmountFor(job.id)
    const total = toNumber(job.total)
    if (paid <= 0) return "unpaid"
    if (paid < total) return "partial"
    return "paid"
  }

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return jobs
    return jobs.filter((job) => {
      return (
        job.plate_number.toLowerCase().includes(query) ||
        (job.car_model ?? "").toLowerCase().includes(query) ||
        (job.customer_name ?? "").toLowerCase().includes(query) ||
        (job.assigned_worker?.name ?? "").toLowerCase().includes(query)
      )
    })
  }, [jobs, search])

  const counts = useMemo(() => {
    return {
      waiting: jobs.filter((j) => j.status === "waiting").length,
      inProgress: jobs.filter((j) => j.status === "in_progress").length,
      ready: jobs.filter((j) => j.status === "ready").length,
      completed: jobs.filter((j) => j.status === "completed").length,
    }
  }, [jobs])

  async function advanceJob(job: Job) {
    const nextStatus = getNextStatus(job.status)
    if (!nextStatus) return

    const supabase = createClient()
    const { error } = await supabase
      .from("jobs")
      .update({ status: nextStatus })
      .eq("id", job.id)

    if (error) {
      toast.error("Couldn't update job: " + error.message)
      return
    }

    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: nextStatus } : j))
    )
  }

  async function collectPayment(job: Job, method: Method) {
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

    toast.success(`Marked as paid via ${method === "cash" ? "Cash" : "Bank Transfer"}`)
    loadData()
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 lg:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Operations</h1>
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
            <p className="text-xs text-muted-foreground">Waiting</p>
            <p className="mt-1 text-xl font-semibold">{counts.waiting}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="mt-1 text-xl font-semibold">{counts.inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Ready</p>
            <p className="mt-1 text-xl font-semibold">{counts.ready}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="mt-1 text-xl font-semibold">{counts.completed}</p>
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
              placeholder="Search plate, customer, vehicle or worker..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading jobs...
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="font-medium">No jobs found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a job or change your search.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => {
              const nextStatus = getNextStatus(job.status)
              const actionLabel = getNextActionLabel(job.status)
              const shortId = job.id.slice(0, 8)
              const payStatus = paymentStatusFor(job)

              return (
                <Card key={job.id} className="transition-shadow hover:shadow-sm">
                  <CardContent className="p-4 lg:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="flex items-center gap-4 lg:w-[280px]"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                          <Car className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{job.car_model || "Unnamed vehicle"}</p>
                            <span className="text-xs text-muted-foreground">#{shortId}</span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {job.plate_number} - {job.customer_name || "Walk-in"}
                          </p>
                        </div>
                      </Link>

                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {job.job_services?.map((s) => s.service_name).join(" + ") || "No services"}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <UserRound className="h-3.5 w-3.5" />
                            {job.assigned_worker?.name || "Unassigned"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock3 className="h-3.5 w-3.5" />
                            {new Date(job.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span>{toNumber(job.total).toFixed(2)} LYD</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`w-fit border-0 ${getStatusClass(job.status)}`}>
                          {formatStatus(job.status)}
                        </Badge>
                        <Badge variant="outline" className={`w-fit ${getPaymentBadgeClass(payStatus)}`}>
                          {payStatus === "paid" ? "Paid" : payStatus === "partial" ? "Partial" : "Unpaid"}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        {nextStatus && actionLabel && (
                          <Button variant="outline" size="sm" onClick={() => advanceJob(job)}>
                            {actionLabel}
                          </Button>
                        )}

                        {payStatus !== "paid" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                disabled={collectingId === job.id}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Mark Paid
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => collectPayment(job, "cash")}>
                                Cash
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => collectPayment(job, "bank_transfer")}>
                                Bank Transfer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
      )}
    </div>
  )
}
