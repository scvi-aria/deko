'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { AnimationState } from '@/lib/pixi'

type VendorType = 'coffee' | 'pizza' | 'florist'

export default function DekoDisplay() {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<any>(null)
  const [started, setStarted] = useState(false)
  const [currentState, setCurrentState] = useState<AnimationState>('IDLE')
  const [stateLabel, setStateLabel] = useState('')
  const [queueCount, setQueueCount] = useState(0)
  const [vendorType, setVendorType] = useState<VendorType>('coffee')
  const [shopName, setShopName] = useState('Deko')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#7C3AED')
  const orderCounter = useRef(0)
  const configLoaded = useRef(false)

  // Load vendor config from Supabase
  useEffect(() => {
    if (configLoaded.current) return
    configLoaded.current = true

    // Check URL params first
    const params = new URLSearchParams(window.location.search)
    const urlVendor = params.get('vendor') as VendorType | null

    fetch('/api/vendor')
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setVendorType(urlVendor || data.vendor_type || 'coffee')
          setShopName(data.shop_name || 'Deko')
          setWebsiteUrl(data.website_url || '')
          setPrimaryColor(data.primary_color || '#7C3AED')
        } else if (urlVendor) {
          setVendorType(urlVendor)
        }
      })
      .catch(() => {
        if (urlVendor) setVendorType(urlVendor)
      })
  }, [])

  const initEngine = useCallback(async (vendor?: VendorType) => {
    if (!containerRef.current) return
    // Destroy existing engine
    if (engineRef.current && 'destroy' in engineRef.current) {
      engineRef.current.destroy()
      engineRef.current = null
    }
    // Clear container
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }

    const { createDekoEngine } = await import('@/lib/pixi')
    const { templates } = await import('@/lib/templates')
    const template = templates[vendor || vendorType] || templates.coffee

    const engine = await createDekoEngine({
      container: containerRef.current!,
      template,
      onStateChange: (state, label) => {
        setCurrentState(state)
        setStateLabel(label)
      },
    })
    engineRef.current = engine as any
    setStarted(true)
  }, [vendorType])

  useEffect(() => {
    return () => {
      if (engineRef.current && 'destroy' in (engineRef.current as any)) {
        (engineRef.current as any).destroy()
      }
    }
  }, [])

  // Listen for realtime orders from Supabase
  useEffect(() => {
    if (!started || !engineRef.current) return
    let cleanup: (() => void) | undefined

    import('@/lib/realtime').then(({ useOrderStreamDirect }) => {
      cleanup = useOrderStreamDirect((order) => {
        if (!engineRef.current) return
        const engine = engineRef.current as any
        engine.runOrder({
          orderNumber: order.order_number,
          items: Array.isArray(order.items) ? order.items : [],
        })
        setQueueCount((q) => Math.min(q + 1, 5))
      })
    }).catch(() => {})

    return () => { cleanup?.() }
  }, [started])

  const handleNewOrder = useCallback(() => {
    if (!engineRef.current) return
    const engine = engineRef.current as any
    orderCounter.current++
    const itemSets: Record<VendorType, string[][]> = {
      coffee: [['Flat White', 'Croissant'], ['Latte', 'Muffin'], ['Espresso'], ['Cappuccino', 'Scone']],
      pizza: [['Margherita'], ['Pepperoni', 'Garlic Bread'], ['Hawaiian'], ['BBQ Chicken', 'Fries']],
      florist: [['Red Roses x12'], ['Mixed Bouquet'], ['Sunflowers', 'Baby Breath'], ['Tulips x6']],
    }
    const items = itemSets[vendorType] || itemSets.coffee
    const randomItems = items[Math.floor(Math.random() * items.length)]
    engine.runOrder({
      orderNumber: String(orderCounter.current).padStart(3, '0'),
      items: randomItems,
    })
    setQueueCount((q) => Math.min(q + 1, 5))
  }, [vendorType])

  // Track queue count based on state changes
  useEffect(() => {
    if (currentState === 'IDLE') {
      setQueueCount((q) => Math.max(0, q - 1))
    }
  }, [currentState])

  if (!started) {
    return (
      <main className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center gap-8">
        <div className="text-center space-y-4">
          <h1 className="text-7xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: primaryColor }}>
            {shopName || 'Deko'}
          </h1>
          <p className="text-xl text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            Wait time? Show time.
          </p>
          {/* Vendor indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {(['coffee', 'pizza', 'florist'] as VendorType[]).map((v) => (
              <button
                key={v}
                onClick={() => setVendorType(v)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  vendorType === v
                    ? 'bg-purple-100 text-[#7C3AED] font-medium'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {v === 'coffee' ? '☕' : v === 'pizza' ? '🍕' : '💐'} {v}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={async () => {
            await initEngine(vendorType)
            setTimeout(() => handleNewOrder(), 100)
          }}
          className="px-10 py-4 text-white rounded-full text-lg font-semibold transition-all hover:scale-105 shadow-lg"
          style={{ fontFamily: 'Inter, sans-serif', backgroundColor: primaryColor }}
        >
          Start Demo
        </button>
        <a href="/admin" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Admin Panel →
        </a>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FAFAF9] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: primaryColor }}>
          {shopName || 'Deko'}
        </h1>
        <div className="flex items-center gap-4">
          {currentState !== 'IDLE' && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100" style={{ color: primaryColor }}>
              {stateLabel}
            </span>
          )}
          {queueCount > 0 && (
            <span className="text-sm text-gray-400">
              Queue: {queueCount}
            </span>
          )}
          <button
            onClick={handleNewOrder}
            className="px-6 py-2 text-white rounded-full text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: primaryColor }}
            disabled={queueCount >= 5}
          >
            + New Order
          </button>
        </div>
      </div>
      {/* Canvas */}
      <div ref={containerRef} className="flex-1 flex items-center justify-center" />
    </main>
  )
}
