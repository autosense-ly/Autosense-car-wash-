"use client"

import { useEffect, useState } from "react"
import { Clock3, Loader2, MoreHorizontal, Plus } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { useLanguage } from "@/lib/i18n/language-provider"
import { translations } from "@/lib/i18n/translations"
import { servicesFormTranslations } from "@/lib/i18n/services"

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
  const { language } = useLanguage()
  const t = translations[language]
  const formT = servicesFormTranslations[language]

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
        service.duration_minutes != null
          ? String(service.duration_minutes)
          : "",
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

    const {
      data: { user },
    } = await supabase.auth.getUser()

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
      unit_name:
        form.pricing_type === "quantity"
          ? form.unit_name.trim() || null
          : null,
      duration_minutes: form.duration_minutes
        ? Number(form.duration_minutes)
        : null,
    }

    const { error } = editingId
      ? await supabase
          .from("services")
          .update(payload)
          .eq("id", editingId)
      : await supabase
          .from("services")
          .insert({ ...payload, enabled: true })

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
      prev.map((s) =>
        s.id === service.id
          ? { ...s, enabled: !s.enabled }
          : s,
      ),
    )
  }

  async function handleDelete(service: Service) {
    if (!confirm(`Delete "${service.name}"? This can't be undone.`)) {
      return
    }

    const supabase = createClient()

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", service.id)

    if (error) {
      toast.error("Couldn't delete: " + error.message)
      return
    }

    toast.success("Service deleted")
    setServices((prev) => prev.filter((s) => s.id !== service.id))
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="space-y-5">
        <section className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Services
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Configure the services your car wash offers.
            </p>
          </div>

          <Button
            onClick={openAddDialog}
            className="h-10 w-full gap-2 rounded-xl bg-blue-600 px-4 shadow-sm hover:bg-blue-700 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </section>

        {loading && (
          <Card size="sm" className="premium-hover">
            <CardContent className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading services...
            </CardContent>
          </Card>
        )}

        {!loading && services.length === 0 && (
          <Card size="sm" className="premium-hover">
            <CardContent className="flex min-h-[220px] items-center justify-center px-4 py-10 text-center">
              <div className="max-w-sm">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <Plus className="h-5 w-5" />
                </div>

                <p className="mt-4 text-sm font-semibold">
                  No services yet
                </p>

                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                  Add your first service to get started.
                </p>

                <Button
                  onClick={openAddDialog}
                  className="mt-4 h-9 rounded-xl bg-blue-600 px-4 text-xs hover:bg-blue-700"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add Service
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && services.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <Card
                key={service.id}
                size="sm"
                className="premium-hover"
              >
                <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 py-4 sm:px-5">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-[15px] font-semibold">
                      {service.name}
                    </CardTitle>

                    <p className="mt-1 truncate text-[11px] text-muted-foreground sm:text-xs">
                      {service.category || "Uncategorized"}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => openEditDialog(service)}
                      >
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleDelete(service)}
                        className="text-destructive focus:text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                      <p className="text-[10px] font-medium text-muted-foreground">
                        Price
                      </p>

                      <p className="mt-1 truncate text-[12px] font-semibold sm:text-sm">
                        {formatPrice(service)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                      <p className="text-[10px] font-medium text-muted-foreground">
                        Duration
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-[12px] font-semibold sm:text-sm">
                        <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatDuration(service.duration_minutes)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={service.enabled}
                        onCheckedChange={() =>
                          handleToggleEnabled(service)
                        }
                      />

                      <Badge
                        variant={
                          service.enabled ? "default" : "secondary"
                        }
                        className="rounded-full px-2.5 py-0.5 text-[10px]"
                      >
                        {service.enabled ? "Active" : "Disabled"}
                      </Badge>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(service)}
                      className="h-9 rounded-xl px-3 text-xs"
                    >
                      Edit
                    </Button>
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
                {editingId ? "Edit service" : "Add service"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>

                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                    }))
                  }
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>

                <Input
                  id="category"
                  placeholder={formT.categoryPlaceholder}
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      category: e.target.value,
                    }))
                  }
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>{t.services.pricingType}</Label>

                <Select
                  value={form.pricing_type}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      pricing_type: v as PricingType,
                    }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="fixed">
                      Fixed price
                    </SelectItem>

                    <SelectItem value="quantity">
                      Price per unit
                    </SelectItem>

                    <SelectItem value="custom">
                      Custom (set per job)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.pricing_type !== "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="price">{t.services.priceLyD}</Label>

                  <Input
                    id="price"
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        price: e.target.value,
                      }))
                    }
                    className="h-10 rounded-xl"
                  />
                </div>
              )}

              {form.pricing_type === "quantity" && (
                <div className="space-y-2">
                  <Label htmlFor="unit_name">
                    {t.services.unitName}
                  </Label>

                  <Input
                    id="unit_name"
                    placeholder={formT.unitNamePlaceholder}
                    value={form.unit_name}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        unit_name: e.target.value,
                      }))
                    }
                    className="h-10 rounded-xl"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="duration">
                  Duration (minutes)
                </Label>

                <Input
                  id="duration"
                  type="number"
                  value={form.duration_minutes}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      duration_minutes: e.target.value,
                    }))
                  }
                  className="h-10 rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Add service"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
