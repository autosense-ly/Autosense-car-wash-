'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Car } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/lib/i18n/language-provider'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoading(false)
      setError(error.message)
      return
    }

    window.location.assign('/')
  }

  return (
    <div className="dark flex min-h-screen w-full bg-background text-foreground">
      <div className="flex w-[45%] flex-col justify-between border-r border-border bg-sidebar px-16 py-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Car className="h-5 w-5 text-primary-foreground" />
          </div>

          <div>
            <p className="text-sm font-semibold leading-none">AF Car Wash</p>
            <p className="text-xs text-muted-foreground">
              {t.auth.carWashManagementTitle}
            </p>
          </div>
        </div>

        <div className="max-w-md">
          <h1 className="text-4xl font-semibold leading-tight">
            {t.auth.loginHeadline}
          </h1>

          <p className="mt-4 text-muted-foreground">
            {t.auth.loginDescription}
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          © 2026 AF Car Wash
        </p>
      </div>

      <div className="flex w-[55%] items-center justify-center px-16">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold">
            {t.auth.welcomeBack}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {t.auth.signInToBusiness}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t.common.email}</Label>

              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-card"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.common.password}</Label>

              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-card"
              />
            </div>

            {error && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? t.auth.signingIn : t.auth.signIn}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t.auth.noBusinessAccount}{' '}
            <Link
              href="/signup"
              className="text-primary hover:underline"
            >
              {t.auth.createOne}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
