'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { AnimationState } from '@/lib/pixi'

/**
 * Full-screen display mode for tablets.
 * Shows QR code during IDLE, animations during orders.
 * Auto-connects to Supabase realtime for order triggers.
 */
export default function DisplayPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<any>(null)
  const [currentState, setCurrentState] = useState<AnimationState>('IDLE')
  const [stateLabel, setStateLabel] = useState('Scan to order')
  const [shopName, setShopName] = useState('Deko')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#7C3AED')
  const [ready, setReady] = useState(false)

  // Load config and init engine
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/vendor')
        const data = await res.json()
        if (!mounted) return
        const vendorType = data?.vendor_type || 'coffee'
        if (data?.shop_name) setShopName(data.shop_name)
        if (data?.website_url) setWebsiteUrl(data.website_url)
        if (data?.primary_color) setPrimaryColor(data.primary_color)

        if (!containerRef.current) return

        const { createDekoEngine } = await import('@/lib/pixi')
        const { templates } = await import('@/lib/templates')
        const template = templates[vendorType] || templates.coffee

        const engine = await createDekoEngine({
          container: containerRef.current,
          template,
          onStateChange: (state, label) => {
            setCurrentState(state)
            setStateLabel(state === 'IDLE' ? 'Scan to order' : label)
          },
        })
        engineRef.current = engine
        setReady(true)
      } catch {
        // fallback
      }
    })()
    return () => { mounted = false }
  }, [])

  // Realtime order listener
  useEffect(() => {
    if (!ready || !engineRef.current) return
    let cleanup: (() => void) | undefined
    import('@/lib/realtime').then(({ useOrderStreamDirect }) => {
      cleanup = useOrderStreamDirect((order) => {
        if (!engineRef.current) return
        engineRef.current.runOrder({
          orderNumber: order.order_number,
          items: Array.isArray(order.items) ? order.items : [],
        })
      })
    }).catch(() => {})
    return () => { cleanup?.() }
  }, [ready])

  return (
    <main className="min-h-screen bg-[#FAFAF9] flex flex-col">
      {/* Minimal header */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: primaryColor }}>
          {shopName}
        </h1>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100" style={{ color: primaryColor }}>
          {stateLabel}
        </span>
      </div>
      {/* Canvas area */}
      <div ref={containerRef} className="flex-1 flex items-center justify-center" />
      {/* QR overlay when idle */}
      {currentState === 'IDLE' && websiteUrl && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAFAF9]/90 z-10">
          <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: primaryColor }}>
            {shopName}
          </h2>
          <p className="text-gray-400 mb-6">Scan to view our menu</p>
          {/* QR Code rendered as an image via API */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(websiteUrl)}`}
              alt="QR Code"
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>
          <p className="text-xs text-gray-300 mt-4">{websiteUrl}</p>
        </div>
      )}
    </main>
  )
}
