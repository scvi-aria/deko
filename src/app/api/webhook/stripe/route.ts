import { NextRequest, NextResponse } from 'next/server'

// Stripe webhook endpoint for triggering animations
export async function POST(req: NextRequest) {
  const body = await req.json()

  // TODO: Verify Stripe webhook signature
  // TODO: Extract order details from checkout.session.completed event
  // TODO: Push order to Supabase realtime channel

  const eventType = body.type

  if (eventType === 'checkout.session.completed') {
    // Trigger animation via Supabase realtime
    console.log('[Deko] Payment received, triggering animation')

    return NextResponse.json({ received: true })
  }

  return NextResponse.json({ received: true })
}
