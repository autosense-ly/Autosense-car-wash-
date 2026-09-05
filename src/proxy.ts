import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ROUTE_PERMISSIONS: Record<string, string> = {
  '/': 'dashboard',
  '/operations': 'live_operations',
  '/jobs': 'live_operations',
  '/customers': 'customers',
  '/vehicles': 'vehicles',
  '/services': 'services',
  '/payments': 'payments',
  '/expenses': 'expenses',
  '/employees': 'workers',
  '/reports': 'reports',
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/signup')
  const isApiRoute = path.startsWith('/api')

  if (!user && !isAuthRoute && !isApiRoute) {
    console.log('[proxy] no user, redirecting to /login. path=', path)
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (user && !isAuthRoute && !isApiRoute) {
    const { data: profile, error: profileError } = await supabase
      .from('app_users')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('[proxy] path=', path, 'user=', user.id, 'profile=', profile, 'profileError=', profileError?.message)

    const role = profile?.role

    if (path.startsWith('/settings') && role !== 'owner') {
      console.log('[proxy] blocking /settings, role was:', role)
      const url = request.nextUrl.clone()
      url.pathname = '/operations'
      return NextResponse.redirect(url)
    }

    if (role === 'manager') {
      const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find(
        (route) => path === route || (route !== '/' && path.startsWith(`${route}/`))
      )

      if (matchedRoute) {
        const permKey = ROUTE_PERMISSIONS[matchedRoute]
        const { data: perms, error: permsError } = await supabase
          .from('manager_permissions')
          .select(permKey)
          .eq('user_id', user.id)
          .single()

        console.log('[proxy] permKey=', permKey, 'perms=', perms, 'permsError=', permsError?.message)

        const allowed = perms ? (perms as Record<string, boolean>)[permKey] : false

        if (!allowed && path !== '/operations') {
          console.log('[proxy] blocking', path, '- allowed was:', allowed)
          const url = request.nextUrl.clone()
          url.pathname = '/operations'
          return NextResponse.redirect(url)
        }
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
