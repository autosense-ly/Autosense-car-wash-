"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Car,
  Clock3,
  CreditCard,
  Loader2,
  UserRound,
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
import { jobDetailsTranslations } from "@/lib/i18n/job-details"
import { useLanguage } from "@/lib/i18n/language-provider"
import { createClient } from "@/lib/supabase/client"

type JobStatus =
  | "waiting"
  | "in_progress"
  | "ready"
  | "completed"
  | "cancelled"

type JobRow = {
  id: string
  plate_number: string | null
  customer_name: string | null
  customer_phone: string | null
  car_model: string | null
  car_color: string | null
  status: JobStatus
  notes: string | null
  subtotal: number | string
  total: number | string
  created_at: string
  updated_at: string
  completed_at: string | null
  assigned_worker: {
    name: string
  } | null
  job_services: {
    id: string
    service_name: string
    quantity: number | string
    unit_price: number | string
    line_total: number | string
  }[] | null
}

type PaymentRow = {
  id: string
  amount: number | string
  method: "cash" | "bank_transfer"
  created_at: string
}

type JobDetailsTranslations = (typeof jobDetailsTranslations)["en"]

function toNumber(value: number | string | null | undefined) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function formatStatus(
  status: JobStatus,
  t: JobDetailsTranslations,
) {
  switch (status) {
    case "waiting":
      return t.waiting
    case "in_progress":
      return t.inProgress
    case "ready":
      return t.ready
    case "completed":
      return t.completed
    case "cancelled":
      return t.cancelled
  }
}

function getStatusClass(status: JobStatus) {
  switch (status) {
    case "waiting":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900"
    case "in_progress":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900"
    case "ready":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900"
    case "completed":
      return "bg-muted text-muted-foreground"
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900"
  }
}

function formatMethod(
  method: PaymentRow["method"],
  t: JobDetailsTranslations,
) {
  return method === "cash" ? t.cash : t.bankTransfer
}

