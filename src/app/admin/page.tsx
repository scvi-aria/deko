'use client'

import { useState, useEffect, useCallback } from 'react'

type VendorType = 'coffee' | 'pizza' | 'florist'

interface VendorConfig {
  id?: string
  shop_name: string
  vendor_type: VendorType
  primary_color: string
  website_url: string
  stripe_webhook_secret: string
}

const VENDOR_OPTIONS: { value: VendorType; label: string; emoji: string }[] = [
  { value: 'coffee', label: 'Coffee Shop', emoji: '☕' },
  { value: 'pizza', label: 'Pizza / Fast Casual', emoji: '🍕' },
  { value: 'florist', label: 'Florist', emoji: '💐' },
]

export default function AdminPanel() {
  const [config, setConfig] = useState<VendorConfig>({
    shop_name: '',
    vendor_type: 'coffee',
    primary_color: '#7C3AED',
    website_url: '',
    stripe_webhook_secret: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [testing, setTesting] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  // Load vendor config
  useEffect(() => {
    fetch('/api/vendor')
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setConfig({
            id: data.id,
            shop_name: data.shop_name || '',
            vendor_type: data.vendor_type || 'coffee',
            primary_color: data.primary_color || '#7C3AED',
            website_url: data.website_url || '',
            stripe_webhook_secret: data.stripe_webhook_secret || '',
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Load orders
  const loadOrders = useCallback(() => {
    setOrdersLoading(true)
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data)
      })
      .catch(() => {})
      .finally(() => setOrdersLoading(false))
  }, [])

  useEffect(() => { loadOrders() }, [loadOrders])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/vendor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (res.ok) {
        const data = await res.json()
        setConfig((prev) => ({ ...prev, id: data.id }))
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      // ignore
    }
    setSaving(false)
  }

  const handleTestWebhook = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/webhook/test', { method: 'POST' })
      const data = await res.json()
      setTestResult({
        ok: res.ok,
        message: res.ok ? 'Test webhook sent successfully! Check the order log.' : (data.error || 'Failed'),
      })
      if (res.ok) loadOrders()
    } catch (err) {
      setTestResult({ ok: false, message: 'Network error' })
    }
    setTesting(false)
  }

  const handleTriggerOrder = async () => {
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: `TEST-${Date.now().toString(36).toUpperCase()}`,
          items: ['Demo Item 1', 'Demo Item 2'],
        }),
      })
      loadOrders()
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Deko Admin
            </h1>
            <p className="text-sm text-gray-400 mt-1">Configure your display animation</p>
          </div>
          <a
            href="/"
            className="px-4 py-2 text-sm text-[#7C3AED] border border-[#7C3AED] rounded-lg hover:bg-purple-50 transition-colors"
          >
            ← Back to Display
          </a>
        </div>

        {/* Shop Settings */}
        <section className="bg-white rounded-xl p-6 shadow-sm space-y-5">
          <h2 className="text-xl font-semibold text-gray-900">Shop Settings</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-600">Shop Name</span>
              <input
                type="text"
                value={config.shop_name}
                onChange={(e) => setConfig((c) => ({ ...c, shop_name: e.target.value.slice(0, 20) }))}
                maxLength={20}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="My Coffee Shop"
              />
              <span className="text-xs text-gray-400 mt-1">{config.shop_name.length}/20</span>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-600">Website URL (for QR code)</span>
              <input
                type="url"
                value={config.website_url}
                onChange={(e) => setConfig((c) => ({ ...c, website_url: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="https://myshop.com"
              />
            </label>
          </div>

          {/* Vendor Template */}
          <div>
            <span className="text-sm font-medium text-gray-600 block mb-2">Vendor Template</span>
            <div className="grid grid-cols-3 gap-3">
              {VENDOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setConfig((c) => ({ ...c, vendor_type: opt.value }))}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    config.vendor_type === opt.value
                      ? 'border-[#7C3AED] bg-purple-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-1">{opt.emoji}</div>
                  <div className="text-sm font-medium">{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Brand Color */}
          <label className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Brand Color</span>
            <input
              type="color"
              value={config.primary_color}
              onChange={(e) => setConfig((c) => ({ ...c, primary_color: e.target.value }))}
              className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
            />
            <span className="text-xs text-gray-400 font-mono">{config.primary_color}</span>
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-[#7C3AED] text-white rounded-lg font-medium hover:bg-[#6D28D9] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            {saved && <span className="text-sm text-green-600 font-medium">✓ Saved</span>}
          </div>
        </section>

        {/* Stripe Integration */}
        <section className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Stripe Integration</h2>
          <p className="text-sm text-gray-500">
            Connect your Stripe account to auto-trigger animations when customers pay.
          </p>

          <label className="block">
            <span className="text-sm font-medium text-gray-600">Webhook Secret</span>
            <input
              type="password"
              value={config.stripe_webhook_secret}
              onChange={(e) => setConfig((c) => ({ ...c, stripe_webhook_secret: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              placeholder="whsec_..."
            />
          </label>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTestWebhook}
              disabled={testing}
              className="px-5 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {testing ? 'Testing...' : '🧪 Test Webhook'}
            </button>
            {testResult && (
              <span className={`text-sm font-medium ${testResult.ok ? 'text-green-600' : 'text-red-500'}`}>
                {testResult.message}
              </span>
            )}
          </div>
        </section>

        {/* Test Animation */}
        <section className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Test Animation</h2>
          <div className="flex gap-3">
            <button
              onClick={handleTriggerOrder}
              className="px-5 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              🎬 Create Test Order
            </button>
            <a
              href={`/?vendor=${config.vendor_type}`}
              target="_blank"
              className="px-5 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm flex items-center gap-1"
            >
              Open Display ↗
            </a>
          </div>
        </section>

        {/* Order Log */}
        <section className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            <button
              onClick={loadOrders}
              disabled={ordersLoading}
              className="text-sm text-[#7C3AED] hover:underline disabled:opacity-50"
            >
              {ordersLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {orders.length === 0 ? (
            <p className="text-sm text-gray-400">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 font-medium">Order #</th>
                    <th className="pb-2 font-medium">Items</th>
                    <th className="pb-2 font-medium">Source</th>
                    <th className="pb-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 20).map((order: any) => (
                    <tr key={order.id} className="border-b border-gray-50">
                      <td className="py-2 font-mono text-xs">{order.order_number}</td>
                      <td className="py-2 text-gray-600">
                        {Array.isArray(order.items) ? order.items.join(', ') : '—'}
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.source === 'stripe' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {order.source}
                        </span>
                      </td>
                      <td className="py-2 text-gray-400 text-xs">
                        {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
