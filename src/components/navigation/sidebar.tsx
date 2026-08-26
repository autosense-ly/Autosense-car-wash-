"use client"

import {
  BarChart3,
  Car,
  ClipboardList,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  Settings,
  Users,
  Wrench,
  Receipt,
  UserRound,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const navigation = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Operations", href: "/operations", icon: ClipboardList },
  { label: "Jobs", href: "/jobs", icon: ClipboardList },
  { label: "Customers", href: "/customers", icon: UserRound },
  { label: "Vehicles", href: "/vehicles", icon: Car },
  { label: "Services", href: "/services", icon: Wrench },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Expenses", href: "/expenses", icon: Receipt },
  { label: "Employees", href: "/employees", icon: Users },
  { label: "Reports", href: "/reports", icon: BarChart3 },
]

type SidebarProps = {
  mobile?: boolean
  onClose?: () => void
}

export function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={
        mobile
          ? "flex h-full w-[280px] flex-col bg-background"
          : "hidden h-screen w-[260px] shrink-0 border-r bg-background lg:flex"
      }
    >
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-3" onClick={onClose}>
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

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <div className="mb-3 px-3 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </div>

        {navigation.map((item) => {
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

      <div className="border-t p-3">
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
    </aside>
  )
}
