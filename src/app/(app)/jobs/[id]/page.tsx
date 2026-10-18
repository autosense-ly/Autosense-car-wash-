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
import { useCurrency } from "@/lib/currency/currency-provider"
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
  vehicle_type: string | null
  customer_name: string | null
  customer_phone: string | null
  service_name: string | null
  service_price: number | null
  subtotal: number | null
  discount: number | null
  total: number | null
  paid_amount: number | null
  payment_method: string | null
  status: JobStatus
  created_at: string
  completed_at: string | null
  notes: string | null
}

function toNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export default function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { language } = useLanguage()
  const { currency } = useCurrency()
  const t = jobDetailsTranslations[language]
  const [job, setJob] = useState<JobRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    let active = true

    async function loadJob() {
      setLoading(true)
      setError(null)

      const { data, error: queryError } = await supabase
        .from("jobs")
        .select(
          "id, plate_number, vehicle_type, customer_name, customer_phone, service_name, service_price, subtotal, discount, total, paid_amount, payment_method, status, created_at, completed_at, notes",
        )
        .eq("id", id)
        .maybeSingle()

      if (!active) return

      if (queryError) {
        setError(queryError.message)
        setJob(null)
      } else {
        setJob(data as JobRow | null)
      }

      setLoading(false)
    }

    void loadJob()

    return () => {
      active = false
    }
  }, [id])

  async function updateStatus(status: JobStatus) {
    if (!job) return

    setUpdating(true)

    const { error: updateError } = await supabase
      .from("jobs")
      .update({ status, completed_at: status === "completed" ? new Date().toISOString() : null })
      .eq("id", job.id)

    if (updateError) {
      toast.error(updateError.message)
    } else {
      setJob((current) =>
        current
          ? {
              ...current,
              status,
              completed_at: status === "completed" ? new Date().toISOString() : null,
            }
          : current,
      )
      toast.success(t.statusUpdated)
    }

    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost">
          <Link href="/jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.back}
          </Link>
        </Button>
        <Card>
          <CardContent className="pt-6 text-destructive">{error}</CardContent>
        </Card>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost">
          <Link href="/jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.back}
          </Link>
        </Button>
        <Card>
          <CardContent className="pt-6">{t.notFound}</CardContent>
        </Card>
      </div>
    )
  }

  const total = toNumber(job.total)
  const paid = toNumber(job.paid_amount)
  const remaining = Math.max(total - paid, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button asChild variant="ghost">
          <Link href="/jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.back}
          </Link>
        </Button>
        <Badge>{t.status[job.status]}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              {t.vehicle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t.plateNumber}</p>
              <p className="font-medium">{job.plate_number || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.vehicleType}</p>
              <p className="font-medium">{job.vehicle_type || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.service}</p>
              <p className="font-medium">{job.service_name || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.servicePrice}</p>
              <p className="font-medium">
                {toNumber(job.service_price).toFixed(2)} {currency === "LYD" ? t.currency : currency} {t.each}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              {t.customer}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t.customerName}</p>
              <p className="font-medium">{job.customer_name || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.customerPhone}</p>
              <p className="font-medium">{job.customer_phone || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.payment}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">{t.subtotal}</span>
              <span>{toNumber(job.subtotal).toFixed(2)} {currency === "LYD" ? t.currency : currency}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">{t.discount}</span>
              <span>{toNumber(job.discount).toFixed(2)} {currency === "LYD" ? t.currency : currency}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t pt-4 font-semibold">
              <span>{t.total}</span>
              <span>{total.toFixed(2)} {currency === "LYD" ? t.currency : currency}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">{t.paid}</span>
              <span>{paid.toFixed(2)} {currency === "LYD" ? t.currency : currency}</span>
            </div>
            <div className="flex items-center justify-between gap-4 font-semibold">
              <span>{t.remaining}</span>
              <span>{remaining.toFixed(2)} {currency === "LYD" ? t.currency : currency}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">{t.paymentMethod}</span>
              <span>{job.payment_method || "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-5 w-5" />
              {t.timeline}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t.createdAt}</p>
              <p className="font-medium">{new Date(job.created_at).toLocaleString()}</p>
            </div>
            {job.completed_at && (
              <div>
                <p className="text-sm text-muted-foreground">{t.completedAt}</p>
                <p className="font-medium">{new Date(job.completed_at).toLocaleString()}</p>
              </div>
            )}
            {job.notes && (
              <div>
                <p className="text-sm text-muted-foreground">{t.notes}</p>
                <p className="whitespace-pre-wrap font-medium">{job.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.updateStatus}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(["waiting", "in_progress", "ready", "completed", "cancelled"] as JobStatus[]).map((status) => (
            <Button
              key={status}
              variant={job.status === status ? "default" : "outline"}
              disabled={updating || job.status === status}
              onClick={() => void updateStatus(status)}
            >
              {t.status[status]}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
