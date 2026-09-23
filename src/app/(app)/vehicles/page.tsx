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
import { useLanguage } from "@/lib/i18n/language-provider"
import { vehiclesTranslations } from "@/lib/i18n/vehicles"

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
  const { language } = useLanguage()
  const vt = vehiclesTranslations[language]

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

    const [
      { data: vehicleData, error: vehicleError },
      { data: customerData },
      { data: statsData },
    ] = await Promise.all([
      supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: true }),
      supabase
        .from("customers")
        .select("id, name")
        .order("name", { ascending: true }),
      supabase
        .from("vehicle_visit_stats")
        .select("vehicle_id, visit_count"),
    ])

    if (vehicleError) {
      toast.error(`${vt.errors.load}: ${vehicleError.message}`)
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
    customers.find((c) => c.id === id)?.name ?? vt.noOwnerSet

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    if (!q) return vehicles

    return vehicles.filter(
      (v) =>
        v.plate_number.toLowerCase().includes(q) ||
        (v.make ?? "").toLowerCase().includes(q) ||
        (v.model ?? "").toLowerCase().includes(q) ||
        customerName(v.customer_id).toLowerCase().includes(q),
    )
  }, [search, vehicles, customers, vt.noOwnerSet])

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
      toast.error(vt.errors.plateRequired)
      return
    }

    setSaving(true)

    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error(vt.errors.notLoggedIn)
      setSaving(false)
      return
    }

    const { data: profile } = await supabase
      .from("app_users")
      .select("business_id")
      .eq("id", user.id)
      .single()

    if (!profile) {
      toast.error(vt.errors.businessNotFound)
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
      ? await supabase
          .from("vehicles")
          .update(payload)
          .eq("id", editingId)
      : await supabase.from("vehicles").insert(payload)

    setSaving(false)

    if (error) {
      toast.error(`${vt.errors.save}: ${error.message}`)
      return
    }

    toast.success(editingId ? vt.success.updated : vt.success.added)
    setDialogOpen(false)
    loadData()
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="space-y-5">
        <section className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {vt.title}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {vt.description}
            </p>
          </div>

          <Button
            onClick={openAddDialog}
            className="h-10 w-full gap-2 rounded-xl bg-blue-600 px-4 shadow-sm hover:bg-blue-700 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {vt.addVehicle}
          </Button>
        </section>

        <Card size="sm" className="premium-hover">
          <CardContent className="p-3 sm:p-4">
            <div className="relative w-full max-w-xl">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder={vt.searchPlaceholder}
                className="h-10 rounded-xl border-border/70 bg-background ps-9 text-sm shadow-none focus-visible:ring-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {loading && (
          <Card size="sm" className="premium-hover">
            <CardContent className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="me-2 h-5 w-5 animate-spin" />
              {vt.loading}
            </CardContent>
          </Card>
        )}

        {!loading && filtered.length === 0 && (
          <Card size="sm" className="premium-hover">
            <CardContent className="flex min-h-[220px] items-center justify-center px-4 py-10 text-center">
              <div className="max-w-sm">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <Car className="h-5 w-5" />
                </div>

                <p className="mt-4 text-sm font-semibold">
                  {vehicles.length === 0
                    ? vt.noVehiclesYet
                    : vt.noVehiclesFound}
                </p>

                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                  {vehicles.length === 0
                    ? vt.addFirstVehicle
                    : vt.tryDifferentSearch}
                </p>

                {vehicles.length === 0 && (
                  <Button
                    onClick={openAddDialog}
                    className="mt-4 h-9 rounded-xl bg-blue-600 px-4 text-xs hover:bg-blue-700"
                  >
                    <Plus className="me-1.5 h-3.5 w-3.5" />
                    {vt.addVehicle}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((vehicle) => (
              <Card
                key={vehicle.id}
                size="sm"
                className="premium-hover cursor-pointer"
                onClick={() => openEditDialog(vehicle)}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      <Car className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold sm:text-sm">
                            {[vehicle.make, vehicle.model]
                              .filter(Boolean)
                              .join(" ") || vt.unnamedVehicle}
                          </p>

                          <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
                            {vehicle.year ?? vt.yearNotSet}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-lg border border-border/70 bg-muted/30 px-2.5 py-1 text-[10px] font-semibold tracking-wide sm:text-xs">
                          {vehicle.plate_number}
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-2">
                        <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                          <p className="text-[10px] font-medium text-muted-foreground">
                            {vt.owner}
                          </p>

                          <p className="mt-1 truncate text-[12px] font-semibold">
                            {customerName(vehicle.customer_id)}
                          </p>
                        </div>

                        <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                          <p className="text-[10px] font-medium text-muted-foreground">
                            {vt.visits}
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {visitStats[vehicle.id] ?? 0}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-[10px] text-muted-foreground">
                        {vt.clickToEdit}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">
                {editingId ? vt.editVehicle : vt.addVehicleTitle}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="plate_number">{vt.plateNumber}</Label>

                <Input
                  id="plate_number"
                  value={form.plate_number}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      plate_number: e.target.value,
                    }))
                  }
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="make">{vt.make}</Label>

                  <Input
                    id="make"
                    placeholder="Toyota"
                    value={form.make}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        make: e.target.value,
                      }))
                    }
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">{vt.model}</Label>

                  <Input
                    id="model"
                    placeholder="Camry"
                    value={form.model}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        model: e.target.value,
                      }))
                    }
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="year">{vt.year}</Label>

                  <Input
                    id="year"
                    type="number"
                    placeholder="2021"
                    value={form.year}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        year: e.target.value,
                      }))
                    }
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="car_color">{vt.color}</Label>

                  <Input
                    id="car_color"
                    value={form.car_color}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        car_color: e.target.value,
                      }))
                    }
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{vt.owner}</Label>

                <Select
                  value={form.customer_id}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      customer_id: v ?? "",
                    }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder={vt.noOwnerSet} />
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
                  <p className="text-[11px] leading-5 text-muted-foreground">
                    {vt.noCustomersHint}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="rounded-xl"
              >
                {vt.cancel}
              </Button>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                {saving
                  ? vt.saving
                  : editingId
                    ? vt.saveChanges
                    : vt.addVehicle}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
