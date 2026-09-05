"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// next-themes (unmaintained since March 2025) injects a <script> tag to
// prevent theme flicker on load — a normal, working pattern. React 19 added
// a warning for this exact case that doesn't apply here; it's a confirmed
// false positive (see next-themes GitHub issues #385, #387), not a real bug.
// Only this one specific message is silenced — anything else still logs normally.
if (typeof window !== "undefined") {
  const originalError = console.error
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return
    }
    originalError(...args)
  }
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
