"use client"

import { useEffect, useState } from "react"
import {
  Bell,
  Building2,
  ChevronRight,
  Copy,
  CreditCard,
  LockKeyhole,
  Settings2,
  Users,
  Wrench,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

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
  const [business, setBusiness] = useState<{ id: string; name: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setError("Not logged in — no active session found. Sign in first at /login.")
        setLoading(false)
        return
      }

      supabase
        .from("businesses")
        .select("id, name")
        .single()
        .then(({ data, error }) => {
          setLoading(false)
          if (data) setBusiness(data)
          if (error) setError(error.message)
        })
    })
  }, [])

  function handleCopy() {
    if (!business) return
    navigator.clipboard.writeText(business.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            Your Business
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}

          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {business && (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Business name</p>
                <p className="font-medium">{business.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Business ID — share this with anyone joining as a manager
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 rounded-md border border-border bg-secondary px-3 py-2 text-xs">
                    {business.id}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                  >
                    <Copy className="mr-1 h-3.5 w-3.5" />
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

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
