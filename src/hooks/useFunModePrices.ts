import { useEffect, useRef, useState } from 'react'
import { nextMockPrice } from '../core/mockPrices'
import { PAIRS } from './useBinancePrice'
import type { ParsedKline } from '../api/binance/parser'

// Volatilité largement supérieure au marché réel
const VOLATILITY = 0.04
const TICK_MS = 2_000
const HISTORY_LENGTH = 48

const SEED_PRICES: Record<string, number> = {
  BTCUSDT: 65_000,
  ETHUSDT: 3_500,
  BNBUSDT: 580,
  SOLUSDT: 145,
  XRPUSDT: 0.52,
}

function makeKlinePoint(price: number, time: number): ParsedKline {
  return { openTime: time, open: price, high: price, low: price, close: price, volume: 0, closeTime: time }
}

function seedKlinesMap(): Record<string, ParsedKline[]> {
  const now = Date.now()
  const seeded: Record<string, ParsedKline[]> = {}
  for (const pair of PAIRS) seeded[pair] = [makeKlinePoint(SEED_PRICES[pair], now)]
  return seeded
}

export function useFunModePrices(enabled: boolean) {
  const [prices, setPrices] = useState<Record<string, number>>(SEED_PRICES)
  const [klinesMap, setKlinesMap] = useState<Record<string, ParsedKline[]>>(seedKlinesMap)
  const pricesRef = useRef(SEED_PRICES)

  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      const now = Date.now()
      const updatedPrices: Record<string, number> = {}
      for (const pair of PAIRS) {
        updatedPrices[pair] = nextMockPrice(pricesRef.current[pair] ?? SEED_PRICES[pair], VOLATILITY)
      }
      pricesRef.current = updatedPrices
      setPrices(updatedPrices)
      setKlinesMap(prev => {
        const next: Record<string, ParsedKline[]> = {}
        for (const pair of PAIRS) {
          const history = prev[pair] ?? []
          next[pair] = [...history, makeKlinePoint(updatedPrices[pair], now)].slice(-HISTORY_LENGTH)
        }
        return next
      })
    }, TICK_MS)

    return () => clearInterval(interval)
  }, [enabled])

  return { prices, klinesMap }
}
