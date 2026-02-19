'use client'

import { useEffect, useRef, useState } from 'react'

export default function DekoDisplay() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'idle' | 'animating'>('idle')

  return (
    <main className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center">
      {status === 'idle' ? (
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold text-[#7C3AED]">Deko</h1>
          <p className="text-xl text-gray-500">Wait time? Show time.</p>
          <button
            onClick={() => setStatus('animating')}
            className="px-8 py-3 bg-[#7C3AED] text-white rounded-full text-lg font-medium hover:bg-[#6D28D9] transition-colors"
          >
            Demo Animation
          </button>
        </div>
      ) : (
        <div ref={containerRef} className="w-full h-screen" />
      )}
    </main>
  )
}
