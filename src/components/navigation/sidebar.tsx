"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Car,
  ClipboardList,
  CreditCard,
  DollarSign,
  FileBarChart,
  Gauge,
  LayoutDashboard,
  Settings,
  UserRoundCog,
  Users,
  Wrench,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/lib/i18n/language-provider"
import { translations } from "@/lib/i18n/translations"

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

type SidebarProps = {
  mobile?: boolean
  onClose?: () => void
}

type NavItem = {
  href: string
  labelKey: keyof typeof translations.en.common
  icon: typeof Gauge
  permission?: PermissionKey
}

type NavSection = {
  labelKey: keyof typeof translations.en.common
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    labelKey: "overview",
    items: [
      {
        href: "/",
        labelKey: "dashboard",
        icon: LayoutDashboard,
        permission: "dashboard",
      },
    ],
  },
  {
    labelKey: "operations",
    items: [
      {
        href: "/operations",
        labelKey: "operations",
        icon: Gauge,
        permission: "live_operations",
      },
      {
        href: "/jobs",
        labelKey: "jobs",
        icon: ClipboardList,
      },
    ],
  },
  {
    labelKey: "customers",
    items: [
      {
        href: "/customers",
        labelKey: "customers",
        icon: Users,
        permission: "customers",
      },
      {
        href: "/vehicles",
        labelKey: "vehicles",
        icon: Car,
        permission: "vehicles",
      },
    ],
  },
  {
    labelKey: "servicesAndStaff",
    items: [
      {
        href: "/services",
        labelKey: "services",
        icon: Wrench,
        permission: "services",
      },
      {
        href: "/employees",
        labelKey: "employees",
        icon: UserRoundCog,
        permission: "workers",
      },
    ],
  },
  {
    labelKey: "finance",
    items: [
      {
        href: "/payments",
        labelKey: "payments",
        icon: CreditCard,
        permission: "payments",
      },
      {
        href: "/expenses",
        labelKey: "expenses",
        icon: DollarSign,
        permission: "expenses",
      },
    ],
  },
  {
    labelKey: "analytics",
    items: [
      {
        href: "/reports",
        labelKey: "reports",
        icon: FileBarChart,
        permission: "reports",
      },
    ],
  },
  {
    labelKey: "system",
    items: [
      {
        href: "/settings",
        labelKey: "settings",
        icon: Settings,
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

export function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { language } = useLanguage()
  const t = translations[language]

  const [role, setRole] = useState<"owner" | "manager" | null>(null)
  const [permissions, setPermissions] = useState<
    Record<PermissionKey, boolean>
  >({
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
  })

  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function loadAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !active) return

      const { data: appUser } = await supabase
        .from("app_users")
        .select("role")
        .eq("id", user.id)
        .single()

      if (!appUser || !active) return

      const userRole = appUser.role as "owner" | "manager"
      setRole(userRole)

      if (userRole === "owner") {
        setPermissions(
          Object.fromEntries(
            permissionKeys.map((key) => [key, true])
          ) as Record<PermissionKey, boolean>
        )
        return
      }

      const { data: permissionRow } = await supabase
        .from("manager_permissions")
        .select(permissionKeys.join(", "))
        .eq("user_id", user.id)
        .single()

      if (!active) return

      if (permissionRow) {
        const row = permissionRow as unknown as Record<
          string,
          boolean | null
        >

        setPermissions(
          Object.fromEntries(
            permissionKeys.map((key) => [key, Boolean(row[key])])
          ) as Record<PermissionKey, boolean>
        )
      }
    }

    loadAccess()

    return () => {
      active = false
    }
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
    .filter(
      (section) =>
        section.labelKey !== "system" || role === "owner"
    )

  function isActive(href: string) {
    if (href === "/") return pathname === "/"

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    )
  }

  const content = (
    <div className="flex h-screen flex-col bg-sidebar">
      <div className="flex h-[72px] shrink-0 items-center border-b border-sidebar-border px-5">
        <Link
          href="/"
          onClick={onClose}
          className="min-w-0"
        >
          <p className="truncate text-[15px] font-bold tracking-tight text-sidebar-foreground">
            {t.branding.title}
          </p>

          <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/70">
            {t.common.carWashManagementLower}
          </p>
        </Link>

        {mobile && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-9 w-9 rounded-xl"
            onClick={onClose}
            aria-label={t.common.close}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-6">
          {visibleSections.map((section) => (
            <div key={String(section.labelKey)}>
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-sidebar-foreground/70">
                {t.common[section.labelKey]}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={[
                        "group flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-all",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-sidebar-foreground/85 hover:bg-muted hover:text-foreground",
                      ].join(" ")}
                    >
                      <Icon className="h-[17px] w-[17px] shrink-0" />

                      <span className="truncate">
                        {t.common[item.labelKey]}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="shrink-0 border-t border-sidebar-border px-4 py-4">
        <p className="text-[11px] font-semibold text-sidebar-foreground/70">
          {t.branding.copyright}
        </p>
      </div>
    </div>
  )

  if (mobile) {
    return (
      <aside className="h-full w-full bg-sidebar">
        {content}
      </aside>
    )
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-sidebar-border bg-sidebar lg:block">
      {content}
    </aside>
  )
}
