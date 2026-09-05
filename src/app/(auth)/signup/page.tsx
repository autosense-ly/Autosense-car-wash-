'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Car } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function SignupPage() {
  const router = useRouter()
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

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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
      setError('Account created, but no active session — check that "Confirm email" is turned off in Supabase.')
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

  return (
    <div className="dark flex min-h-screen w-full bg-background text-foreground">
      {/* Left panel — brand side, matches /login */}
      <div className="flex w-[45%] flex-col justify-between border-r border-border bg-sidebar px-16 py-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Car className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">AutoSense</p>
            <p className="text-xs text-muted-foreground">Car Wash Management</p>
          </div>
        </div>

        <div className="max-w-md">
          <h1 className="text-4xl font-semibold leading-tight">
            Two ways to get started.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Set up your own business as the owner, or join one your manager already
            created using the Business ID they share with you.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">© 2026 AutoSense</p>
      </div>

      {/* Right panel — form */}
      <div className="flex w-[55%] items-center justify-center px-16">
        <div className="w-full max-w-sm">
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'owner' | 'manager')}>
            <TabsList className="w-full">
              <TabsTrigger value="owner" className="flex-1">Start a Business</TabsTrigger>
              <TabsTrigger value="manager" className="flex-1">Join a Business</TabsTrigger>
            </TabsList>
          </Tabs>

          <h2 className="mt-6 text-2xl font-semibold">
            {mode === 'owner' ? 'Create your business' : 'Join your team'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === 'owner'
              ? 'Sets you up as the owner — you can invite managers after.'
              : "Ask your business owner for the Business ID, then enter it below."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'owner' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business name</Label>
                  <Input
                    id="businessName"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Your name</Label>
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
                  <Label htmlFor="businessId">Business ID</Label>
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
                  <Label htmlFor="managerName">Your name</Label>
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
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="password">Password</Label>
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

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Please wait...' : mode === 'owner' ? 'Create business' : 'Join team'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
