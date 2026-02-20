'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { AnimationState } from '@/lib/pixi'

export default function DekoDisplay() {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<any>(null)
  const [started, setStarted] = useState(false)
  const [currentState, setCurrentState] = useState<AnimationState>('IDLE')
  const [stateLabel, setStateLabel] = useState('')
  const [queueCount, setQueueCount] = useState(0)
  const orderCounter = useRef(0)

  const initEngine = useCallback(async () => {
    if (!containerRef.current || engineRef.current) return
    const { createDekoEngine } = await import('@/lib/pixi')
    const { coffeeTemplate } = await import('@/lib/templates')
    const engine = await createDekoEngine({
      container: containerRef.current,
      template: coffeeTemplate,
      onStateChange: (state, label) => {
        setCurrentState(state)
        setStateLabel(label)
      },
    })
    engineRef.current = engine as any
    setStarted(true)
  }, [])

  useEffect(() => {
    return () => {
      if (engineRef.current && 'destroy' in (engineRef.current as any)) {
        (engineRef.current as any).destroy()
      }
    }
  }, [])

  const handleNewOrder = useCallback(() => {
    if (!engineRef.current) return
    const engine = engineRef.current as any
    orderCounter.current++
    const items = [
      ['Flat White', 'Croissant'],
      ['Latte', 'Muffin'],
      ['Espresso'],
      ['Cappuccino', 'Scone'],
      ['Mocha', 'Cookie'],
    ]
    const randomItems = items[Math.floor(Math.random() * items.length)]
    engine.runOrder({
      orderNumber: String(orderCounter.current).padStart(3, '0'),
      items: randomItems,
    })
    setQueueCount((q) => Math.min(q + 1, 5))
  }, [])

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
          <h1 className="text-7xl font-bold text-[#7C3AED]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Deko
          </h1>
          <p className="text-xl text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            Wait time? Show time.
          </p>
        </div>
        <button
          onClick={async () => {
            await initEngine()
            // Give a tick for engine to init, then send first order
            setTimeout(() => handleNewOrder(), 100)
          }}
          className="px-10 py-4 bg-[#7C3AED] text-white rounded-full text-lg font-semibold hover:bg-[#6D28D9] transition-all hover:scale-105 shadow-lg shadow-purple-200"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Start Demo
        </button>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FAFAF9] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-bold text-[#7C3AED]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Deko
        </h1>
        <div className="flex items-center gap-4">
          {currentState !== 'IDLE' && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-[#7C3AED]">
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
            className="px-6 py-2 bg-[#7C3AED] text-white rounded-full text-sm font-semibold hover:bg-[#6D28D9] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
