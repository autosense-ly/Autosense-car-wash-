"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  UserRound,
} from "lucide-react"
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
import { useLanguage } from "@/lib/i18n/language-provider"
import { employeesTranslations } from "@/lib/i18n/employees"

type PayType = "salary" | "percentage"
type Frequency = "daily" | "weekly" | "monthly"

type Worker = {
  id: string
  name: string
  phone: string | null
  pay_type: PayType
  salary_amount: number | null
  salary_frequency: Frequency | null
  percentage_rate: number | null
  active: boolean
}

type FormState = {
  name: string
  phone: string
  pay_type: PayType
  salary_amount: string
  salary_frequency: Frequency
  percentage_rate: string
}

const emptyForm: FormState = {
  name: "",
  phone: "",
  pay_type: "salary",
  salary_amount: "",
  salary_frequency: "monthly",
  percentage_rate: "",
}

function formatPay(worker: Worker, t: (typeof employeesTranslations)["en"]) {
  if (worker.pay_type === "percentage") {
    return worker.percentage_rate != null
      ? `${worker.percentage_rate}% ${t.perJob}`
      : t.percentage
  }

  if (worker.salary_amount != null) {
    const frequency =
      worker.salary_frequency === "daily"
        ? t.perDay
        : worker.salary_frequency === "weekly"
          ? t.perWeek
          : t.perMonth

    return `${worker.salary_amount} LYD / ${frequency}`
  }

  return t.salary
}

