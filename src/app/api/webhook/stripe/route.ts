import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { supabase } from '@/lib/supabase'

function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
  tolerance = 300
): boolean {
  const parts = Object.fromEntries(
    sigHeader.split(',').map((p) => {
      const [k, v] = p.split('=')
      return [k, v]
    })
  )
  const timestamp = parts['t']
  const signature = parts['v1']
  if (!timestamp || !signature) return false

  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10)
  if (Math.abs(age) > tolerance) return false

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex')

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return false
  }
}

async function logError(message: string, stack?: string, context?: unknown) {
  await supabase.from('error_log').insert({
    error_message: message,
    stack_trace: stack ?? null,
    context: context ?? null,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')

    // Fetch webhook secret from vendor_config
    const { data: vendor } = await supabase
      .from('vendor_config')
      .select('stripe_webhook_secret')
      .limit(1)
      .single()

    const secret = vendor?.stripe_webhook_secret || process.env.STRIPE_WEBHOOK_SECRET
    if (!secret || !sig) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
    }

    if (!verifyStripeSignature(body, sig, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)
    const type: string = event.type
    const obj = event.data?.object

    if (type === 'checkout.session.completed' || type === 'charge.succeeded') {
      const orderNumber =
        obj.metadata?.order_number ||
        obj.payment_intent ||
        event.id

      const customerName =
        obj.customer_details?.name ||
        obj.billing_details?.name ||
        obj.metadata?.customer_name ||
        null

      const items = obj.metadata?.items ? JSON.parse(obj.metadata.items) : []

      const amountCents =
        obj.amount_total ?? obj.amount ?? null

      const currency = (obj.currency || 'aud').toLowerCase()

      const { error } = await supabase.from('order_log').insert({
        order_number: orderNumber,
        customer_name: customerName,
        items,
        amount_cents: amountCents,
        currency,
        source: 'stripe',
        stripe_event_id: event.id,
      })

      if (error) {
        await logError(`Failed to insert order: ${error.message}`, null, { event_id: event.id })
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err: unknown) {
    const e = err instanceof Error ? err : new Error(String(err))
    await logError(e.message, e.stack, { source: 'stripe_webhook' })
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
