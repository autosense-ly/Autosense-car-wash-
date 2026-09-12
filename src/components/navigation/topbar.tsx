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

type TopbarProps = {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
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

  return (
    <header className="sticky top-0 z-30 flex h-[68px] shrink-0 items-center border-b border-border/70 bg-background/95 px-5 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-7">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={onMenuClick}
        aria-label="Open navigation"
        title="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="ml-3 hidden lg:block">
        <p className="text-sm font-medium text-foreground">
          Welcome back
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Manage your car wash operations
        </p>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
          onClick={() =>
            setTheme(theme === "dark" ? "light" : "dark")
          }
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <div className="mx-2 hidden h-7 w-px bg-border sm:block" />

        <div className="flex items-center gap-3 pl-1">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="hidden min-w-0 sm:block">
            <p className="max-w-[180px] truncate text-sm font-medium leading-tight">
              {profile?.name ?? "Loading..."}
            </p>
            <p className="mt-1 text-[11px] capitalize text-muted-foreground">
              {profile?.role ?? ""}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="ml-1 h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive"
          onClick={handleSignOut}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
