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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReportsPage() {
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

          <Button variant="outline" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Today
          </Button>

          <Button variant="outline" className="gap-2">
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
                  1,830 LYD
                </p>
              </div>

              <CircleDollarSign className="h-5 w-5 text-blue-600" />
            </div>

            <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600">
              <ArrowUpRight className="h-3.5 w-3.5" />
              12.4% vs previous period
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
                  55
                </p>
              </div>

              <Car className="h-5 w-5 text-blue-600" />
            </div>

            <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600">
              <ArrowUpRight className="h-3.5 w-3.5" />
              8.1% vs previous period
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
                  280 LYD
                </p>
              </div>

              <Receipt className="h-5 w-5 text-blue-600" />
            </div>

            <div className="mt-3 flex items-center gap-1 text-xs text-red-600">
              <ArrowDownRight className="h-3.5 w-3.5" />
              Business expenses
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
                  1,550 LYD
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

              {[35, 52, 44, 70, 58, 82, 66].map((height, index) => (
                <div
                  key={index}
                  className="flex flex-1 flex-col items-center gap-2"
                >

                  <div className="flex h-full w-full items-end">

                    <div
                      className="w-full rounded-t-md bg-blue-600"
                      style={{ height: `${height}%` }}
                    />

                  </div>

                  <span className="text-[10px] text-muted-foreground">
                    {["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"][index]}
                  </span>

                </div>
              ))}

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
                  Completed and active
                </p>
              </div>

              <p className="font-semibold">
                55
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">
                  Total Revenue
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  All recorded payments
                </p>
              </div>

              <p className="font-semibold">
                1,830 LYD
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">
                  Total Expenses
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Recorded business expenses
                </p>
              </div>

              <p className="font-semibold">
                280 LYD
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
                1,550 LYD
              </p>
            </div>

          </CardContent>
        </Card>

      </div>

    </div>
  )
}
