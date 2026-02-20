'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js'

export interface OrderEvent {
  id: string
  order_number: string
  customer_name: string | null
  items: unknown[]
  amount_cents: number | null
  currency: string
  source: string
  status: string
  created_at: string
}

export function useOrderStream() {
  const [latestOrder, setLatestOrder] = useState<OrderEvent | null>(null)
  const [orders, setOrders] = useState<OrderEvent[]>([])

  const clearLatest = useCallback(() => setLatestOrder(null), [])

  useEffect(() => {
    const channel = supabase
      .channel('order_log_inserts')
      .on<OrderEvent>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'order_log' },
        (payload: RealtimePostgresInsertPayload<OrderEvent>) => {
          const order = payload.new
          setLatestOrder(order)
          setOrders((prev) => [order, ...prev].slice(0, 50))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { latestOrder, orders, clearLatest }
}
