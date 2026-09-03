import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('businesses').select('id').limit(1)

  return NextResponse.json({
    connected: !error,
    error: error?.message ?? null,
    rowCount: data?.length ?? 0,
  })
}
