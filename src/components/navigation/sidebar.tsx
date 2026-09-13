"use client"

import {
  BarChart3,
  Car,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Receipt,
  Settings,
  UserRound,
  Users,
  Wrench,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"

const navigationSections = [
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
        icon: ClipboardList,
        permission: "live_operations",
        alwaysForManager: true,
      },
      {
        label: "Jobs",
        href: "/jobs",
        icon: ClipboardList,
        permission: "live_operations",
      },
    ],
  },
  {
    label: "Customers",
    items: [
      {
        label: "Customers",
        href: "/customers",
        icon: UserRound,
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
        icon: Wrench,
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
        icon: Receipt,
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
        icon: BarChart3,
        permission: "reports",
      },
    ],
  },
]

type SidebarProps = {
  mobile?: boolean
  onClose?: () => void
}

type ManagerPermissions = Record<string, boolean>

export function Sidebar({
  mobile = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname()

  const [role, setRole] = useState<"owner" | "manager" | null>(null)
  const [permissions, setPermissions] =
    useState<ManagerPermissions>({})
  const [accessError, setAccessError] = useState(false)

  useEffect(() => {
    let mounted = true

    async function loadAccess() {
      const supabase = createClient()

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          if (mounted) {
            setRole(null)
            setAccessError(true)
          }
          return
        }

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("app_users")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profileError || !profile) {
          if (mounted) {
            setRole(null)
            setAccessError(true)
          }
          return
        }

        if (!mounted) return

        setRole(profile.role)

        if (profile.role === "manager") {
          const {
            data: managerPermissions,
            error: permissionsError,
          } = await supabase
            .from("manager_permissions")
            .select(
              "dashboard, reports, expenses, workers, services, payments, checkin, live_operations, customers, vehicles, settings",
            )
            .eq("user_id", user.id)
            .single()

          if (!mounted) return

          if (permissionsError || !managerPermissions) {
            setAccessError(true)
          } else {
            setPermissions(
              managerPermissions as ManagerPermissions,
            )
          }
        }
      } catch {
        if (mounted) {
          setRole(null)
          setAccessError(true)
        }
      }
    }

    loadAccess()

    return () => {
      mounted = false
    }
  }, [])

  const visibleSections = navigationSections
    .map((section) => ({
      ...section,
      items:
        role === "manager" && !accessError
          ? section.items.filter((item) => {
              if (item.alwaysForManager) return true
              return permissions[item.permission] === true
            })
          : section.items,
    }))
    .filter((section) => section.items.length > 0)

  const showSettings =
    role === "owner" || accessError

  return (
    <aside
      className={
        mobile
          ? "flex h-full w-full flex-col bg-background"
          : "flex h-full w-full flex-col bg-background"
      }
    >
      <div className="flex h-[72px] shrink-0 items-center justify-between px-5">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          onClick={onClose}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Car className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="truncate text-[17px] font-semibold tracking-tight">
              AutoSense
            </div>

            <div className="truncate text-[11px] text-muted-foreground">
              Car Wash Management
            </div>
          </div>
        </Link>

        {mobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close navigation"
            title="Close navigation"
            className="shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Separator />

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {visibleSections.map((section) => (
          <section key={section.label}>
            <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {section.label}
            </div>

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
                    className={`group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                      active
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="truncate">
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}

        {showSettings && (
          <section>
            <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              System
            </div>

            <Link
              href="/settings"
              onClick={onClose}
              className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                pathname.startsWith("/settings")
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Settings className="h-[18px] w-[18px] shrink-0" />
              <span>Settings</span>
            </Link>
          </section>
        )}
      </nav>

      <div className="shrink-0 border-t border-border/70 p-4">
        <div className="rounded-xl bg-muted/50 px-3 py-3">
          <p className="text-xs font-medium text-foreground">
            AutoSense
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Car wash management
          </p>
        </div>
      </div>
    </aside>
  )
}
