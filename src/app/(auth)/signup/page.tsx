'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Languages } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLanguage } from '@/lib/i18n/language-provider'
import { signupTranslations } from '@/lib/i18n/signup'

type SignupMethod = 'phone' | 'email'
type SignupMode = 'owner' | 'manager'

export default function SignupPage() {
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()
  const signupT = signupTranslations[language]

  const [mode, setMode] = useState<SignupMode>('owner')
  const [method, setMethod] = useState<SignupMethod>('phone')

  const [businessName, setBusinessName] = useState('')
  const [ownerName, setOwnerName] = useState('')

  const [businessId, setBusinessId] = useState('')
  const [managerName, setManagerName] = useState('')

  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function toggleLanguage() {
    setLanguage(language === 'en' ? 'ar' : 'en')
  }

  function switchMethod(nextMethod: SignupMethod) {
    setMethod(nextMethod)
    setError(null)
    setOtpSent(false)
    setOtp('')
  }

  async function finishProfileCreation(
    supabase: ReturnType<typeof createClient>
  ) {
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

    if (rpcError) {
      setError(rpcError.message)
      setLoading(false)
      return false
    }

    router.push('/')
    router.refresh()
    return true
  }

  async function sendPhoneOtp() {
    setError(null)
    setLoading(true)

    const normalizedPhone = phone.trim()

    if (!normalizedPhone) {
      setLoading(false)
      setError(t.auth.phoneRequired)
      return
    }

    if (!normalizedPhone.startsWith('+')) {
      setLoading(false)
      setError(t.auth.phoneCountryCodeRequired)
      return
    }

    if (!email.trim()) {
      setLoading(false)
      setError(t.auth.signupEmailRequired)
      return
    }

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
      options: {
        shouldCreateUser: true,
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setPhone(normalizedPhone)
    setOtpSent(true)
  }

  async function verifyPhoneOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    const {
      data: { session },
      error,
    } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: otp.trim(),
      type: 'sms',
    })

    if (error) {
      setLoading(false)
      setError(error.message)
      return
    }

    if (!session) {
      setLoading(false)
      setError(signupT.noSession)
      return
    }

    await finishProfileCreation(supabase)
  }

  async function handleEmailSignup(e: React.FormEvent) {
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

    await finishProfileCreation(supabase)
  }

  return (
    <div className="dark relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background text-foreground lg:flex-row">
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
        <div className="flex items-center">
          <img
            src="/autovestics-logo.png"
            alt={t.branding.title}
            className="h-auto w-[180px] max-w-[75vw] object-contain"
          />
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

      <div className="flex w-full flex-1 items-center justify-center px-5 py-10 sm:px-8 sm:py-12 lg:w-[55%] lg:flex-none lg:px-16 lg:py-0">
        <div className="w-full max-w-sm">
          <Tabs
            value={mode}
            onValueChange={(value) =>
              setMode(value as SignupMode)
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

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            <Button
              type="button"
              variant={method === 'phone' ? 'default' : 'ghost'}
              onClick={() => switchMethod('phone')}
              className="rounded-lg"
            >
              {t.auth.usePhone}
            </Button>

            <Button
              type="button"
              variant={method === 'email' ? 'default' : 'ghost'}
              onClick={() => switchMethod('email')}
              className="rounded-lg"
            >
              {t.auth.useEmailPassword}
            </Button>
          </div>

          {method === 'phone' ? (
            <form
              onSubmit={verifyPhoneOtp}
              className="mt-6 space-y-4"
            >
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
                      onChange={(e) =>
                        setBusinessName(e.target.value)
                      }
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
                      onChange={(e) =>
                        setOwnerName(e.target.value)
                      }
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
                      onChange={(e) =>
                        setBusinessId(e.target.value)
                      }
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
                      onChange={(e) =>
                        setManagerName(e.target.value)
                      }
                      className="bg-card"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">{t.common.phone}</Label>

                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  placeholder="+218..."
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    setOtpSent(false)
                    setOtp('')
                  }}
                  className="bg-card"
                />

                <p className="text-xs text-muted-foreground">
                  {t.auth.phoneHint}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">
                  {t.auth.businessEmail}
                </Label>

                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-card"
                />
              </div>

              {otpSent && (
                <div className="space-y-2">
                  <Label htmlFor="signup-otp">
                    {t.auth.verificationCode}
                  </Label>

                  <Input
                    id="signup-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 6)
                      )
                    }
                    className="bg-card tracking-[0.35em]"
                  />

                  <p className="text-xs text-muted-foreground">
                    {t.auth.otpSentDescription}
                  </p>
                </div>
              )}

              {error && (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              {!otpSent ? (
                <Button
                  type="button"
                  disabled={loading}
                  onClick={sendPhoneOtp}
                  className="w-full"
                >
                  {loading
                    ? t.auth.sendingCode
                    : t.auth.sendCode}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading
                      ? t.auth.verifyingCode
                      : t.auth.verifyAndCreateAccount}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    disabled={loading}
                    onClick={sendPhoneOtp}
                    className="w-full"
                  >
                    {t.auth.sendCodeAgain}
                  </Button>
                </div>
              )}
            </form>
          ) : (
            <form
              onSubmit={handleEmailSignup}
              className="mt-6 space-y-4"
            >
              {mode === 'owner' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email-businessName">
                      {t.common.businessName}
                    </Label>

                    <Input
                      id="email-businessName"
                      required
                      value={businessName}
                      onChange={(e) =>
                        setBusinessName(e.target.value)
                      }
                      className="bg-card"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-ownerName">
                      {t.auth.yourName}
                    </Label>

                    <Input
                      id="email-ownerName"
                      required
                      value={ownerName}
                      onChange={(e) =>
                        setOwnerName(e.target.value)
                      }
                      className="bg-card"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email-businessId">
                      {t.common.businessId}
                    </Label>

                    <Input
                      id="email-businessId"
                      required
                      placeholder="e.g. 3f2a1b4c-..."
                      value={businessId}
                      onChange={(e) =>
                        setBusinessId(e.target.value)
                      }
                      className="bg-card"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-managerName">
                      {t.auth.yourName}
                    </Label>

                    <Input
                      id="email-managerName"
                      required
                      value={managerName}
                      onChange={(e) =>
                        setManagerName(e.target.value)
                      }
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
                  autoComplete="email"
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
                  autoComplete="new-password"
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
          )}

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
