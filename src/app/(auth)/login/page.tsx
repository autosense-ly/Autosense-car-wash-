'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Car, Languages } from 'lucide-react'
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
  const { language, setLanguage, t } = useLanguage()

  function toggleLanguage() {
    setLanguage(language === 'en' ? 'ar' : 'en')
  }

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
    <div className="dark relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background text-foreground lg:flex-row">
      {/* Language switcher */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={toggleLanguage}
        className="absolute end-4 top-4 z-20 gap-2 rounded-xl border-border bg-card/80 px-3 backdrop-blur-sm sm:end-6 sm:top-6"
        aria-label={
          language === 'en'
            ? t.common.switchToArabic
            : t.common.switchToEnglish
        }
        title={
          language === 'en'
            ? t.common.switchToArabic
            : t.common.switchToEnglish
        }
      >
        <Languages className="h-4 w-4" />
        <span>{language === 'en' ? 'العربية' : 'EN'}</span>
      </Button>
      <div className="flex w-full flex-col gap-8 border-b border-border bg-sidebar px-5 pb-8 pt-6 sm:px-8 sm:pb-10 sm:pt-8 lg:w-[45%] lg:justify-between lg:gap-0 lg:border-b-0 lg:border-r lg:px-16 lg:py-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Car className="h-5 w-5 text-primary-foreground" />
          </div>

          <div>
            <p className="text-sm font-semibold leading-none">Autovestics</p>
            <p className="text-xs text-muted-foreground">
              {t.auth.carWashManagementTitle}
            </p>
          </div>
        </div>

        <div className="max-w-md pe-16 sm:pe-20 lg:pe-0">
          <h1 className="text-4xl font-semibold leading-tight">
            {t.auth.loginHeadline}
          </h1>

          <p className="mt-4 text-muted-foreground">
            {t.auth.loginDescription}
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          © 2026 Autovestics
        </p>
      </div>

      <div className="flex w-full flex-1 items-center justify-center px-5 py-10 sm:px-8 sm:py-12 lg:w-[55%] lg:flex-none lg:px-16 lg:py-0">
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
