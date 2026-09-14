"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Car,
  ClipboardList,
  CreditCard,
  Droplets,
  FileBarChart,
  Gauge,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
  Wrench,
  X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import * as React from "react"

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

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: PermissionKey
}

type NavSection = {
  label: string
  items: NavItem[]
}

type PermissionRow = Partial<Record<PermissionKey, boolean>>

const sections: NavSection[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
        permission: "dashboard",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Operations",
        href: "/operations",
        icon: Gauge,
        permission: "live_operations",
      },
      {
        label: "Jobs",
        href: "/jobs",
        icon: ClipboardList,
      },
    ],
  },
  {
    label: "Customers",
    items: [
      {
        label: "Customers",
        href: "/customers",
        icon: Users,
        permission: "customers",
      },
      {
        label: "Vehicles",
        href: "/vehicles",
        icon: Car,
        permission: "vehicles",
      },
    ],
  },
  {
    label: "Services & Staff",
    items: [
      {
        label: "Services",
        href: "/services",
        icon: Droplets,
        permission: "services",
      },
      {
        label: "Employees",
        href: "/employees",
        icon: Users,
        permission: "workers",
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        label: "Payments",
        href: "/payments",
        icon: CreditCard,
        permission: "payments",
      },
      {
        label: "Expenses",
        href: "/expenses",
        icon: Wallet,
        permission: "expenses",
      },
    ],
  },
  {
    label: "Analytics",
    items: [
      {
        label: "Reports",
        href: "/reports",
        icon: FileBarChart,
        permission: "reports",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        permission: "settings",
      },
    ],
  },
]

const permissionKeys: PermissionKey[] = [
  "dashboard",
  "reports",
  "expenses",
  "workers",
  "services",
  "payments",
  "checkin",
  "live_operations",
  "customers",
  "vehicles",
  "settings",
]

export function Sidebar({
  mobile = false,
  onClose,
}: {
  mobile?: boolean
  onClose?: () => void
}) {
  const pathname = usePathname()
  const [role, setRole] = React.useState<string | null>(null)
  const [permissions, setPermissions] = React.useState<
    Record<PermissionKey, boolean>
  >({} as Record<PermissionKey, boolean>)

  React.useEffect(() => {
    const supabase = createClient()

    async function loadAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: appUser } = await supabase
        .from("app_users")
        .select("role")
        .eq("id", user.id)
        .single()

      if (!appUser) return

      setRole(appUser.role)

      if (appUser.role === "owner") {
        setPermissions(
          Object.fromEntries(
            permissionKeys.map((key) => [key, true])
          ) as Record<PermissionKey, boolean>
        )
        return
      }

      const { data } = await supabase
        .from("manager_permissions")
        .select(permissionKeys.join(", "))
        .eq("user_id", user.id)
        .single()

      if (data) {
        const permissionRow = data as PermissionRow

        setPermissions(
          Object.fromEntries(
            permissionKeys.map((key) => [key, Boolean(permissionRow[key])])
          ) as Record<PermissionKey, boolean>
        )
      }
    }

    loadAccess()
  }, [])

  const visibleSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.permission) return true
        if (role === "owner") return true
        return permissions[item.permission] === true
      }),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <div className="flex h-full w-full flex-col bg-sidebar">
      <div className="flex h-[72px] shrink-0 items-center border-b border-sidebar-border px-5">
        <Link
          href="/"
          onClick={onClose}
          className="flex min-w-0 items-center gap-3"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
            <Wrench className="h-[18px] w-[18px]" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold tracking-tight text-sidebar-foreground">
              AF Car Wash
            </p>
            <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-sidebar-foreground/50">
              Car Wash Management
            </p>
          </div>
        </Link>

        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-6">
          {visibleSections.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/40">
                {section.label}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href ||
                        pathname.startsWith(`${item.href}/`)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={[
                        "group flex h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-all duration-150",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                          : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                      ].join(" ")}
                    >
                      <Icon
                        className={[
                          "h-[17px] w-[17px] shrink-0 transition-colors",
                          active
                            ? "text-sidebar-primary-foreground"
                            : "text-sidebar-foreground/45 group-hover:text-sidebar-foreground/75",
                        ].join(" ")}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-4">
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 px-3.5 py-3">
          <p className="text-[11px] font-semibold text-sidebar-foreground/80">
            AF Car Wash
          </p>
          <p className="mt-0.5 text-[10px] leading-relaxed text-sidebar-foreground/40">
            Car wash management
          </p>
        </div>
      </div>
    </div>
  )
}
