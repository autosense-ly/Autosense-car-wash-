'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Car } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="dark flex min-h-screen w-full bg-background text-foreground">
      {/* Left panel — brand side */}
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
            Run the whole wash from one screen.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Jobs, payments, and your team — tracked in real time, from check-in to completed.
          </p>

          <div className="mt-10 rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Today&apos;s pipeline</p>
            <div className="mt-4 flex items-end gap-6">
              <div>
                <p className="text-2xl font-semibold">4</p>
                <p className="text-xs text-muted-foreground">Waiting</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">3</p>
                <p className="text-xs text-muted-foreground">In progress</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">2</p>
                <p className="text-xs text-muted-foreground">Ready</p>
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-4/5 rounded-full bg-primary" />
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">© 2026 AutoSense</p>
      </div>

      {/* Right panel — sign-in form */}
      <div className="flex w-[55%] items-center justify-center px-16">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your business account.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have a business account?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
