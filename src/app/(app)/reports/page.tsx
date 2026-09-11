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

        const { data: profile, error: profileError } =
          await supabase
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

      if (
        paymentDate >= today &&
        paymentDate < tomorrow
      ) {
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

      if (
        expenseDate >= today &&
        expenseDate < tomorrow
      ) {
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

          if (
            paymentDate >= day &&
            paymentDate < nextDay
          ) {
            return sum + toNumber(payment.amount)
          }

          return sum
        },
        0,
      )

      const jobCount = jobs.filter((job) => {
        const jobDate = new Date(job.created_at)

        return (
          jobDate >= day &&
          jobDate < nextDay
        )
      }).length

      const expenseTotal = expenses.reduce(
        (sum, expense) => {
          const expenseDate = new Date(
            expense.expense_date,
          )

          if (
            expenseDate >= day &&
            expenseDate < nextDay
          ) {
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
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-center p-6 py-20 text-sm text-muted-foreground">
        Loading reports...
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 lg:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Reports
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Understand your car wash performance.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
          >
            <CalendarDays className="h-4 w-4" />
            Today
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            onClick={exportCsv}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Revenue
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {revenueToday.toFixed(2)} LYD
                </p>
              </div>

              <CircleDollarSign className="h-5 w-5 text-blue-600" />
            </div>

            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Today's recorded payments
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Cars
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {carsToday}
                </p>
              </div>

              <Car className="h-5 w-5 text-blue-600" />
            </div>

            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Today's jobs
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Expenses
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {expensesToday.toFixed(2)} LYD
                </p>
              </div>

              <Receipt className="h-5 w-5 text-blue-600" />
            </div>

            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowDownRight className="h-3.5 w-3.5" />
              Today's recorded expenses
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Estimated Net
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {estimatedNet.toFixed(2)} LYD
                </p>
              </div>

              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Revenue minus recorded expenses
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Revenue Summary
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex h-[280px] items-end gap-3">
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
                    className="flex h-full flex-1 flex-col items-center gap-2"
                  >
                    <div className="flex h-full w-full items-end">
                      <div
                        className="w-full rounded-t-md bg-blue-600"
                        style={{
                          height: `${height}%`,
                        }}
                        title={`${day.amount.toFixed(2)} LYD`}
                      />
                    </div>

                    <span className="text-[10px] text-muted-foreground">
                      {day.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Daily Summary
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">
                  Total Jobs
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Today's jobs
                </p>
              </div>

              <p className="font-semibold">
                {carsToday}
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
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

            <div className="flex items-center justify-between rounded-lg border p-4">
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

            <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
              <div>
                <p className="text-sm font-medium">
                  Estimated Net
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Revenue minus expenses
                </p>
              </div>

              <p className="font-semibold text-blue-600">
                {estimatedNet.toFixed(2)} LYD
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
