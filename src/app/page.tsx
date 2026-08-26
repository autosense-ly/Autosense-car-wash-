import {
  Car,
  CircleDollarSign,
  Clock3,
  ClipboardCheck,
  Plus,
  Receipt,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/stat-card"
import { RecentJobs } from "@/components/dashboard/recent-jobs"
import { ServiceBreakdown } from "@/components/dashboard/service-breakdown"

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 lg:p-6">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Thursday, August 20
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Good evening, Owner
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happening at your car wash today.
          </p>
        </div>

        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          New Job
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Today's Revenue"
          value="1,830 LYD"
          subtitle="vs yesterday"
          trend="+12.4%"
          trendType="up"
          icon={CircleDollarSign}
        />

        <StatCard
          title="Cars Today"
          value="55"
          subtitle="completed & active"
          trend="+8.1%"
          trendType="up"
          icon={Car}
        />

        <StatCard
          title="In Progress"
          value="7"
          subtitle="vehicles being serviced"
          icon={Clock3}
        />

        <StatCard
          title="Completed"
          value="48"
          subtitle="jobs completed today"
          trend="+5.2%"
          trendType="up"
          icon={ClipboardCheck}
        />

      </div>

      <div className="grid gap-6 xl:grid-cols-3">

        <div className="xl:col-span-2">
          <RecentJobs />
        </div>

        <ServiceBreakdown />

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
              1,620 LYD
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
                  1,620
                </p>
              </div>

              <div className="rounded-lg bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground">
                  Other
                </p>
                <p className="mt-1 font-semibold">
                  210
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
              280 LYD
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
                  6 expenses
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
              1,550 LYD
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
    </div>
  )
}