export default function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { language } = useLanguage()
  const t = jobDetailsTranslations[language]

  const [job, setJob] = useState<JobRow | null>(null)
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadJob() {
      setLoading(true)

      try {
        const supabase = createClient()

        const { data: authData, error: authError } =
          await supabase.auth.getUser()

        if (authError || !authData.user) {
          throw new Error(t.notLoggedIn)
        }

        const { data: profile, error: profileError } =
          await supabase
            .from("app_users")
            .select("business_id")
            .eq("id", authData.user.id)
            .single()

        if (profileError || !profile) {
          throw new Error(t.businessProfileNotFound)
        }

        const [jobResult, paymentsResult] = await Promise.all([
          supabase
            .from("jobs")
            .select(
              "id, plate_number, customer_name, customer_phone, car_model, car_color, status, notes, subtotal, total, created_at, updated_at, completed_at, assigned_worker:workers(name), job_services(id, service_name, quantity, unit_price, line_total)",
            )
            .eq("id", id)
            .eq("business_id", profile.business_id)
            .single(),

          supabase
            .from("payments")
            .select("id, amount, method, created_at")
            .eq("job_id", id)
            .eq("business_id", profile.business_id)
            .order("created_at", { ascending: true }),
        ])

        if (jobResult.error) {
          if (jobResult.error.code === "PGRST116") {
            setJob(null)
            setPayments([])
            return
          }

          console.error(jobResult.error)
          throw new Error(t.loadJobError)
        }

        if (paymentsResult.error) {
          console.error(paymentsResult.error)
          throw new Error(t.loadPaymentsError)
        }

        setJob(jobResult.data as unknown as JobRow)
        setPayments((paymentsResult.data as PaymentRow[]) ?? [])
      } catch (error) {
        console.error(error)

        toast.error(
          error instanceof Error ? error.message : t.loadJobError,
        )
      } finally {
        setLoading(false)
      }
    }

    loadJob()
  }, [id, t])

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-[1100px] items-center justify-center p-6 py-20 text-muted-foreground">
        <Loader2 className="me-2 h-5 w-5 animate-spin" />
        {t.loadingJob}
      </div>
    )
  }

  if (!job) {
    return (
      <div className="mx-auto w-full max-w-[1100px] space-y-4 p-4 lg:p-6">
        <Link href="/jobs">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t.backToJobs}
          </Button>
        </Link>

        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-xl font-semibold">
              {t.jobNotFound}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              {t.jobNotFoundDescription}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const total = toNumber(job.total)
  const paid = payments.reduce(
    (sum, payment) => sum + toNumber(payment.amount),
    0,
  )
  const remaining = Math.max(total - paid, 0)

  const paymentStatus =
    paid <= 0 ? t.unpaid : paid < total ? t.partial : t.paid

  const dateLocale = language === "ar" ? "ar-EG" : "en-US"

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6 p-4 lg:p-6">
      <div className="flex items-center gap-3">
        <Link href="/jobs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.jobNumber} #{job.id.slice(0, 8)}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {t.jobDescription}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Car className="h-4 w-4 text-blue-600" />
              {t.vehicle}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  {t.vehicle}
                </p>
                <p className="mt-1 font-medium">
                  {job.car_model || t.unnamedVehicle}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  {t.plateNumber}
                </p>
                <p className="mt-1 font-medium">
                  {job.plate_number || t.noPlate}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  {t.customer}
                </p>
                <p className="mt-1 font-medium">
                  {job.customer_name || t.walkIn}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  {t.phone}
                </p>
                <p className="mt-1 font-medium">
                  {job.customer_phone || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  {t.color}
                </p>
                <p className="mt-1 font-medium">
                  {job.car_color || "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t.status}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Badge
              variant="outline"
              className={getStatusClass(job.status)}
            >
              {formatStatus(job.status, t)}
            </Badge>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              {new Date(job.created_at).toLocaleString(dateLocale)}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              {t.services}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {job.job_services?.length ? (
              <div className="divide-y">
                {job.job_services.map((service) => (
                  <div
                    key={service.id}
                    className="flex justify-between gap-4 py-4"
                  >
                    <div>
                      <p className="font-medium">
                        {service.service_name}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {t.quantity} {toNumber(service.quantity)} ·{" "}
                        {toNumber(service.unit_price).toFixed(2)}{" "}
                        {t.currency} {t.each}
                      </p>
                    </div>

                    <span className="whitespace-nowrap font-medium">
                      {toNumber(service.line_total).toFixed(2)}{" "}
                      {t.currency}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-sm text-muted-foreground">
                {t.noServices}
              </p>
            )}

            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t.subtotal}
                </span>

                <span>
                  {toNumber(job.subtotal).toFixed(2)} {t.currency}
                </span>
              </div>

              <div className="mt-2 flex justify-between text-lg font-semibold">
                <span>{t.total}</span>

                <span>
                  {total.toFixed(2)} {t.currency}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4 text-blue-600" />
              {t.payment}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-semibold">
              {total.toFixed(2)} {t.currency}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {paymentStatus}
            </p>

            <div className="mt-5 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t.paidAmount}
                </span>
                <span>
                  {paid.toFixed(2)} {t.currency}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t.remaining}
                </span>
                <span>
                  {remaining.toFixed(2)} {t.currency}
                </span>
              </div>
            </div>

            {payments.length > 0 && (
              <div className="mt-5 space-y-2 border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground">
                  {t.paymentHistory}
                </p>

                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between gap-3 text-xs"
                  >
                    <span className="text-muted-foreground">
                      {formatMethod(payment.method, t)}
                    </span>

                    <span className="font-medium">
                      {toNumber(payment.amount).toFixed(2)}{" "}
                      {t.currency}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="h-4 w-4 text-blue-600" />
              {t.jobInformation}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                {t.worker}
              </span>

              <span>
                {job.assigned_worker?.name || t.notAssigned}
              </span>
            </div>

            {job.notes && (
              <div>
                <p className="text-muted-foreground">
                  {t.notes}
                </p>

                <p className="mt-1">{job.notes}</p>
              </div>
            )}

            {job.completed_at && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  {t.completed}
                </span>

                <span>
                  {new Date(job.completed_at).toLocaleString(
                    dateLocale,
                  )}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
