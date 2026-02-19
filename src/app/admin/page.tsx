'use client'

import { useState } from 'react'

type VendorType = 'coffee' | 'pizza' | 'florist'

export default function AdminPanel() {
  const [shopName, setShopName] = useState('')
  const [vendor, setVendor] = useState<VendorType>('coffee')
  const [primaryColor, setPrimaryColor] = useState('#7C3AED')

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Deko Admin</h1>

        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Shop Settings</h2>

          <label className="block">
            <span className="text-sm text-gray-600">Shop Name</span>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
              placeholder="My Coffee Shop"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-600">Vendor Type</span>
            <select
              value={vendor}
              onChange={(e) => setVendor(e.target.value as VendorType)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
            >
              <option value="coffee">☕ Coffee Shop</option>
              <option value="pizza">🍕 Pizza / Fast Casual</option>
              <option value="florist">💐 Florist</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-gray-600">Brand Color</span>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="mt-1 block"
            />
          </label>

          <button className="px-6 py-2 bg-[#7C3AED] text-white rounded-lg font-medium hover:bg-[#6D28D9]">
            Save Settings
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Test Animation</h2>
          <button className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600">
            🎬 Trigger Test Order
          </button>
        </div>
      </div>
    </main>
  )
}
