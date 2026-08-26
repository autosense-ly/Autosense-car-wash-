"use client"

import { Menu, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"

type TopbarProps = {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden lg:block">
        <p className="text-sm text-muted-foreground">
          Welcome back
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <div className="hidden h-8 w-px bg-border sm:block" />

        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-xs text-white">
              OW
            </AvatarFallback>
          </Avatar>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium leading-none">
              Owner
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
