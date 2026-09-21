"use client"

import Link from "next/link"
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
import { useLanguage } from "@/lib/i18n/language-provider"
import { settingsTranslations } from "@/lib/i18n/settings"
import { createClient } from "@/lib/supabase/client"

const sectionKeys: Array<{
  key:
    | "business"
    | "permissions"
    | "services"
    | "employees"
    | "payments"
    | "notifications"
  icon: typeof Building2
  href?: string
}> = [
  {
    key: "business",
    icon: Building2,
  },
  {
    key: "permissions",
    icon: LockKeyhole,
    href: "/settings/permissions",
  },
  {
    key: "services",
    icon: Wrench,
  },
  {
    key: "employees",
    icon: Users,
    href: "/employees",
  },
  {
    key: "payments",
    icon: CreditCard,
    href: "/payments",
  },
  {
    key: "notifications",
    icon: Bell,
  },
] as const

export default function SettingsPage() {
  const { language } = useLanguage()
  const t = settingsTranslations[language]

  const [business, setBusiness] = useState<{
    id: string
    name: string
  } | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setError(t.notLoggedIn)
        setLoading(false)
        return
      }

      supabase
        .from("businesses")
        .select("id, name")
        .single()
        .then(({ data, error }) => {
          setLoading(false)

          if (data) {
            setBusiness(data)
          }

          if (error) {
            setError(error.message)
          }
        })
    })
  }, [language, t])

  function handleCopy() {
    if (!business) return

    navigator.clipboard.writeText(business.id)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="space-y-6">
        <section className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Settings2 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-600 dark:text-blue-400">
                {t.system}
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">
                {t.title}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                {t.description}
              </p>
            </div>
          </div>
        </section>

        <Card className="rounded-2xl border-2 border-border bg-card shadow-md">
          <CardHeader className="border-b border-border/60 px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              {t.yourBusiness}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 p-5">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-4 w-4 animate-pulse rounded-full bg-muted" />
                {t.loadingBusinessDetails}
              </div>
            )}

            {error && (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
                {error}
              </p>
            )}

            {business && (
              <>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    {t.businessName}
                  </p>

                  <p className="mt-1.5 font-semibold">
                    {business.name}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    {t.businessId}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.businessIdDescription}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <code className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-xs text-foreground">
                      {business.id}
                    </code>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="shrink-0 rounded-xl"
                    >
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      {copied ? t.copied : t.copy}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          {sectionKeys.map((section) => {
            const Icon = section.icon

            const title = t[section.key]
            const description = t[`${section.key}Description`]

            const content = (
              <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {title}
                  </p>

                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    {description}
                  </p>
                </div>

                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180" />
              </CardContent>
            )

            if (section.href) {
              return (
                <Link
                  key={section.key}
                  href={section.href}
                  className="group block"
                >
                  <Card className="rounded-2xl border-2 border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:hover:border-blue-900/70">
                    {content}
                  </Card>
                </Link>
              )
            }

            return (
              <Card
                key={section.key}
                className="rounded-2xl border-2 border-border bg-card shadow-sm"
              >
                {content}
              </Card>
            )
          })}
        </div>

        <Card className="rounded-2xl border-2 border-border bg-card shadow-md">
          <CardHeader className="border-b border-border/60 px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Settings2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              {t.configurationPhilosophy}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5">
            <p className="text-sm leading-6 text-muted-foreground">
              {t.configurationDescription}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
