"use client"

import * as React from "react"
import { Sidebar } from "@/components/navigation/sidebar"
import { Topbar } from "@/components/navigation/topbar"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "./theme-provider"

export function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen">
          <aside className="hidden lg:flex lg:h-screen lg:w-[260px] lg:shrink-0 lg:border-r lg:border-border">
            <Sidebar />
          </aside>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent
              side="left"
              showCloseButton={false}
              className="w-[280px] max-w-[280px] overflow-hidden p-0"
            >
              <Sidebar
                mobile
                onClose={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar onMenuClick={() => setMobileOpen(true)} />

            <main className="min-h-0 flex-1 overflow-auto">
              <div className="min-h-full">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>

      <Toaster />
    </ThemeProvider>
  )
}
