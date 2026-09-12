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

const navigation = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    permission: "dashboard",
  },
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
  {
    label: "Services",
    href: "/services",
    icon: Wrench,
    permission: "services",
  },
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
  {
    label: "Employees",
    href: "/employees",
    icon: Users,
    permission: "workers",
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    permission: "reports",
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

  const visibleNavigation =
    role === "manager" && !accessError
      ? navigation.filter((item) => {
          if (item.alwaysForManager) return true
          return permissions[item.permission] === true
        })
      : navigation

  const showSettings =
    role === "owner" || accessError

  return (
    <aside
      className={
        mobile
          ? "flex h-full w-[280px] flex-col bg-background"
          : "flex h-screen w-[260px] shrink-0 flex-col border-r bg-background"
      }
    >
      <div className="flex h-16 items-center justify-between px-5">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={onClose}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Car className="h-5 w-5" />
          </div>

          <div>
            <div className="text-[17px] font-semibold tracking-tight">
              AutoSense
            </div>

            <div className="text-[11px] text-muted-foreground">
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
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Separator />

      {showSettings && (
        <div className="p-3 pb-0">
          <Link
            href="/settings"
            onClick={onClose}
            className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
              pathname.startsWith("/settings")
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Settings className="h-[18px] w-[18px]" />
            Settings
          </Link>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <div className="mb-3 px-3 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </div>

        {visibleNavigation.map((item) => {
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
              className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
