"use client"

import { useEffect, useMemo, useState } from "react"
import { Car, Loader2, Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

type Vehicle = {
  id: string
  plate_number: string
  make: string | null
  model: string | null
  year: number | null
  car_color: string | null
  customer_id: string | null
}

type Customer = {
  id: string
  name: string
}

type FormState = {
  plate_number: string
  make: string
  model: string
  year: string
  car_color: string
  customer_id: string
}

const emptyForm: FormState = {
  plate_number: "",
  make: "",
  model: "",
  year: "",
  car_color: "",
  customer_id: "",
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [visitStats, setVisitStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    const supabase = createClient()

    const [{ data: vehicleData, error: vehicleError }, { data: customerData }, { data: statsData }] =
      await Promise.all([
        supabase.from("vehicles").select("*").order("created_at", { ascending: true }),
        supabase.from("customers").select("id, name").order("name", { ascending: true }),
        supabase.from("vehicle_visit_stats").select("vehicle_id, visit_count"),
      ])

    if (vehicleError) {
      toast.error("Couldn't load vehicles: " + vehicleError.message)
      setLoading(false)
      return
    }

    setVehicles((vehicleData as Vehicle[]) ?? [])
    setCustomers((customerData as Customer[]) ?? [])

    const stats: Record<string, number> = {}
    for (const row of statsData ?? []) {
      stats[row.vehicle_id] = row.visit_count
    }
    setVisitStats(stats)

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const customerName = (id: string | null) =>
    customers.find((c) => c.id === id)?.name ?? "No owner set"

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return vehicles
    return vehicles.filter(
      (v) =>
        v.plate_number.toLowerCase().includes(q) ||
        (v.make ?? "").toLowerCase().includes(q) ||
        (v.model ?? "").toLowerCase().includes(q) ||
        customerName(v.customer_id).toLowerCase().includes(q)
    )
  }, [search, vehicles, customers])

  function openAddDialog() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEditDialog(vehicle: Vehicle) {
    setEditingId(vehicle.id)
    setForm({
      plate_number: vehicle.plate_number,
      make: vehicle.make ?? "",
      model: vehicle.model ?? "",
      year: vehicle.year != null ? String(vehicle.year) : "",
      car_color: vehicle.car_color ?? "",
      customer_id: vehicle.customer_id ?? "",
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.plate_number.trim()) {
      toast.error("Plate number is required")
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

    const payload = {
      business_id: profile.business_id,
      plate_number: form.plate_number.trim(),
      make: form.make.trim() || null,
      model: form.model.trim() || null,
      year: form.year ? Number(form.year) : null,
      car_color: form.car_color.trim() || null,
      customer_id: form.customer_id || null,
    }

    const { error } = editingId
      ? await supabase.from("vehicles").update(payload).eq("id", editingId)
      : await supabase.from("vehicles").insert(payload)

    setSaving(false)

    if (error) {
      toast.error("Couldn't save: " + error.message)
      return
    }

    toast.success(editingId ? "Vehicle updated" : "Vehicle added")
    setDialogOpen(false)
    loadData()
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 lg:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vehicles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vehicles registered with your car wash.
          </p>
        </div>

        <Button className="gap-2" onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search plate, vehicle or owner..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading vehicles...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          {vehicles.length === 0
            ? "No vehicles yet. Add your first one to get started."
            : "No vehicles match that search."}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((vehicle) => (
            <Card
              key={vehicle.id}
              className="cursor-pointer transition-shadow hover:shadow-sm"
              onClick={() => openEditDialog(vehicle)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <Car className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          {[vehicle.make, vehicle.model].filter(Boolean).join(" ") || "Unnamed vehicle"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {vehicle.year ?? "Year not set"}
                        </p>
                      </div>
                      <span className="rounded-md border px-2 py-1 text-xs font-medium">
                        {vehicle.plate_number}
                      </span>
                    </div>

                    <div className="mt-5 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Owner</span>
                        <span className="font-medium">{customerName(vehicle.customer_id)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Visits</span>
                        <span className="font-medium">{visitStats[vehicle.id] ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit vehicle" : "Add vehicle"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plate_number">Plate number</Label>
              <Input
                id="plate_number"
                value={form.plate_number}
                onChange={(e) => setForm((f) => ({ ...f, plate_number: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  placeholder="Toyota"
                  value={form.make}
                  onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="Camry"
                  value={form.model}
                  onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="2021"
                  value={form.year}
                  onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="car_color">Color</Label>
                <Input
                  id="car_color"
                  value={form.car_color}
                  onChange={(e) => setForm((f) => ({ ...f, car_color: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Owner</Label>
              <Select
                value={form.customer_id}
                onValueChange={(v) => setForm((f) => ({ ...f, customer_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No owner set" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {customers.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No customers yet — add one on the Customers page first if you want to link an owner.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save changes" : "Add vehicle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
