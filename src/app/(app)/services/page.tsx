"use client"

import { useEffect, useState } from "react"
import { Loader2, MoreHorizontal, Plus } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"

type PricingType = "fixed" | "quantity" | "custom"

type Service = {
  id: string
  name: string
  category: string | null
  pricing_type: PricingType
  price: number | null
  unit_name: string | null
  duration_minutes: number | null
  enabled: boolean
}

type FormState = {
  name: string
  category: string
  pricing_type: PricingType
  price: string
  unit_name: string
  duration_minutes: string
}

const emptyForm: FormState = {
  name: "",
  category: "",
  pricing_type: "fixed",
  price: "",
  unit_name: "",
  duration_minutes: "",
}

function formatPrice(service: Service) {
  if (service.pricing_type === "custom") return "Custom"
  if (service.price == null) return "—"
  if (service.pricing_type === "quantity" && service.unit_name) {
    return `${service.price} LYD / ${service.unit_name}`
  }
  return `${service.price} LYD`
}

function formatDuration(minutes: number | null) {
  return minutes ? `${minutes} min` : "—"
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  async function loadServices() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) {
      toast.error("Couldn't load services: " + error.message)
    } else {
      setServices((data as Service[]) ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadServices()
  }, [])

  function openAddDialog() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEditDialog(service: Service) {
    setEditingId(service.id)
    setForm({
      name: service.name,
      category: service.category ?? "",
      pricing_type: service.pricing_type,
      price: service.price != null ? String(service.price) : "",
      unit_name: service.unit_name ?? "",
      duration_minutes:
        service.duration_minutes != null ? String(service.duration_minutes) : "",
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Service name is required")
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
      name: form.name.trim(),
      category: form.category.trim() || null,
      pricing_type: form.pricing_type,
      price: form.price ? Number(form.price) : null,
      unit_name: form.pricing_type === "quantity" ? form.unit_name.trim() || null : null,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
    }

    const { error } = editingId
      ? await supabase.from("services").update(payload).eq("id", editingId)
      : await supabase.from("services").insert({ ...payload, enabled: true })

    setSaving(false)

    if (error) {
      toast.error("Couldn't save: " + error.message)
      return
    }

    toast.success(editingId ? "Service updated" : "Service added")
    setDialogOpen(false)
    loadServices()
  }

  async function handleToggleEnabled(service: Service) {
    const supabase = createClient()
    const { error } = await supabase
      .from("services")
      .update({ enabled: !service.enabled })
      .eq("id", service.id)

    if (error) {
      toast.error("Couldn't update: " + error.message)
      return
    }
    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, enabled: !s.enabled } : s))
    )
  }

  async function handleDelete(service: Service) {
    if (!confirm(`Delete "${service.name}"? This can't be undone.`)) return

    const supabase = createClient()
    const { error } = await supabase.from("services").delete().eq("id", service.id)

    if (error) {
      toast.error("Couldn't delete: " + error.message)
      return
    }
    toast.success("Service deleted")
    setServices((prev) => prev.filter((s) => s.id !== service.id))
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 lg:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure the services your car wash offers.
          </p>
        </div>

        <Button className="gap-2" onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading services...
        </div>
      )}

      {!loading && services.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          No services yet. Add your first one to get started.
        </div>
      )}

      {!loading && services.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-base">{service.name}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {service.category || "Uncategorized"}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(service)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(service)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/60 p-3">
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="mt-1 font-semibold">{formatPrice(service)}</p>
                  </div>
                  <div className="rounded-lg bg-muted/60 p-3">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatDuration(service.duration_minutes)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={service.enabled}
                      onCheckedChange={() => handleToggleEnabled(service)}
                    />
                    <Badge variant={service.enabled ? "default" : "secondary"}>
                      {service.enabled ? "Active" : "Disabled"}
                    </Badge>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => openEditDialog(service)}>
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit service" : "Add service"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g. Wash, Detailing, Maintenance"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Pricing type</Label>
              <Select
                value={form.pricing_type}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, pricing_type: v as PricingType }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed price</SelectItem>
                  <SelectItem value="quantity">Price per unit</SelectItem>
                  <SelectItem value="custom">Custom (set per job)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.pricing_type !== "custom" && (
              <div className="space-y-2">
                <Label htmlFor="price">Price (LYD)</Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
            )}

            {form.pricing_type === "quantity" && (
              <div className="space-y-2">
                <Label htmlFor="unit_name">Unit name</Label>
                <Input
                  id="unit_name"
                  placeholder="e.g. liter, item"
                  value={form.unit_name}
                  onChange={(e) => setForm((f) => ({ ...f, unit_name: e.target.value }))}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={form.duration_minutes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duration_minutes: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save changes" : "Add service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