export default function EmployeesPage() {
  const { language } = useLanguage()
  const t = employeesTranslations[language]

  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  async function loadWorkers() {
    setLoading(true)

    const supabase = createClient()

    const { data, error } = await supabase
      .from("workers")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) {
      toast.error(`${t.errors.load}: ${error.message}`)
    } else {
      setWorkers((data as Worker[]) ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadWorkers()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    if (!q) return workers

    return workers.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        (w.phone ?? "").includes(q),
    )
  }, [search, workers])

  function openAddDialog() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEditDialog(worker: Worker) {
    setEditingId(worker.id)

    setForm({
      name: worker.name,
      phone: worker.phone ?? "",
      pay_type: worker.pay_type,
      salary_amount:
        worker.salary_amount != null ? String(worker.salary_amount) : "",
      salary_frequency: worker.salary_frequency ?? "monthly",
      percentage_rate:
        worker.percentage_rate != null
          ? String(worker.percentage_rate)
          : "",
    })

    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error(t.errors.nameRequired)
      return
    }

    setSaving(true)

    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error(t.errors.notLoggedIn)
      setSaving(false)
      return
    }

    const { data: profile } = await supabase
      .from("app_users")
      .select("business_id")
      .eq("id", user.id)
      .single()

    if (!profile) {
      toast.error(t.errors.businessNotFound)
      setSaving(false)
      return
    }

    const payload = {
      business_id: profile.business_id,
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      pay_type: form.pay_type,
      salary_amount:
        form.pay_type === "salary" && form.salary_amount
          ? Number(form.salary_amount)
          : null,
      salary_frequency:
        form.pay_type === "salary" ? form.salary_frequency : null,
      percentage_rate:
        form.pay_type === "percentage" && form.percentage_rate
          ? Number(form.percentage_rate)
          : null,
    }

    const { error } = editingId
      ? await supabase
          .from("workers")
          .update(payload)
          .eq("id", editingId)
      : await supabase
          .from("workers")
          .insert({ ...payload, active: true })

    setSaving(false)

    if (error) {
      toast.error(`${t.errors.save}: ${error.message}`)
      return
    }

    toast.success(
      editingId ? t.success.updated : t.success.added,
    )

    setDialogOpen(false)
    loadWorkers()
  }

  async function handleToggleActive(worker: Worker) {
    const supabase = createClient()

    const { error } = await supabase
      .from("workers")
      .update({ active: !worker.active })
      .eq("id", worker.id)

    if (error) {
      toast.error(`${t.errors.update}: ${error.message}`)
      return
    }

    setWorkers((prev) =>
      prev.map((w) =>
        w.id === worker.id
          ? { ...w, active: !w.active }
          : w,
      ),
    )
  }

  async function handleDelete(worker: Worker) {
    if (!confirm(`${t.confirmRemove.replace("{name}", worker.name)} ${t.cannotUndo}`)) {
      return
    }

    const supabase = createClient()

    const { error } = await supabase
      .from("workers")
      .delete()
      .eq("id", worker.id)

    if (error) {
      toast.error(`${t.errors.delete}: ${error.message}`)
      return
    }

    toast.success(t.success.removed)

    setWorkers((prev) =>
      prev.filter((w) => w.id !== worker.id),
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="space-y-5">
        <section className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {t.title}
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {t.description}
            </p>
          </div>

          <Button
            onClick={openAddDialog}
            className="h-10 w-full gap-2 rounded-xl bg-blue-600 px-4 shadow-sm hover:bg-blue-700 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {t.addEmployee}
          </Button>
        </section>

        <Card size="sm" className="premium-hover">
          <CardContent className="p-3 sm:p-4">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder={t.searchPlaceholder}
                className="h-10 rounded-xl border-border/70 bg-background pl-9 text-sm shadow-none focus-visible:ring-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {loading && (
          <Card size="sm" className="premium-hover">
            <CardContent className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t.loading}
            </CardContent>
          </Card>
        )}

        {!loading && filtered.length === 0 && (
          <Card size="sm" className="premium-hover">
            <CardContent className="flex min-h-[220px] items-center justify-center px-4 py-10 text-center">
              <div className="max-w-sm">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <UserRound className="h-5 w-5" />
                </div>

                <p className="mt-4 text-sm font-semibold">
                  {workers.length === 0
                    ? t.noEmployeesYet
                    : t.noEmployeesFound}
                </p>

                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                  {workers.length === 0
                    ? t.addFirstEmployee
                    : t.tryDifferentSearch}
                </p>

                {workers.length === 0 && (
                  <Button
                    onClick={openAddDialog}
                    className="mt-4 h-9 rounded-xl bg-blue-600 px-4 text-xs hover:bg-blue-700"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    {t.addEmployee}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((worker) => (
              <Card
                key={worker.id}
                size="sm"
                className="premium-hover"
              >
                <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 py-4 sm:px-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      <UserRound className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <CardTitle className="truncate text-[15px] font-semibold">
                        {worker.name}
                      </CardTitle>

                      <p className="mt-1 truncate text-[11px] text-muted-foreground sm:text-xs">
                        {worker.phone || t.noPhone}
                      </p>
                    </div>
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
                        onClick={() => openEditDialog(worker)}
                      >
                        {t.edit}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleDelete(worker)}
                        className="text-destructive focus:text-destructive"
                      >
                        {t.remove}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                      <p className="text-[10px] font-medium text-muted-foreground">
                        {t.payment}
                      </p>

                      <p className="mt-1 truncate text-[12px] font-semibold sm:text-sm">
                        {formatPay(worker, t)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                      <p className="text-[10px] font-medium text-muted-foreground">
                        {t.type}
                      </p>

                      <p className="mt-1 text-[12px] font-semibold sm:text-sm">
                        {worker.pay_type === "salary"
                          ? t.salary
                          : t.percentage}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={worker.active}
                        onCheckedChange={() =>
                          handleToggleActive(worker)
                        }
                      />

                      <Badge
                        variant={
                          worker.active ? "default" : "secondary"
                        }
                        className="rounded-full px-2.5 py-0.5 text-[10px]"
                      >
                        {worker.active ? t.active : t.inactive}
                      </Badge>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(worker)}
                      className="h-9 rounded-xl px-3 text-xs"
                    >
                      {t.edit}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        >
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">
                {editingId
                  ? t.editEmployeeTitle
                  : t.addEmployeeTitle}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t.name}</Label>

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
                <Label htmlFor="phone">{t.phone}</Label>

                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      phone: e.target.value,
                    }))
                  }
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>{t.payType}</Label>

                <Select
                  value={form.pay_type}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      pay_type: v as PayType,
                    }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="salary">
                      {t.fixedSalary}
                    </SelectItem>

                    <SelectItem value="percentage">
                      {t.percentagePerJob}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.pay_type === "salary" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="salary_amount">
                      {t.salaryAmount}
                    </Label>

                    <Input
                      id="salary_amount"
                      type="number"
                      value={form.salary_amount}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          salary_amount: e.target.value,
                        }))
                      }
                      className="h-10 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t.frequency}</Label>

                    <Select
                      value={form.salary_frequency}
                      onValueChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          salary_frequency: v as Frequency,
                        }))
                      }
                    >
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="daily">
                          {t.daily}
                        </SelectItem>

                        <SelectItem value="weekly">
                          {t.weekly}
                        </SelectItem>

                        <SelectItem value="monthly">
                          {t.monthly}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="percentage_rate">
                    {t.percentageRate}
                  </Label>

                  <Input
                    id="percentage_rate"
                    type="number"
                    value={form.percentage_rate}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        percentage_rate: e.target.value,
                      }))
                    }
                    className="h-10 rounded-xl"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="rounded-xl"
              >
                {t.cancel}
              </Button>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                {saving
                  ? t.saving
                  : editingId
                    ? t.saveChanges
                    : t.addEmployee}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
