'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Car, Languages } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLanguage } from '@/lib/i18n/language-provider'
import { signupTranslations } from '@/lib/i18n/signup'

export default function SignupPage() {
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()
  const signupT = signupTranslations[language]

  const [mode, setMode] = useState<'owner' | 'manager'>('owner')

  // Owner fields
  const [businessName, setBusinessName] = useState('')
  const [ownerName, setOwnerName] = useState('')

  // Manager fields
  const [businessId, setBusinessId] = useState('')
  const [managerName, setManagerName] = useState('')

  // Shared
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email,
        password,
      })

    if (signUpError) {
      setLoading(false)
      setError(signUpError.message)
      return
    }

    if (!signUpData.session) {
      setLoading(false)
      setError(signupT.noSession)
      return
    }

    const { error: rpcError } =
      mode === 'owner'
        ? await supabase.rpc('create_owner_profile', {
            business_name: businessName,
            business_currency: 'LYD',
            owner_name: ownerName,
            owner_email: email,
          })
        : await supabase.rpc('join_business_as_manager', {
            target_business_id: businessId,
            manager_name: managerName,
            manager_email: email,
          })

    setLoading(false)

    if (rpcError) {
      setError(rpcError.message)
      return
    }

    router.push('/')
    router.refresh()
  }

  function toggleLanguage() {
    setLanguage(language === 'en' ? 'ar' : 'en')
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

      {/* Brand panel */}
      <div className="flex w-full flex-col gap-8 border-b border-border bg-sidebar px-5 pb-8 pt-6 sm:px-8 sm:pb-10 sm:pt-8 lg:w-[45%] lg:justify-between lg:gap-0 lg:border-b-0 lg:border-r lg:px-16 lg:py-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Car className="h-5 w-5 text-primary-foreground" />
          </div>

          <div>
            <p className="text-sm font-semibold leading-none">
              AF Car Wash
            </p>
            <p className="text-xs text-muted-foreground">
              {t.common.carWashManagement}
            </p>
          </div>
        </div>

        <div className="max-w-md pe-16 sm:pe-20 lg:pe-0">
          <h1 className="text-4xl font-semibold leading-tight">
            {t.auth.signupHeadline}
          </h1>

          <p className="mt-4 text-muted-foreground">
            {t.auth.signupDescription}
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          {t.branding.copyright}
        </p>
      </div>

      {/* Signup form */}
      <div className="flex w-full flex-1 items-center justify-center px-5 py-10 sm:px-8 sm:py-12 lg:w-[55%] lg:flex-none lg:px-16 lg:py-0">
        <div className="w-full max-w-sm">
          <Tabs
            value={mode}
            onValueChange={(value) =>
              setMode(value as 'owner' | 'manager')
            }
          >
            <TabsList className="w-full">
              <TabsTrigger value="owner" className="flex-1">
                {t.auth.startBusiness}
              </TabsTrigger>

              <TabsTrigger value="manager" className="flex-1">
                {t.auth.joinBusiness}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <h2 className="mt-6 text-2xl font-semibold">
            {mode === 'owner'
              ? t.auth.createYourBusiness
              : t.auth.joinYourTeam}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {mode === 'owner'
              ? t.auth.createBusinessDescription
              : t.auth.joinBusinessDescription}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'owner' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessName">
                    {t.common.businessName}
                  </Label>

                  <Input
                    id="businessName"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="bg-card"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerName">
                    {t.auth.yourName}
                  </Label>

                  <Input
                    id="ownerName"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="bg-card"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessId">
                    {t.common.businessId}
                  </Label>

                  <Input
                    id="businessId"
                    required
                    placeholder="e.g. 3f2a1b4c-..."
                    value={businessId}
                    onChange={(e) => setBusinessId(e.target.value)}
                    className="bg-card"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="managerName">
                    {t.auth.yourName}
                  </Label>

                  <Input
                    id="managerName"
                    required
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="bg-card"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">
                {t.common.email}
              </Label>

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
              <Label htmlFor="password">
                {t.common.password}
              </Label>

              <Input
                id="password"
                type="password"
                required
                minLength={6}
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
              {loading
                ? t.auth.pleaseWait
                : mode === 'owner'
                  ? t.auth.createBusiness
                  : t.auth.joinTeam}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t.auth.alreadyHaveAccount}{' '}
            <Link
              href="/login"
              className="text-primary hover:underline"
            >
              {t.auth.signIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
