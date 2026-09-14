"use client"

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Car,
  CircleDollarSign,
  Download,
  Receipt,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

type PaymentRow = {
  amount: number | string
  created_at: string
}

type JobRow = {
  id: string
  created_at: string
}

type ExpenseRow = {
  amount: number | string
  expense_date: string
}

type DailyRevenue = {
  date: string
  label: string
  amount: number
  jobs: number
  expenses: number
  net: number
}

function toNumber(value: number | string | null | undefined) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function startOfDay(date: Date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString([], {
    weekday: "short",
  })
}

export default function ReportsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [expenses, setExpenses] = useState<ExpenseRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReports() {
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

        const today = startOfDay(new Date())
        const sevenDaysAgo = new Date(today)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

        const startIso = sevenDaysAgo.toISOString()

        const [paymentsResult, jobsResult, expensesResult] =
          await Promise.all([
            supabase
              .from("payments")
              .select("amount, created_at")
              .eq("business_id", profile.business_id)
              .gte("created_at", startIso)
              .order("created_at", {
                ascending: true,
              }),

            supabase
              .from("jobs")
              .select("id, created_at")
              .eq("business_id", profile.business_id)
              .gte("created_at", startIso)
              .order("created_at", {
                ascending: true,
              }),

            supabase
              .from("expenses")
              .select("amount, expense_date")
              .eq("business_id", profile.business_id)
              .gte("expense_date", startIso)
              .order("expense_date", {
                ascending: true,
              }),
          ])

        if (paymentsResult.error) {
          throw new Error(
            `Couldn't load payments: ${paymentsResult.error.message}`,
          )
        }

        if (jobsResult.error) {
          throw new Error(
            `Couldn't load jobs: ${jobsResult.error.message}`,
          )
        }

        if (expensesResult.error) {
          throw new Error(
            `Couldn't load expenses: ${expensesResult.error.message}`,
          )
        }

        setPayments(
          (paymentsResult.data as PaymentRow[]) ?? [],
        )

        setJobs((jobsResult.data as JobRow[]) ?? [])

        setExpenses(
          (expensesResult.data as ExpenseRow[]) ?? [],
        )
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Couldn't load reports",
        )
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [])

  const today = useMemo(() => startOfDay(new Date()), [])

  const tomorrow = useMemo(() => {
    const result = new Date(today)
    result.setDate(result.getDate() + 1)
    return result
  }, [today])

  const revenueToday = useMemo(() => {
    return payments.reduce((sum, payment) => {
      const paymentDate = new Date(payment.created_at)

      if (paymentDate >= today && paymentDate < tomorrow) {
        return sum + toNumber(payment.amount)
      }

      return sum
    }, 0)
  }, [payments, today, tomorrow])

  const carsToday = useMemo(() => {
    return jobs.filter((job) => {
      const jobDate = new Date(job.created_at)

      return jobDate >= today && jobDate < tomorrow
    }).length
  }, [jobs, today, tomorrow])

  const expensesToday = useMemo(() => {
    return expenses.reduce((sum, expense) => {
      const expenseDate = new Date(expense.expense_date)

      if (expenseDate >= today && expenseDate < tomorrow) {
        return sum + toNumber(expense.amount)
      }

      return sum
    }, 0)
  }, [expenses, today, tomorrow])

  const estimatedNet = revenueToday - expensesToday

  const dailyRevenue = useMemo<DailyRevenue[]>(() => {
    const days: DailyRevenue[] = []

    for (let index = 6; index >= 0; index -= 1) {
      const day = new Date(today)
      day.setDate(day.getDate() - index)

      const nextDay = new Date(day)
      nextDay.setDate(nextDay.getDate() + 1)

      const key = dateKey(day)

      const amount = payments.reduce(
        (sum, payment) => {
          const paymentDate = new Date(payment.created_at)

          if (paymentDate >= day && paymentDate < nextDay) {
            return sum + toNumber(payment.amount)
          }

          return sum
        },
        0,
      )

      const jobCount = jobs.filter((job) => {
        const jobDate = new Date(job.created_at)

        return jobDate >= day && jobDate < nextDay
      }).length

      const expenseTotal = expenses.reduce(
        (sum, expense) => {
          const expenseDate = new Date(
            expense.expense_date,
          )

          if (expenseDate >= day && expenseDate < nextDay) {
            return sum + toNumber(expense.amount)
          }

          return sum
        },
        0,
      )

      days.push({
        date: key,
        label: formatDayLabel(day),
        amount,
        jobs: jobCount,
        expenses: expenseTotal,
        net: amount - expenseTotal,
      })
    }

    return days
  }, [payments, jobs, expenses, today])

  const maxRevenue = useMemo(() => {
    return Math.max(
      ...dailyRevenue.map((day) => day.amount),
      1,
    )
  }, [dailyRevenue])

  function exportCsv() {
    const header =
      "Date,Day,Jobs,Revenue (LYD),Expenses (LYD),Estimated Net (LYD)"

    const rows = dailyRevenue.map((day) =>
      [
        day.date,
        day.label,
        day.jobs,
        day.amount.toFixed(2),
        day.expenses.toFixed(2),
        day.net.toFixed(2),
      ].join(","),
    )

    const csv = [header, ...rows].join("\n")

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = `autosense-report-${dateKey(today)}.csv`

    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)

    toast.success("Report exported successfully")
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-[1600px] items-center justify-center px-4 py-12 text-sm text-muted-foreground sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-4 py-3 shadow-sm">
          <BarChart3 className="h-4 w-4 animate-pulse text-blue-600 dark:text-blue-400" />
          Loading reports...
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="space-y-6">
        <section className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400">
              Analytics
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Reports
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Understand your car wash performance.
            </p>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              variant="outline"
              className="h-9 flex-1 rounded-xl gap-2 sm:flex-none"
            >
              <CalendarDays className="h-4 w-4" />
              Today
            </Button>

            <Button
              variant="outline"
              className="h-9 flex-1 rounded-xl gap-2 sm:flex-none"
              onClick={exportCsv}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-2xl border-2 border-border shadow-md transition-shadow hover:shadow-lg dark:border-border/90">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Revenue
                  </p>

                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {revenueToday.toFixed(2)} LYD
                  </p>

                  <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    Today&apos;s recorded payments
                  </div>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <CircleDollarSign className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-2 border-border shadow-md transition-shadow hover:shadow-lg dark:border-border/90">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Cars
                  </p>

                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {carsToday}
                  </p>

                  <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    Today&apos;s jobs
                  </div>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <Car className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-2 border-border shadow-md transition-shadow hover:shadow-lg dark:border-border/90">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Expenses
                  </p>

                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {expensesToday.toFixed(2)} LYD
                  </p>

                  <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <ArrowDownRight className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                    Today&apos;s recorded expenses
                  </div>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <Receipt className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-2 border-border shadow-md transition-shadow hover:shadow-lg dark:border-border/90">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Estimated Net
                  </p>

                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {estimatedNet.toFixed(2)} LYD
                  </p>

                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Revenue minus recorded expenses
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <BarChart3 className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-2xl border-2 border-border shadow-md dark:border-border/90">
            <CardHeader className="border-b border-border/60 px-4 py-4 sm:px-5">
              <CardTitle className="text-base">
                Revenue Summary
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Recorded payments over the last seven days.
              </p>
            </CardHeader>

            <CardContent className="p-4 sm:p-5">
              <div className="flex h-[280px] items-end gap-2 sm:gap-3">
                {dailyRevenue.map((day) => {
                  const height =
                    day.amount > 0
                      ? Math.max(
                          (day.amount / maxRevenue) * 100,
                          4,
                        )
                      : 2

                  return (
                    <div
                      key={day.date}
                      className="flex h-full min-w-0 flex-1 flex-col items-center gap-2"
                    >
                      <div className="flex h-full w-full items-end">
                        <div
                          className="w-full min-w-[12px] rounded-t-lg bg-blue-600 transition-all duration-300 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
                          style={{
                            height: `${height}%`,
                          }}
                          title={`${day.amount.toFixed(2)} LYD`}
                        />
                      </div>

                      <span className="text-[10px] font-medium text-muted-foreground">
                        {day.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-2 border-border shadow-md dark:border-border/90">
            <CardHeader className="border-b border-border/60 px-4 py-4 sm:px-5">
              <CardTitle className="text-base">
                Daily Summary
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Today&apos;s recorded business activity.
              </p>
            </CardHeader>

            <CardContent className="space-y-3 p-4 sm:p-5">
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/10 p-4">
                <div>
                  <p className="text-sm font-medium">
                    Total Jobs
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Today&apos;s jobs
                  </p>
                </div>

                <p className="text-lg font-semibold">
                  {carsToday}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/10 p-4">
                <div>
                  <p className="text-sm font-medium">
                    Total Revenue
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    All recorded payments today
                  </p>
                </div>

                <p className="font-semibold">
                  {revenueToday.toFixed(2)} LYD
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/10 p-4">
                <div>
                  <p className="text-sm font-medium">
                    Total Expenses
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Recorded business expenses today
                  </p>
                </div>

                <p className="font-semibold">
                  {expensesToday.toFixed(2)} LYD
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
                <div>
                  <p className="text-sm font-semibold">
                    Estimated Net
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Revenue minus expenses
                  </p>
                </div>

                <p className="font-semibold text-blue-600 dark:text-blue-400">
                  {estimatedNet.toFixed(2)} LYD
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
