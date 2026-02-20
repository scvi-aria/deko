import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    const orderNumber = `TEST-${Date.now().toString(36).toUpperCase()}`
    const items = ['Test Latte', 'Test Croissant']

    const { data, error } = await supabase
      .from('order_log')
      .insert({
        order_number: orderNumber,
        customer_name: 'Test Customer',
        items,
        amount_cents: 850,
        currency: 'aud',
        source: 'test',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, order: data })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create test order' }, { status: 500 })
  }
}
