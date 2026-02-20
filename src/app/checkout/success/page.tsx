'use client'

import { useEffect, useState } from 'react'

export default function CheckoutSuccess() {
  const [primaryColor, setPrimaryColor] = useState('#7C3AED')
  const [shopName, setShopName] = useState('Deko')

  useEffect(() => {
    fetch('/api/vendor')
      .then((r) => r.json())
      .then((data) => {
        if (data?.shop_name) setShopName(data.shop_name)
        if (data?.primary_color) setPrimaryColor(data.primary_color)
      })
      .catch(() => {})
  }, [])

  return (
    <main className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center gap-6 p-6">
      <div className="text-6xl">✨</div>
      <h1 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: primaryColor }}>
        Order Placed!
      </h1>
      <p className="text-gray-500 text-center max-w-sm">
        Thanks for ordering from {shopName}. Watch the display for your order animation!
      </p>
      <a
        href="/checkout"
        className="px-6 py-2 rounded-full text-sm font-medium border transition-colors"
        style={{ borderColor: primaryColor, color: primaryColor }}
      >
        Order Again
      </a>
    </main>
  )
}
