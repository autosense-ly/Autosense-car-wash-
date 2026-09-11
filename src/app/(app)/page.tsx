"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Car,
  CircleDollarSign,
  Clock3,
  ClipboardCheck,
  Loader2,
  Plus,
  Receipt,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/stat-card"
import { RecentJobs, type RecentJob } from "@/components/dashboard/recent-jobs"
import {
  ServiceBreakdown,
  type ServiceBreakdownItem,
} from "@/components/dashboard/service-breakdown"
import { createClient } from "@/lib/supabase/client"

type JobStatus =
  | "waiting"
  | "in_progress"
  | "ready"
  | "completed"
  | "cancelled"

type DashboardJob = {
  id: string
  plate_number: string | null
  car_model: string | null
  customer_name: string | null
  status: JobStatus
  created_at: string
  job_services: {
    service_name: string
    line_total: number | string
  }[] | null
  assigned_worker: {
    name: string
  } | null
}

type Payment = {
  amount: number | string
  method: "cash" | "bank_transfer"
  created_at: string
}

type Expense = {
  amount: number | string
}

function toNumber(value: number | string | null | undefined): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function formatMoney(value: number) {
  return `${value.toFixed(2)} LYD`
}

function formatPercentage(value: number | null) {
  if (value === null || !Number.isFinite(value)) return null

  const rounded = Math.abs(value) < 0.05 ? 0 : value
  return `${rounded >= 0 ? "+" : ""}${rounded.toFixed(1)}%`
}

function getTrend(
  today: number,
  yesterday: number,
): {
  value: string | undefined
  type: "up" | "down" | "neutral"
} {
  if (yesterday === 0) {
    return {
      value: undefined,
      type: "neutral",
    }
  }

  const percentage = ((today - yesterday) / yesterday) * 100
  const formatted = formatPercentage(percentage)

  if (!formatted) {
    return {
      value: undefined,
      type: "neutral",
    }
  }

  return {
    value: formatted,
    type:
      percentage > 0
        ? "up"
        : percentage < 0
          ? "down"
          : "neutral",
  }
}

function getTripoliDateParts() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Tripoli",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  const parts = formatter.formatToParts(new Date())
  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value
  const day = parts.find((part) => part.type === "day")?.value

  if (!year || !month || !day) {
    throw new Error("Could not determine today's date")
  }

  return { year, month, day }
}

function getDateRange() {
  const { year, month, day } = getTripoliDateParts()
  const today = `${year}-${month}-${day}`

  const previousDate = new Date(`${today}T12:00:00+02:00`)
  previousDate.setUTCDate(previousDate.getUTCDate() - 1)

  const previousYear = previousDate.getUTCFullYear()
  const previousMonth = String(previousDate.getUTCMonth() + 1).padStart(2, "0")
  const previousDay = String(previousDate.getUTCDate()).padStart(2, "0")
  const yesterday = `${previousYear}-${previousMonth}-${previousDay}`

  return {
    today,
    yesterday,
    todayStart: `${today}T00:00:00+02:00`,
    todayEnd: `${today}T23:59:59.999+02:00`,
    yesterdayStart: `${yesterday}T00:00:00+02:00`,
    yesterdayEnd: `${yesterday}T23:59:59.999+02:00`,
  }
}

function formatDashboardDate(dateString: string) {
  const date = new Date(`${dateString}T12:00:00+02:00`)

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "Africa/Tripoli",
  }).format(date)
}

function getGreeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      hour12: false,
      timeZone: "Africa/Tripoli",
    }).format(new Date()),
  )

  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("there")
  const [dashboardDate, setDashboardDate] = useState("")
  const [revenue, setRevenue] = useState(0)
  const [yesterdayRevenue, setYesterdayRevenue] = useState(0)
  const [carsToday, setCarsToday] = useState(0)
  const [yesterdayCars, setYesterdayCars] = useState(0)
  const [inProgress, setInProgress] = useState(0)
  const [completed, setCompleted] = useState(0)
  const [yesterdayCompleted, setYesterdayCompleted] = useState(0)
  const [cash, setCash] = useState(0)
  const [bankTransfer, setBankTransfer] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [expenseCount, setExpenseCount] = useState(0)
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([])
  const [serviceBreakdown, setServiceBreakdown] = useState<ServiceBreakdownItem[]>([])

  async function loadDashboard() {
    setLoading(true)

    try {
      const supabase = createClient()

      const { data: authData, error: authError } = await supabase.auth.getUser()

      if (authError || !authData.user) {
        throw new Error("You are not logged in")
      }

      const { data: profile, error: profileError } = await supabase
        .from("app_users")
        .select("business_id, name")
        .eq("id", authData.user.id)
        .single()

      if (profileError || !profile) {
        throw new Error("Couldn't find your business profile")
      }

      setUserName(profile.name)

      const range = getDateRange()
      setDashboardDate(formatDashboardDate(range.today))

      const [
        todayJobsResult,
        yesterdayJobsResult,
        todayPaymentsResult,
        yesterdayPaymentsResult,
        todayExpensesResult,
      ] = await Promise.all([
        supabase
          .from("jobs")
          .select(
            "id, plate_number, car_model, customer_name, status, created_at, job_services(service_name, line_total), assigned_worker:workers(name)",
          )
          .eq("business_id", profile.business_id)
          .gte("created_at", range.todayStart)
          .lte("created_at", range.todayEnd)
          .order("created_at", { ascending: false }),

        supabase
          .from("jobs")
          .select("id, status")
          .eq("business_id", profile.business_id)
          .gte("created_at", range.yesterdayStart)
          .lte("created_at", range.yesterdayEnd),

        supabase
          .from("payments")
          .select("amount, method, created_at")
          .eq("business_id", profile.business_id)
          .gte("created_at", range.todayStart)
          .lte("created_at", range.todayEnd),

        supabase
          .from("payments")
          .select("amount, method, created_at")
          .eq("business_id", profile.business_id)
          .gte("created_at", range.yesterdayStart)
          .lte("created_at", range.yesterdayEnd),

        supabase
          .from("expenses")
          .select("amount")
          .eq("business_id", profile.business_id)
          .eq("expense_date", range.today),
      ])

      if (todayJobsResult.error) {
        throw new Error(`Couldn't load today's jobs: ${todayJobsResult.error.message}`)
      }

      if (yesterdayJobsResult.error) {
        throw new Error(`Couldn't load yesterday's jobs: ${yesterdayJobsResult.error.message}`)
      }

      if (todayPaymentsResult.error) {
        throw new Error(
          `Couldn't load today's payments: ${todayPaymentsResult.error.message}`,
        )
      }

      if (yesterdayPaymentsResult.error) {
        throw new Error(
          `Couldn't load yesterday's payments: ${yesterdayPaymentsResult.error.message}`,
        )
      }

      if (todayExpensesResult.error) {
        throw new Error(
          `Couldn't load today's expenses: ${todayExpensesResult.error.message}`,
        )
      }

      const todayJobs =
        (todayJobsResult.data as unknown as DashboardJob[]) ?? []
      const yesterdayJobs =
        (yesterdayJobsResult.data as { id: string; status: JobStatus }[]) ?? []

      const todayPayments =
        (todayPaymentsResult.data as Payment[]) ?? []
      const yesterdayPayments =
        (yesterdayPaymentsResult.data as Payment[]) ?? []

      const todayExpenses =
        (todayExpensesResult.data as Expense[]) ?? []

      const todayRevenue = todayPayments.reduce(
        (sum, payment) => sum + toNumber(payment.amount),
        0,
      )

      const yesterdayRevenueValue = yesterdayPayments.reduce(
        (sum, payment) => sum + toNumber(payment.amount),
        0,
      )

      const cashValue = todayPayments
        .filter((payment) => payment.method === "cash")
        .reduce((sum, payment) => sum + toNumber(payment.amount), 0)

      const bankValue = todayPayments
        .filter((payment) => payment.method === "bank_transfer")
        .reduce((sum, payment) => sum + toNumber(payment.amount), 0)

      const expenseValue = todayExpenses.reduce(
        (sum, expense) => sum + toNumber(expense.amount),
        0,
      )

      setRevenue(todayRevenue)
      setYesterdayRevenue(yesterdayRevenueValue)
      setCarsToday(todayJobs.length)
      setYesterdayCars(yesterdayJobs.length)
      setInProgress(
        todayJobs.filter((job) => job.status === "in_progress").length,
      )
      setCompleted(
        todayJobs.filter((job) => job.status === "completed").length,
      )
      setYesterdayCompleted(
        yesterdayJobs.filter((job) => job.status === "completed").length,
      )
      setCash(cashValue)
      setBankTransfer(bankValue)
      setExpenses(expenseValue)
      setExpenseCount(todayExpenses.length)

      setRecentJobs(
        todayJobs.slice(0, 5).map((job) => ({
          id: `#${job.id.slice(0, 8)}`,
          vehicle: job.car_model || "Unnamed vehicle",
          plate: job.plate_number || "No plate",
          service:
            job.job_services?.map((service) => service.service_name).join(" + ") ||
            "No services",
          worker: job.assigned_worker?.name || "Unassigned",
          status: job.status,
          time: new Date(job.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
      )

      const serviceMap = new Map<
        string,
        { jobs: Set<string>; revenue: number }
      >()

      for (const job of todayJobs) {
        for (const service of job.job_services ?? []) {
          const name = service.service_name || "Unnamed service"

          if (!serviceMap.has(name)) {
            serviceMap.set(name, {
              jobs: new Set<string>(),
              revenue: 0,
            })
          }

          const entry = serviceMap.get(name)!
          entry.jobs.add(job.id)
          entry.revenue += toNumber(service.line_total)
        }
      }

      const serviceEntries = Array.from(serviceMap.entries())
        .map(([name, value]) => ({
          name,
          jobs: value.jobs.size,
          revenue: value.revenue,
        }))
        .sort((a, b) => b.jobs - a.jobs)
        .slice(0, 5)

      const totalServiceJobs = serviceEntries.reduce(
        (sum, service) => sum + service.jobs,
        0,
      )

      setServiceBreakdown(
        serviceEntries.map((service) => ({
          name: service.name,
          jobs: service.jobs,
          revenue: formatMoney(service.revenue),
          percent:
            totalServiceJobs > 0
              ? (service.jobs / totalServiceJobs) * 100
              : 0,
        })),
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Couldn't load dashboard"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const revenueTrend = getTrend(revenue, yesterdayRevenue)
  const carsTrend = getTrend(carsToday, yesterdayCars)
  const completedTrend = getTrend(completed, yesterdayCompleted)
  const estimatedNet = revenue - expenses

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 lg:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">
            {loading ? "Loading..." : dashboardDate}
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {getGreeting()}, {userName}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happening at your car wash today.
          </p>
        </div>

        <Link href="/jobs/new">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            New Job
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading dashboard...
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Today's Revenue"
              value={formatMoney(revenue)}
              subtitle="vs yesterday"
              trend={revenueTrend.value}
              trendType={revenueTrend.type}
              icon={CircleDollarSign}
            />

            <StatCard
              title="Cars Today"
              value={String(carsToday)}
              subtitle="completed & active"
              trend={carsTrend.value}
              trendType={carsTrend.type}
              icon={Car}
            />

            <StatCard
              title="In Progress"
              value={String(inProgress)}
              subtitle="vehicles being serviced"
              icon={Clock3}
            />

            <StatCard
              title="Completed"
              value={String(completed)}
              subtitle="jobs completed today"
              trend={completedTrend.value}
              trendType={completedTrend.type}
              icon={ClipboardCheck}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <RecentJobs jobs={recentJobs} />
            </div>

            <ServiceBreakdown services={serviceBreakdown} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Cash Position
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-2xl font-semibold">
                  {formatMoney(cash)}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Expected cash collected today
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/60 p-3">
                    <p className="text-xs text-muted-foreground">
                      Cash
                    </p>
                    <p className="mt-1 font-semibold">
                      {cash.toFixed(2)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted/60 p-3">
                    <p className="text-xs text-muted-foreground">
                      Bank Transfer
                    </p>
                    <p className="mt-1 font-semibold">
                      {bankTransfer.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Today's Expenses
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-2xl font-semibold">
                  {formatMoney(expenses)}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Recorded business expenses
                </p>

                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Receipt className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      {expenseCount} {expenseCount === 1 ? "expense" : "expenses"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      recorded today
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Estimated Net
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-2xl font-semibold">
                  {formatMoney(estimatedNet)}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Revenue minus recorded expenses
                </p>

                <div className="mt-5 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    End-of-day reconciliation will give the final figure.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
