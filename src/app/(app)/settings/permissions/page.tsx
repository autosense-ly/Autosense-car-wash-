"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Check, LockKeyhole, Save } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/lib/i18n/language-provider"
import { permissionsTranslations } from "@/lib/i18n/permissions"

type PermissionKey =
  | "dashboard"
  | "reports"
  | "expenses"
  | "workers"
  | "services"
  | "payments"
  | "checkin"
  | "live_operations"
  | "customers"
  | "vehicles"
  | "settings"

type Manager = {
  id: string
  name: string
  email: string
  permissions: Record<PermissionKey, boolean>
}

const permissionDefinitions: {
  key: PermissionKey
  labelKey:
    | "dashboard"
    | "reports"
    | "expenses"
    | "employees"
    | "services"
    | "payments"
    | "checkin"
    | "liveOperations"
    | "customers"
    | "vehicles"
    | "settings"
  descriptionKey:
    | "dashboardDescription"
    | "reportsDescription"
    | "expensesDescription"
    | "employeesDescription"
    | "servicesDescription"
    | "paymentsDescription"
    | "checkinDescription"
    | "liveOperationsDescription"
    | "customersDescription"
    | "vehiclesDescription"
    | "settingsDescription"
}[] = [
  { key: "dashboard", labelKey: "dashboard", descriptionKey: "dashboardDescription" },
  { key: "reports", labelKey: "reports", descriptionKey: "reportsDescription" },
  { key: "expenses", labelKey: "expenses", descriptionKey: "expensesDescription" },
  { key: "workers", labelKey: "employees", descriptionKey: "employeesDescription" },
  { key: "services", labelKey: "services", descriptionKey: "servicesDescription" },
  { key: "payments", labelKey: "payments", descriptionKey: "paymentsDescription" },
  { key: "checkin", labelKey: "checkin", descriptionKey: "checkinDescription" },
  {
    key: "live_operations",
    labelKey: "liveOperations",
    descriptionKey: "liveOperationsDescription",
  },
  { key: "customers", labelKey: "customers", descriptionKey: "customersDescription" },
  { key: "vehicles", labelKey: "vehicles", descriptionKey: "vehiclesDescription" },
  { key: "settings", labelKey: "settings", descriptionKey: "settingsDescription" },
]

const emptyPermissions: Record<PermissionKey, boolean> = {
  dashboard: false,
  reports: false,
  expenses: false,
  workers: false,
  services: false,
  payments: false,
  checkin: false,
  live_operations: false,
  customers: false,
  vehicles: false,
  settings: false,
}

export default function PermissionsPage() {
  const { language } = useLanguage()
  const t = permissionsTranslations[language]

  const [managers, setManagers] = useState<Manager[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadManagers()
  }, [language])

  async function loadManagers() {
    const supabase = createClient()

    setLoading(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError(t.mustBeLoggedIn)
      setLoading(false)
      return
    }

    const { data: currentUser, error: userError } = await supabase
      .from("app_users")
      .select("business_id, role")
      .eq("id", user.id)
      .single()

    if (userError || !currentUser) {
      setError(userError?.message || t.accountLoadFailed)
      setLoading(false)
      return
    }

    if (currentUser.role !== "owner") {
      setError(t.ownerOnly)
      setLoading(false)
      return
    }

    const { data: managerRows, error: managerError } = await supabase
      .from("app_users")
      .select("id, name, email")
      .eq("business_id", currentUser.business_id)
      .eq("role", "manager")
      .order("name")

    if (managerError) {
      setError(managerError.message || t.managersLoadFailed)
      setLoading(false)
      return
    }

    const managerIds = (managerRows ?? []).map((manager) => manager.id)

    let permissionRows: any[] = []

    if (managerIds.length > 0) {
      const { data, error: permissionError } = await supabase
        .from("manager_permissions")
        .select(
          "user_id, dashboard, reports, expenses, workers, services, payments, checkin, live_operations, customers, vehicles, settings"
        )
        .in("user_id", managerIds)

      if (permissionError) {
        setError(permissionError.message || t.permissionsLoadFailed)
        setLoading(false)
        return
      }

      permissionRows = data ?? []
    }

    const formattedManagers: Manager[] = (managerRows ?? []).map((manager) => {
      const row = permissionRows.find(
        (permission) => permission.user_id === manager.id
      )

      return {
        id: manager.id,
        name: manager.name,
        email: manager.email,
        permissions: {
          ...emptyPermissions,
          ...(row ?? {}),
        },
      }
    })

    setManagers(formattedManagers)
    setLoading(false)
  }

  function togglePermission(managerId: string, key: PermissionKey) {
    setManagers((current) =>
      current.map((manager) =>
        manager.id === managerId
          ? {
              ...manager,
              permissions: {
                ...manager.permissions,
                [key]: !manager.permissions[key],
              },
            }
          : manager
      )
    )

    setSuccess(null)
  }

  async function savePermissions(manager: Manager) {
    const supabase = createClient()

    setSaving(manager.id)
    setError(null)
    setSuccess(null)

    const payload = {
      user_id: manager.id,
      ...manager.permissions,
    }

    const { data: existing, error: lookupError } = await supabase
      .from("manager_permissions")
      .select("id")
      .eq("user_id", manager.id)
      .maybeSingle()

    if (lookupError) {
      setError(lookupError.message || t.saveFailed)
      setSaving(null)
      return
    }

    let saveError = null

    if (existing) {
      const result = await supabase
        .from("manager_permissions")
        .update(manager.permissions)
        .eq("user_id", manager.id)

      saveError = result.error
    } else {
      const result = await supabase
        .from("manager_permissions")
        .insert(payload)

      saveError = result.error
    }

    if (saveError) {
      setError(saveError.message || t.saveFailed)
    } else {
      setSuccess(`${t.permissionsSaved} ${manager.name}.`)
    }

    setSaving(null)
  }

  return (
    <div className="mx-auto w-full max-w-[1000px] space-y-6 p-4 lg:p-6">
      <div className="flex items-start gap-3">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="mt-0.5">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.title}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {t.description}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}

      {loading && (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              {t.loadingManagers}
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && managers.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <LockKeyhole className="h-5 w-5 text-muted-foreground" />

              <div>
                <p className="font-medium">{t.noManagers}</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {t.noManagersDescription}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-5">
        {managers.map((manager) => (
          <Card key={manager.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base">
                    {manager.name}
                  </CardTitle>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {manager.email}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => savePermissions(manager)}
                  disabled={saving === manager.id}
                >
                  <Save className="me-2 h-4 w-4" />
                  {saving === manager.id ? t.saving : t.save}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              {permissionDefinitions.map((permission) => {
                const enabled = manager.permissions[permission.key]

                return (
                  <button
                    key={permission.key}
                    type="button"
                    onClick={() =>
                      togglePermission(manager.id, permission.key)
                    }
                    className="flex w-full items-center gap-4 rounded-xl border border-border p-4 text-left transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {t[permission.labelKey]}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {t[permission.descriptionKey]}
                      </p>
                    </div>

                    <div
                      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition-colors ${
                        enabled
                          ? "bg-blue-600"
                          : "bg-muted-foreground/30"
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                          enabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </button>
                )
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
