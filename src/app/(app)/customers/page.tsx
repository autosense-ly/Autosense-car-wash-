"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Phone, Plus, Search, UserRound } from "lucide-react"
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
import { createClient } from "@/lib/supabase/client"

type Customer = {
  id: string
  name: string
  phone: string | null
}

type FormState = {
  name: string
  phone: string
}

const emptyForm: FormState = { name: "", phone: "" }

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [carCounts, setCarCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  async function loadCustomers() {
    setLoading(true)

    const supabase = createClient()

    const { data: customerData, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) {
      toast.error("Couldn't load customers: " + error.message)
      setLoading(false)
      return
    }

    setCustomers((customerData as Customer[]) ?? [])

    const { data: vehicles } = await supabase
      .from("vehicles")
      .select("customer_id")

    const counts: Record<string, number> = {}

    for (const v of vehicles ?? []) {
      if (v.customer_id) {
        counts[v.customer_id] = (counts[v.customer_id] ?? 0) + 1
      }
    }

    setCarCounts(counts)
    setLoading(false)
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    if (!q) return customers

    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone ?? "").includes(q),
    )
  }, [search, customers])

  function openAddDialog() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEditDialog(customer: Customer) {
    setEditingId(customer.id)
    setForm({
      name: customer.name,
      phone: customer.phone ?? "",
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
      phone: form.phone.trim() || null,
    }

    const { error } = editingId
      ? await supabase
          .from("customers")
          .update(payload)
          .eq("id", editingId)
      : await supabase.from("customers").insert(payload)

    setSaving(false)

    if (error) {
      toast.error("Couldn't save: " + error.message)
      return
    }

    toast.success(editingId ? "Customer updated" : "Customer added")
    setDialogOpen(false)
    loadCustomers()
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="space-y-5">
        <section className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Customers
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Customer records and visit history.
            </p>
          </div>

          <Button
            onClick={openAddDialog}
            className="h-10 w-full gap-2 rounded-xl bg-blue-600 px-4 shadow-sm hover:bg-blue-700 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </section>

        <Card size="sm" className="premium-hover">
          <CardContent className="p-3 sm:p-4">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Search customer or phone..."
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
              Loading customers...
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
                  {customers.length === 0
                    ? "No customers yet"
                    : "No customers found"}
                </p>

                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                  {customers.length === 0
                    ? "Add your first customer to get started."
                    : "Try changing your search."}
                </p>

                {customers.length === 0 && (
                  <Button
                    onClick={openAddDialog}
                    className="mt-4 h-9 rounded-xl bg-blue-600 px-4 text-xs hover:bg-blue-700"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add Customer
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((customer) => (
              <Card
                key={customer.id}
                size="sm"
                className="premium-hover"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      <UserRound className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold sm:text-sm">
                        {customer.name}
                      </p>

                      <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-muted-foreground sm:text-xs">
                        <Phone className="h-3 w-3 shrink-0" />
                        {customer.phone || "No phone"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                      <p className="text-[10px] font-medium text-muted-foreground">
                        Cars
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {carCounts[customer.id] ?? 0}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                      <p className="text-[10px] font-medium text-muted-foreground">
                        Visits
                      </p>

                      <p className="mt-1 text-sm font-semibold text-muted-foreground">
                        —
                      </p>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                      <p className="text-[10px] font-medium text-muted-foreground">
                        Last
                      </p>

                      <p className="mt-1 text-sm font-semibold text-muted-foreground">
                        —
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="mt-4 h-9 w-full rounded-xl text-xs"
                    onClick={() => openEditDialog(customer)}
                  >
                    Edit Customer
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">
                {editingId ? "Edit customer" : "Add customer"}
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
                <Label htmlFor="phone">Phone</Label>

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
                    : "Add customer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
