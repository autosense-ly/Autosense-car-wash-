"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, MoreHorizontal, Plus, Search, UserRound } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

function formatPay(worker: Worker) {
  if (worker.pay_type === "percentage") {
    return worker.percentage_rate != null ? `${worker.percentage_rate}% per job` : "Percentage"
  }
  if (worker.salary_amount != null) {
    return `${worker.salary_amount} LYD / ${worker.salary_frequency ?? "month"}`
  }
  return "Salary"
}

export default function EmployeesPage() {
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
      toast.error("Couldn't load employees: " + error.message)
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
      (w) => w.name.toLowerCase().includes(q) || (w.phone ?? "").includes(q)
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
      salary_amount: worker.salary_amount != null ? String(worker.salary_amount) : "",
      salary_frequency: worker.salary_frequency ?? "monthly",
      percentage_rate: worker.percentage_rate != null ? String(worker.percentage_rate) : "",
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Name is required")
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
      phone: form.phone.trim() || null,
      pay_type: form.pay_type,
      salary_amount: form.pay_type === "salary" && form.salary_amount ? Number(form.salary_amount) : null,
      salary_frequency: form.pay_type === "salary" ? form.salary_frequency : null,
      percentage_rate: form.pay_type === "percentage" && form.percentage_rate ? Number(form.percentage_rate) : null,
    }

    const { error } = editingId
      ? await supabase.from("workers").update(payload).eq("id", editingId)
      : await supabase.from("workers").insert({ ...payload, active: true })

    setSaving(false)

    if (error) {
      toast.error("Couldn't save: " + error.message)
      return
    }

    toast.success(editingId ? "Employee updated" : "Employee added")
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
      toast.error("Couldn't update: " + error.message)
      return
    }
    setWorkers((prev) =>
      prev.map((w) => (w.id === worker.id ? { ...w, active: !w.active } : w))
    )
  }

  async function handleDelete(worker: Worker) {
    if (!confirm(`Remove "${worker.name}"? This can't be undone.`)) return

    const supabase = createClient()
    const { error } = await supabase.from("workers").delete().eq("id", worker.id)

    if (error) {
      toast.error("Couldn't delete: " + error.message)
      return
    }
    toast.success("Employee removed")
    setWorkers((prev) => prev.filter((w) => w.id !== worker.id))
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 lg:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage staff and payment arrangements. Owner and manager accounts are
            managed separately, under Settings.
          </p>
        </div>

        <Button className="gap-2" onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
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
          Loading employees...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          {workers.length === 0
            ? "No employees yet. Add your first one to get started."
            : "No employees match that search."}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((worker) => (
            <Card key={worker.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                      <UserRound className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">{worker.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {worker.phone || "No phone"}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(worker)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(worker)}
                        className="text-destructive"
                      >
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <Badge variant="outline">{formatPay(worker)}</Badge>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={worker.active}
                      onCheckedChange={() => handleToggleActive(worker)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {worker.active ? "Active" : "Inactive"}
                    </span>
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
            <DialogTitle>{editingId ? "Edit employee" : "Add employee"}</DialogTitle>
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
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Pay type</Label>
              <Select
                value={form.pay_type}
                onValueChange={(v) => setForm((f) => ({ ...f, pay_type: v as PayType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">Fixed salary</SelectItem>
                  <SelectItem value="percentage">Percentage per job</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.pay_type === "salary" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="salary_amount">Salary amount (LYD)</Label>
                  <Input
                    id="salary_amount"
                    type="number"
                    value={form.salary_amount}
                    onChange={(e) => setForm((f) => ({ ...f, salary_amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={form.salary_frequency}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, salary_frequency: v as Frequency }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="percentage_rate">Percentage rate (%)</Label>
                <Input
                  id="percentage_rate"
                  type="number"
                  value={form.percentage_rate}
                  onChange={(e) => setForm((f) => ({ ...f, percentage_rate: e.target.value }))}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save changes" : "Add employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
