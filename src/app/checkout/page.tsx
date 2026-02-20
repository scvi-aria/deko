'use client'

import { useState, useEffect } from 'react'

interface MenuItem {
  name: string
  price: number
  emoji: string
}

const MENUS: Record<string, MenuItem[]> = {
  coffee: [
    { name: 'Flat White', price: 4.5, emoji: '☕' },
    { name: 'Latte', price: 5.0, emoji: '☕' },
    { name: 'Cappuccino', price: 4.5, emoji: '☕' },
    { name: 'Espresso', price: 3.5, emoji: '☕' },
    { name: 'Croissant', price: 4.0, emoji: '🥐' },
    { name: 'Muffin', price: 3.5, emoji: '🧁' },
  ],
  pizza: [
    { name: 'Margherita', price: 16.0, emoji: '🍕' },
    { name: 'Pepperoni', price: 18.0, emoji: '🍕' },
    { name: 'Hawaiian', price: 17.0, emoji: '🍕' },
    { name: 'Garlic Bread', price: 6.0, emoji: '🍞' },
    { name: 'Fries', price: 5.0, emoji: '🍟' },
  ],
  florist: [
    { name: 'Red Roses x12', price: 45.0, emoji: '🌹' },
    { name: 'Mixed Bouquet', price: 35.0, emoji: '💐' },
    { name: 'Sunflowers x6', price: 28.0, emoji: '🌻' },
    { name: 'Tulips x6', price: 30.0, emoji: '🌷' },
  ],
}

export default function CheckoutPage() {
  const [vendorType, setVendorType] = useState('coffee')
  const [shopName, setShopName] = useState('Deko')
  const [primaryColor, setPrimaryColor] = useState('#7C3AED')
  const [cart, setCart] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/vendor')
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setVendorType(data.vendor_type || 'coffee')
          setShopName(data.shop_name || 'Deko')
          setPrimaryColor(data.primary_color || '#7C3AED')
        }
      })
      .catch(() => {})
  }, [])

  const menu = MENUS[vendorType] || MENUS.coffee

  const addToCart = (name: string) => {
    setCart((prev) => {
      const next = new Map(prev)
      next.set(name, (next.get(name) || 0) + 1)
      return next
    })
  }

  const removeFromCart = (name: string) => {
    setCart((prev) => {
      const next = new Map(prev)
      const count = next.get(name) || 0
      if (count <= 1) next.delete(name)
      else next.set(name, count - 1)
      return next
    })
  }

  const total = Array.from(cart.entries()).reduce((sum, [name, qty]) => {
    const item = menu.find((m) => m.name === name)
    return sum + (item?.price || 0) * qty
  }, 0)

  const handleCheckout = async () => {
    if (cart.size === 0) return
    setLoading(true)
    try {
      const items = Array.from(cart.entries()).map(([name, qty]) => {
        const item = menu.find((m) => m.name === name)
        return { name, price: item?.price || 0, quantity: qty }
      })
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, vendorName: shopName }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Checkout failed')
      }
    } catch {
      alert('Network error')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#FAFAF9] p-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: primaryColor }}>
            {shopName}
          </h1>
          <p className="text-sm text-gray-400 mt-1">Order & Pay</p>
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {menu.map((item) => {
            const qty = cart.get(item.name) || 0
            return (
              <div
                key={item.name}
                className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-gray-400">${item.price.toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {qty > 0 && (
                    <>
                      <button
                        onClick={() => removeFromCart(item.name)}
                        className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-sm font-bold hover:bg-gray-200"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm font-medium">{qty}</span>
                    </>
                  )}
                  <button
                    onClick={() => addToCart(item.name)}
                    className="w-7 h-7 rounded-full text-white text-sm font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Cart summary */}
        {cart.size > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-lg">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? 'Redirecting...' : `Pay $${total.toFixed(2)}`}
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-300">Powered by Deko × Stripe</p>
      </div>
    </main>
  )
}
