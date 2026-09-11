"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Car, Check, Plus, UserRound } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"

type Service = {
  id: string
  name: string
  pricing_type: "fixed" | "quantity" | "custom"
  price: number | string | null
  unit_name: string | null
}

type Worker = {
  id: string
  name: string
}

type Vehicle = {
  id: string
  plate_number: string
  make: string | null
  model: string | null
  car_color: string | null
  customer_id: string | null
}

type Customer = {
  id: string
  name: string
  phone: string | null
}

type SelectedService = {
  serviceId: string
  quantity: number
  customPrice: string
}

// Postgres numeric columns often come back from Supabase as strings, not
// numbers (avoids float rounding). Every price MUST go through this before
// any arithmetic, or summing totals silently does string concatenation
// instead of addition.
function toNumber(value: number | string | null | undefined): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export default function NewJobPage() {
  const router = useRouter()

  const [services, setServices] = useState<Service[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const [existingVehicleId, setExistingVehicleId] = useState<string>("")
  const [plateNumber, setPlateNumber] = useState("")
  const [carModel, setCarModel] = useState("")
  const [carColor, setCarColor] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")

  const [workerId, setWorkerId] = useState<string>("")
  const [position, setPosition] = useState("")
  const [notes, setNotes] = useState("")

  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [
        { data: serviceData },
        { data: workerData },
        { data: vehicleData },
        { data: customerData },
      ] = await Promise.all([
        supabase.from("services").select("id, name, pricing_type, price, unit_name").eq("enabled", true),
        supabase.from("workers").select("id, name").eq("active", true),
        supabase.from("vehicles").select("id, plate_number, make, model, car_color, customer_id"),
        supabase.from("customers").select("id, name, phone"),
      ])

      setServices((serviceData as Service[]) ?? [])
      setWorkers((workerData as Worker[]) ?? [])
      setVehicles((vehicleData as Vehicle[]) ?? [])
      setCustomers((customerData as Customer[]) ?? [])
      setLoadingData(false)
    }
    load()
  }, [])

  function handleSelectExistingVehicle(vehicleId: string | null) {
    setExistingVehicleId(vehicleId ?? "")
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    if (!vehicle) return

    setPlateNumber(vehicle.plate_number)
    setCarModel([vehicle.make, vehicle.model].filter(Boolean).join(" "))
    setCarColor(vehicle.car_color ?? "")

    const customer = customers.find((c) => c.id === vehicle.customer_id)
    setCustomerName(customer?.name ?? "")
    setCustomerPhone(customer?.phone ?? "")
  }

  function isSelected(serviceId: string) {
    return selectedServices.some((s) => s.serviceId === serviceId)
  }

  function toggleService(service: Service) {
    if (isSelected(service.id)) {
      setSelectedServices((prev) => prev.filter((s) => s.serviceId !== service.id))
    } else {
      setSelectedServices((prev) => [
        ...prev,
        { serviceId: service.id, quantity: 1, customPrice: "" },
      ])
    }
  }

  function updateSelectedService(serviceId: string, patch: Partial<SelectedService>) {
    setSelectedServices((prev) =>
      prev.map((s) => (s.serviceId === serviceId ? { ...s, ...patch } : s))
    )
  }

  function lineTotal(service: Service, selected: SelectedService): number {
    if (service.pricing_type === "custom") {
      return toNumber(selected.customPrice)
    }
    if (service.pricing_type === "quantity") {
      return toNumber(service.price) * (selected.quantity || 0)
    }
    return toNumber(service.price)
  }

  const selectedWithDetails = useMemo(() => {
    return selectedServices
      .map((sel) => {
        const service = services.find((s) => s.id === sel.serviceId)
        if (!service) return null
        return { service, selected: sel, total: lineTotal(service, sel) }
      })
      .filter(Boolean) as { service: Service; selected: SelectedService; total: number }[]
  }, [selectedServices, services])

  const grandTotal: number = selectedWithDetails.reduce(
    (sum, item) => sum + item.total,
    0
  )

  async function handleCreateJob() {
    if (!plateNumber.trim()) {
      toast.error("Plate number is required")
      return
    }
    if (selectedServices.length === 0) {
      toast.error("Select at least one service")
      return
    }

    setSaving(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error("Not logged in")
      setSaving(false)
      return
    }

    const { data: profile } = await supabase
      .from("app_users")
      .select("business_id")
      .eq("id", user.id)
      .single()

    if (!profile) {
      toast.error("Couldn't find your business")
      setSaving(false)
      return
    }

    const selectedVehicle = vehicles.find((v) => v.id === existingVehicleId)

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert({
        business_id: profile.business_id,
        vehicle_id: existingVehicleId || null,
        customer_id: selectedVehicle?.customer_id ?? null,
        plate_number: plateNumber.trim(),
        car_model: carModel.trim() || null,
        car_color: carColor.trim() || null,
        customer_name: customerName.trim() || null,
        customer_phone: customerPhone.trim() || null,
        assigned_worker_id: workerId || null,
        notes: notes.trim() || null,
        subtotal: grandTotal,
        total: grandTotal,
        status: "waiting",
        created_by: user.id,
      })
      .select()
      .single()

    if (jobError || !job) {
      toast.error("Couldn't create job: " + jobError?.message)
      setSaving(false)
      return
    }

    const jobServiceRows = selectedWithDetails.map(({ service, selected, total }) => ({
      job_id: job.id,
      service_id: service.id,
      service_name: service.name,
      quantity: service.pricing_type === "quantity" ? selected.quantity : 1,
      unit_price: service.pricing_type === "custom" ? total : toNumber(service.price),
      line_total: total,
    }))

    const { error: servicesError } = await supabase.from("job_services").insert(jobServiceRows)

    setSaving(false)

    if (servicesError) {
      toast.error("Job created, but services failed to attach: " + servicesError.message)
      return
    }

    toast.success(`Job created — ${grandTotal.toFixed(2)} LYD`)
    router.push("/operations")
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6 p-4 lg:p-6">
      <div className="flex items-center gap-3">
        <Link href="/operations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New Job</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a new vehicle service job.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Car className="h-4 w-4 text-blue-600" />
              Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Existing vehicle (optional)</Label>
              <Select value={existingVehicleId} onValueChange={handleSelectExistingVehicle}>
                <SelectTrigger>
                  <SelectValue placeholder="Search or select a registered vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.plate_number} — {[v.make, v.model].filter(Boolean).join(" ") || "Unnamed"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Leave blank for a walk-in — you can still fill in the fields below manually.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Plate Number</Label>
              <Input value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Vehicle (make/model)</Label>
              <Input
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                placeholder="e.g. Toyota Camry"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Input value={carColor} onChange={(e) => setCarColor(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label>Customer Phone</Label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Check className="h-4 w-4 text-blue-600" />
              Services
            </CardTitle>
            <p className="text-xs text-muted-foreground">Select one or more services.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingData && (
              <p className="text-sm text-muted-foreground">Loading services...</p>
            )}
            {!loadingData && services.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No active services yet — add some on the Services page first.
              </p>
            )}
            {services.map((service) => {
              const selected = isSelected(service.id)
              const selectedData = selectedServices.find((s) => s.serviceId === service.id)
              const price = toNumber(service.price)

              return (
                <div
                  key={service.id}
                  className={`rounded-lg border transition ${
                    selected ? "border-blue-500 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-950/20" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleService(service)}
                    className="flex w-full items-center justify-between p-4 text-left"
                  >
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {service.pricing_type === "custom"
                          ? "Custom price"
                          : service.pricing_type === "quantity"
                          ? `${price} LYD / ${service.unit_name || "unit"}`
                          : `${price} LYD`}
                      </p>
                    </div>
                    {selected ? (
                      <Badge className="bg-blue-600">Selected</Badge>
                    ) : (
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {selected && service.pricing_type === "quantity" && (
                    <div className="flex items-center gap-2 border-t px-4 py-3">
                      <Label className="text-xs">Quantity ({service.unit_name || "unit"})</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        className="h-8 w-24"
                        value={selectedData?.quantity ?? 1}
                        onChange={(e) =>
                          updateSelectedService(service.id, { quantity: Number(e.target.value) })
                        }
                      />
                    </div>
                  )}

                  {selected && service.pricing_type === "custom" && (
                    <div className="flex items-center gap-2 border-t px-4 py-3">
                      <Label className="text-xs">Price (LYD)</Label>
                      <Input
                        type="number"
                        min="0"
                        className="h-8 w-28"
                        value={selectedData?.customPrice ?? ""}
                        onChange={(e) =>
                          updateSelectedService(service.id, { customPrice: e.target.value })
                        }
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Worker</Label>
              <Select value={workerId} onValueChange={(value) => setWorkerId(value ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Position / Spot</Label>
              <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label>Special Instructions</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="h-4 w-4 text-blue-600" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Services</span>
                <span>{selectedServices.length}</span>
              </div>

              {selectedWithDetails.map(({ service, total }) => (
                <div key={service.id} className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{service.name}</span>
                  <span>{total.toFixed(2)} LYD</span>
                </div>
              ))}

              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="text-lg font-semibold">{grandTotal.toFixed(2)} LYD</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCreateJob}
              disabled={selectedServices.length === 0 || saving}
              className="mt-6 w-full"
            >
              {saving ? "Creating..." : "Create Job"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
