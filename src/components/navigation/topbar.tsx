"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Menu, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/lib/i18n/language-provider"

type TopbarProps = {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()

  const [profile, setProfile] = useState<{
    name: string
    role: string
  } | null>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return

      supabase
        .from("app_users")
        .select("name, role")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data)
        })
    })
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const initials = profile?.name
    ? profile.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "?"

  const nextLanguage = language === "en" ? "ar" : "en"

  return (
    <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-xl lg:hidden"
        onClick={onMenuClick}
        aria-label={t.common.openNavigation}
        title={t.common.openNavigation}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="ml-2 sm:ml-3">
        <p className="text-[13px] font-semibold tracking-tight text-foreground sm:text-sm">
          {t.auth.welcomeBack}
        </p>
        <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">
          {t.common.carWashManagementLower}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="ghost"
          className="h-10 min-w-[48px] rounded-xl px-2.5 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={() => setLanguage(nextLanguage)}
          aria-label={language === "en" ? t.common.switchToArabic : t.common.switchToEnglish}
          title={language === "en" ? t.common.switchToArabic : t.common.switchToEnglish}
        >
          {language === "en" ? "العربية" : "EN"}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={() =>
            setTheme(theme === "dark" ? "light" : "dark")
          }
          aria-label={t.common.toggleTheme}
          title={t.common.toggleTheme}
        >
          <Sun className="h-[17px] w-[17px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[17px] w-[17px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <div className="mx-1 hidden h-8 w-px bg-border sm:block" />

        <div className="flex items-center gap-2.5 rounded-xl px-1.5 py-1">
          <Avatar className="h-9 w-9 border border-border shadow-sm">
            <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="hidden min-w-0 sm:block">
            <p className="max-w-[180px] truncate text-[13px] font-semibold leading-tight">
              {profile?.name ?? t.common.loading}
            </p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {profile?.role ?? ""}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={handleSignOut}
          aria-label={t.common.signOut}
          title={t.common.signOut}
        >
          <LogOut className="h-[17px] w-[17px]" />
        </Button>
      </div>
    </header>
  )
}
