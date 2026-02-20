import { NextRequest, NextResponse } from 'next/server'

/**
 * Creates a Stripe Checkout session.
 * In production, use the Stripe SDK. This is a lightweight integration
 * using the Stripe API directly to avoid adding the full SDK as a dependency.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, vendorName, successUrl, cancelUrl } = body

    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    // Build line items for Stripe Checkout
    const lineItems = (items || []).map((item: { name: string; price: number; quantity?: number }) => ({
      price_data: {
        currency: 'aud',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100), // cents
      },
      quantity: item.quantity || 1,
    }))

    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    const origin = req.nextUrl.origin

    // Create Stripe Checkout Session via API
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'success_url': successUrl || `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': cancelUrl || `${origin}/checkout`,
        ...lineItems.reduce((acc: Record<string, string>, item: any, i: number) => {
          acc[`line_items[${i}][price_data][currency]`] = item.price_data.currency
          acc[`line_items[${i}][price_data][product_data][name]`] = item.price_data.product_data.name
          acc[`line_items[${i}][price_data][unit_amount]`] = String(item.price_data.unit_amount)
          acc[`line_items[${i}][quantity]`] = String(item.quantity)
          return acc
        }, {}),
        ...(vendorName ? { 'payment_intent_data[metadata][vendor]': vendorName } : {}),
      }),
    })

    const session = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: session.error?.message || 'Stripe error' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
