"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { createClient } from "@/lib/supabase/client"

export type BusinessCurrency = "LYD" | "PKR"

type CurrencyContextValue = {
  currency: BusinessCurrency
  loading: boolean
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<BusinessCurrency>("LYD")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadBusinessCurrency() {
      try {
        const supabase = createClient()
        const { data: authData } = await supabase.auth.getUser()

        if (!authData.user) return

        const { data: profile, error: profileError } = await supabase
          .from("app_users")
          .select("business_id")
          .eq("id", authData.user.id)
          .maybeSingle()

        if (profileError || !profile) return

        const { data: business, error: businessError } = await supabase
          .from("businesses")
          .select("currency")
          .eq("id", profile.business_id)
          .maybeSingle()

        if (businessError || !business || !active) return

        if (business.currency === "LYD" || business.currency === "PKR") {
          setCurrency(business.currency)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadBusinessCurrency()

    return () => {
      active = false
    }
  }, [])

  return (
    <CurrencyContext.Provider value={{ currency, loading }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)

  if (!context) {
    throw new Error("useCurrency must be used inside CurrencyProvider")
  }

  return context
}
