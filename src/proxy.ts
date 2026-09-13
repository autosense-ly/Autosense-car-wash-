import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type PermissionKey =
  | 'dashboard'
  | 'reports'
  | 'expenses'
  | 'workers'
  | 'services'
  | 'payments'
  | 'checkin'
  | 'live_operations'
  | 'customers'
  | 'vehicles'

const ROUTE_PERMISSIONS: Record<string, PermissionKey> = {
  '/': 'dashboard',
  '/operations': 'live_operations',
  '/jobs': 'live_operations',
  '/customers': 'customers',
  '/vehicles': 'vehicles',
  '/services': 'services',
  '/employees': 'workers',
  '/payments': 'payments',
  '/expenses': 'expenses',
  '/reports': 'reports',
}

const MANAGER_FALLBACK_ROUTES: Array<{
  path: string
  permission: PermissionKey
}> = [
  { path: '/operations', permission: 'live_operations' },
  { path: '/jobs', permission: 'live_operations' },
  { path: '/customers', permission: 'customers' },
  { path: '/vehicles', permission: 'vehicles' },
  { path: '/services', permission: 'services' },
  { path: '/payments', permission: 'payments' },
  { path: '/expenses', permission: 'expenses' },
  { path: '/reports', permission: 'reports' },
  { path: '/employees', permission: 'workers' },
  { path: '/', permission: 'dashboard' },
]

function getMatchedRoute(path: string) {
  return Object.keys(ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find((route) => {
      if (route === '/') {
        return path === '/'
      }

      return path === route || path.startsWith(`${route}/`)
    })
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const redirectWithCookies = (url: URL) => {
    const response = NextResponse.redirect(url)

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie)
    })

    return response
  }

  const path = request.nextUrl.pathname
  const isAuthRoute =
    path.startsWith('/login') || path.startsWith('/signup')
  const isApiRoute = path.startsWith('/api')

  if (!user && !isAuthRoute && !isApiRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return redirectWithCookies(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return redirectWithCookies(url)
  }

  if (!user || isAuthRoute || isApiRoute) {
    return supabaseResponse
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from('app_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error(
      '[proxy] unable to load user profile:',
      profileError?.message
    )

    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return redirectWithCookies(url)
  }

  const role = profile.role

  console.log(
    '[proxy] path=',
    path,
    'user=',
    user.id,
    'role=',
    role
  )

  // Owners have unrestricted application access.
  if (role === 'owner') {
    return supabaseResponse
  }

  // Settings remains owner-only.
  if (path.startsWith('/settings')) {
    const url = request.nextUrl.clone()
    url.pathname = '/operations'
    return redirectWithCookies(url)
  }

  if (role !== 'manager') {
    return supabaseResponse
  }

  const matchedRoute = getMatchedRoute(path)

  if (!matchedRoute) {
    return supabaseResponse
  }

  const permissionKey = ROUTE_PERMISSIONS[matchedRoute]

  const {
    data: permissions,
    error: permissionsError,
  } = await supabase
    .from('manager_permissions')
    .select(
      'dashboard, reports, expenses, workers, services, payments, checkin, live_operations, customers, vehicles'
    )
    .eq('user_id', user.id)
    .single()

  if (permissionsError || !permissions) {
    console.error(
      '[proxy] unable to load manager permissions:',
      permissionsError?.message
    )

    return new NextResponse('Unable to load manager permissions.', {
      status: 500,
    })
  }

  const allowed = permissions[permissionKey] === true

  console.log(
    '[proxy] permission=',
    permissionKey,
    'allowed=',
    allowed
  )

  if (allowed) {
    return supabaseResponse
  }

  // Find the first page this manager is actually allowed to access.
  const fallback = MANAGER_FALLBACK_ROUTES.find(
    ({ permission }) => permissions[permission] === true
  )

  if (!fallback) {
    console.error(
      '[proxy] manager has no enabled application permissions'
    )

    return new NextResponse(
      'No application permissions are enabled for this manager.',
      { status: 403 }
    )
  }

  const url = request.nextUrl.clone()
  url.pathname = fallback.path

  console.log(
    '[proxy] blocked manager route:',
    path,
    'permission:',
    permissionKey,
    'redirecting to:',
    fallback.path
  )

  return redirectWithCookies(url)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
