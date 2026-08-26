"use client"

import {
  Bell,
  Building2,
  ChevronRight,
  CreditCard,
  LockKeyhole,
  Settings2,
  Users,
  Wrench,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const sections = [
  {
    title: "Business",
    description: "Business name, contact information and general details.",
    icon: Building2,
  },
  {
    title: "Permissions",
    description: "Control exactly what owners, managers and workers can access.",
    icon: LockKeyhole,
  },
  {
    title: "Services",
    description: "Configure services, pricing, durations and service-specific options.",
    icon: Wrench,
  },
  {
    title: "Employees",
    description: "Manage employee roles, access and payment arrangements.",
    icon: Users,
  },
  {
    title: "Payments",
    description: "Configure payment methods and who can collect payments.",
    icon: CreditCard,
  },
  {
    title: "Notifications",
    description: "Configure operational and customer notifications.",
    icon: Bell,
  },
]

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1000px] space-y-6 p-4 lg:p-6">

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Settings
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Configure AutoSense for how your business operates.
        </p>
      </div>

      <div className="space-y-3">

        {sections.map((section) => {
          const Icon = section.icon

          return (
            <Card
              key={section.title}
              className="cursor-pointer transition-colors hover:bg-muted/40"
            >

              <CardContent className="flex items-center gap-4 p-5">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="font-medium">
                    {section.title}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {section.description}
                  </p>

                </div>

                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />

              </CardContent>

            </Card>
          )
        })}

      </div>

      <Card>

        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings2 className="h-4 w-4" />
            Configuration Philosophy
          </CardTitle>
        </CardHeader>

        <CardContent>

          <p className="text-sm leading-6 text-muted-foreground">
            AutoSense is designed to adapt to how each car wash operates.
            Owners should be able to decide which features managers can
            access, who can collect payments, what information is visible,
            and which services are available.
          </p>

        </CardContent>

      </Card>

    </div>
  )
}
