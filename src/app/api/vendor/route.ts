import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('vendor_config')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, shop_name, vendor_type, primary_color, website_url } = body

    // Update first row if no id provided
    let query = supabase.from('vendor_config').update({
      ...(shop_name !== undefined && { shop_name }),
      ...(vendor_type !== undefined && { vendor_type }),
      ...(primary_color !== undefined && { primary_color }),
      ...(website_url !== undefined && { website_url }),
      updated_at: new Date().toISOString(),
    })

    if (id) {
      query = query.eq('id', id)
    } else {
      // Update the first row
      const { data: first } = await supabase
        .from('vendor_config')
        .select('id')
        .limit(1)
        .single()
      if (!first) {
        return NextResponse.json({ error: 'No vendor config found' }, { status: 404 })
      }
      query = query.eq('id', first.id)
    }

    const { data, error } = await query.select().single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
