"use client"

import {
  Banknote,
  CreditCard,
  Search,
  Wallet,
} from "lucide-react"
import { useMemo, useState } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import {
  collectPayment,
  getPayments,
} from "@/lib/api/payments"
import { getJobs } from "@/lib/api/jobs"
import type { Job } from "@/lib/types/job"
import type { PaymentMethod } from "@/lib/types/payment"

function formatPaymentStatus(status: Job["paymentStatus"]) {
  switch (status) {
    case "paid":
      return "Paid"
    case "partial":
      return "Partial"
    case "unpaid":
      return "Unpaid"
  }
}

function getPaymentStatusClass(status: Job["paymentStatus"]) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "partial":
      return "bg-amber-50 text-amber-700 border-amber-200"
    case "unpaid":
      return "bg-red-50 text-red-700 border-red-200"
  }
}

function formatMethod(method: PaymentMethod) {
  return method === "cash" ? "Cash" : "Card"
}

export default function PaymentsPage() {
  const [jobs, setJobs] = useState<Job[]>(() => getJobs())
  const [search, setSearch] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  const payments = useMemo(() => {
    void refreshKey
    return getPayments()
  }, [refreshKey])

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return jobs
    }

    return jobs.filter((job) =>
      [
        job.id,
        job.vehicle,
        job.plate,
        job.customerName,
        job.customerPhone,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        )
    )
  }, [jobs, search])

  const totals = useMemo(() => {
    const collected = payments
      .filter((payment) => payment.status === "collected")
      .reduce((sum, payment) => sum + payment.amount, 0)

    const cash = payments
      .filter(
        (payment) =>
          payment.status === "collected" &&
          payment.method === "cash"
      )
      .reduce((sum, payment) => sum + payment.amount, 0)

    const card = payments
      .filter(
        (payment) =>
          payment.status === "collected" &&
          payment.method === "card"
      )
      .reduce((sum, payment) => sum + payment.amount, 0)

    return {
      collected,
      cash,
      card,
      unpaid: jobs.filter(
        (job) => job.paymentStatus === "unpaid"
      ).length,
    }
  }, [jobs, payments])

  function collectJobPayment(job: Job, method: PaymentMethod) {
    try {
      collectPayment({
        jobId: job.id,
        amount: job.total,
        method,
      })

      setJobs(getJobs())
      setRefreshKey((value) => value + 1)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 lg:p-6">

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Payments
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Track payments and collection activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Collected Today
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {totals.collected.toFixed(2)} LYD
                </p>
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
                <p className="text-sm text-muted-foreground">
                  Cash
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {totals.cash.toFixed(2)} LYD
                </p>
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
                <p className="text-sm text-muted-foreground">
                  Card
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {totals.card.toFixed(2)} LYD
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      <Card>

        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <CardTitle className="text-base">
            Payment History
          </CardTitle>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search payments..."
              className="pl-9"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

        </CardHeader>

        <CardContent>

          {filteredJobs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-medium">
                No jobs found
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Create a job first, then its payment will appear here.
              </p>
            </div>
          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-3 font-medium">
                      Job
                    </th>

                    <th className="pb-3 font-medium">
                      Customer
                    </th>

                    <th className="pb-3 font-medium">
                      Vehicle
                    </th>

                    <th className="pb-3 font-medium">
                      Amount
                    </th>

                    <th className="pb-3 font-medium">
                      Status
                    </th>

                    <th className="pb-3 font-medium">
                      Method
                    </th>

                    <th className="pb-3">
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">

                  {filteredJobs.map((job) => {
                    const jobPayments = payments.filter(
                      (payment) =>
                        payment.jobId === job.id &&
                        payment.status === "collected"
                    )

                    const latestPayment =
                      jobPayments[0]

                    return (
                      <tr key={job.id}>

                        <td className="py-4">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="font-medium hover:underline"
                          >
                            {job.id}
                          </Link>
                        </td>

                        <td className="py-4">
                          {job.customerName || "Walk-in"}
                        </td>

                        <td className="py-4">
                          <p className="font-medium">
                            {job.vehicle}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {job.plate}
                          </p>
                        </td>

                        <td className="py-4 font-semibold">
                          {job.total.toFixed(2)} LYD
                        </td>

                        <td className="py-4">
                          <Badge
                            variant="outline"
                            className={getPaymentStatusClass(
                              job.paymentStatus
                            )}
                          >
                            {formatPaymentStatus(
                              job.paymentStatus
                            )}
                          </Badge>
                        </td>

                        <td className="py-4">
                          {latestPayment ? (
                            formatMethod(latestPayment.method)
                          ) : (
                            <span className="text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>

                        <td className="py-4 text-right">

                          {job.paymentStatus !== "paid" ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  collectJobPayment(
                                    job,
                                    "cash"
                                  )
                                }
                              >
                                Cash
                              </Button>

                              <Button
                                size="sm"
                                onClick={() =>
                                  collectJobPayment(
                                    job,
                                    "card"
                                  )
                                }
                              >
                                Card
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
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
  )
}
