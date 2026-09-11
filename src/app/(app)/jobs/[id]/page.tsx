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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

type JobStatus =
  | "waiting"
  | "in_progress"
  | "ready"
  | "completed"
  | "cancelled"

type Job = {
  id: string
  vehicle_id: string | null
  customer_id: string | null
  plate_number: string | null
  customer_name: string | null
  customer_phone: string | null
  car_model: string | null
  car_color: string | null
  assigned_worker_id: string | null
  status: JobStatus
  notes: string | null
  subtotal: number | string
  total: number | string
  created_at: string
  updated_at: string
  completed_at: string | null
}

type JobService = {
  id: string
  service_name: string
  quantity: number | string
  unit_price: number | string
  line_total: number | string
  custom_field_values: Record<string, unknown> | null
}

type Worker = {
  name: string
}

type Vehicle = {
  make: string | null
  model: string | null
  year: number | null
  car_color: string | null
  plate_number: string
}

type Customer = {
  name: string
  phone: string | null
}

type Payment = {
  amount: number | string
  method: "cash" | "bank_transfer"
  created_at: string
}

function toNumber(value: number | string | null | undefined) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function formatMoney(value: number | string) {
  return `${toNumber(value).toFixed(2)} LYD`
}

function formatStatus(status: JobStatus) {
  switch (status) {
    case "waiting":
      return "Waiting"
    case "in_progress":
      return "In Progress"
    case "ready":
      return "Ready"
    case "completed":
      return "Completed"
    case "cancelled":
      return "Cancelled"
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

function formatDate(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<Job | null>(null)
  const [services, setServices] = useState<JobService[]>([])
  const [worker, setWorker] = useState<Worker | null>(null)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])

  useEffect(() => {
    async function loadJob() {
      setLoading(true)

      try {
        const supabase = createClient()

        const { data: jobData, error: jobError } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", id)
          .single()

        if (jobError || !jobData) {
          throw new Error(
            jobError?.message || "This job could not be found",
          )
        }

        const currentJob = jobData as Job
        setJob(currentJob)

        const [
          servicesResult,
          paymentsResult,
          workerResult,
          vehicleResult,
          customerResult,
        ] = await Promise.all([
          supabase
            .from("job_services")
            .select(
              "id, service_name, quantity, unit_price, line_total, custom_field_values",
            )
            .eq("job_id", id)
            .order("id"),

          supabase
            .from("payments")
            .select("amount, method, created_at")
            .eq("job_id", id)
            .order("created_at", { ascending: false }),

          currentJob.assigned_worker_id
            ? supabase
                .from("workers")
                .select("name")
                .eq("id", currentJob.assigned_worker_id)
                .single()
            : Promise.resolve({ data: null, error: null }),

          currentJob.vehicle_id
            ? supabase
                .from("vehicles")
                .select("make, model, year, car_color, plate_number")
                .eq("id", currentJob.vehicle_id)
                .single()
            : Promise.resolve({ data: null, error: null }),

          currentJob.customer_id
            ? supabase
                .from("customers")
                .select("name, phone")
                .eq("id", currentJob.customer_id)
                .single()
            : Promise.resolve({ data: null, error: null }),
        ])

        if (servicesResult.error) {
          throw new Error(
            `Couldn't load services: ${servicesResult.error.message}`,
          )
        }

        if (paymentsResult.error) {
          throw new Error(
            `Couldn't load payments: ${paymentsResult.error.message}`,
          )
        }

        setServices((servicesResult.data as JobService[]) ?? [])
        setPayments((paymentsResult.data as Payment[]) ?? [])
        setWorker((workerResult.data as Worker | null) ?? null)
        setVehicle((vehicleResult.data as Vehicle | null) ?? null)
        setCustomer((customerResult.data as Customer | null) ?? null)
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Couldn't load job"

        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    loadJob()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading job...
      </div>
    )
  }

  if (!job) {
    return (
      <div className="mx-auto w-full max-w-[1100px] p-4 lg:p-6">
        <div className="space-y-4">
          <Link href="/jobs">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Jobs
            </Button>
          </Link>

          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-xl font-semibold">
                Job not found
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                This job could not be loaded from the database.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const paidAmount = payments.reduce(
    (sum, payment) => sum + toNumber(payment.amount),
    0,
  )

  const totalAmount = toNumber(job.total)
  const remainingAmount = Math.max(totalAmount - paidAmount, 0)

  const paymentStatus =
    paidAmount <= 0
      ? "Unpaid"
      : paidAmount >= totalAmount
        ? "Paid"
        : "Partial"

  const vehicleName =
    vehicle?.make || vehicle?.model
      ? [vehicle.make, vehicle.model].filter(Boolean).join(" ")
      : job.car_model || "Unnamed vehicle"

  const plate = vehicle?.plate_number || job.plate_number || "No plate"
  const customerName =
    customer?.name || job.customer_name || "Walk-in"
  const customerPhone =
    customer?.phone || job.customer_phone || null

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
            Job #{job.id.slice(0, 8)}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            View vehicle, services, status and payment information.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Car className="h-4 w-4 text-blue-600" />
              Vehicle
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  Vehicle
                </p>
                <p className="mt-1 font-medium">
                  {vehicleName}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Plate Number
                </p>
                <p className="mt-1 font-medium">
                  {plate}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Customer
                </p>
                <p className="mt-1 font-medium">
                  {customerName}
                </p>
              </div>

              {customerPhone && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Phone
                  </p>
                  <p className="mt-1 font-medium">
                    {customerPhone}
                  </p>
                </div>
              )}

              {(vehicle?.car_color || job.car_color) && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Color
                  </p>
                  <p className="mt-1 font-medium">
                    {vehicle?.car_color || job.car_color}
                  </p>
                </div>
              )}

              {vehicle?.year && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Year
                  </p>
                  <p className="mt-1 font-medium">
                    {vehicle.year}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Status
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Badge
              variant="outline"
              className={getStatusClass(job.status)}
            >
              {formatStatus(job.status)}
            </Badge>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              {formatDate(job.created_at)}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Services
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="divide-y">
              {services.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No services recorded for this job.
                </p>
              ) : (
                services.map((service) => (
                  <div
                    key={service.id}
                    className="flex justify-between gap-4 py-4"
                  >
                    <div>
                      <p className="font-medium">
                        {service.service_name}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Qty {toNumber(service.quantity)} ·{" "}
                        {formatMoney(service.unit_price)} each
                      </p>
                    </div>

                    <span className="whitespace-nowrap font-medium">
                      {formatMoney(service.line_total)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Subtotal
                </span>

                <span>
                  {formatMoney(job.subtotal)}
                </span>
              </div>

              <div className="mt-2 flex justify-between text-lg font-semibold">
                <span>Total</span>

                <span>
                  {formatMoney(job.total)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4 text-blue-600" />
              Payment
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-semibold">
                {formatMoney(job.total)}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {paymentStatus}
              </p>
            </div>

            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Paid
                </span>
                <span className="font-medium">
                  {formatMoney(paidAmount)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Remaining
                </span>
                <span className="font-medium">
                  {formatMoney(remainingAmount)}
                </span>
              </div>
            </div>

            {payments.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Payment history
                </p>

                {payments.map((payment, index) => (
                  <div
                    key={`${payment.created_at}-${index}`}
                    className="flex justify-between text-xs"
                  >
                    <span className="capitalize text-muted-foreground">
                      {payment.method.replace("_", " ")}
                    </span>

                    <span>
                      {formatMoney(payment.amount)}
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
              Job Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                Worker
              </span>

              <span>
                {worker?.name || "Not assigned"}
              </span>
            </div>

            {job.notes && (
              <div>
                <p className="text-muted-foreground">
                  Notes
                </p>

                <p className="mt-1">
                  {job.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
