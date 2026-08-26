"use client"

import * as React from "react"
import { Sidebar } from "@/components/navigation/sidebar"
import { Topbar } from "@/components/navigation/topbar"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ThemeProvider } from "./theme-provider"

export function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-muted/30 text-foreground">
        <div className="flex min-h-screen">
          <Sidebar />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent
              side="left"
              className="w-[280px] p-0"
            >
              <Sidebar
                mobile
                onClose={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar onMenuClick={() => setMobileOpen(true)} />

            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
