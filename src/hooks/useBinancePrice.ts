import { useState, useEffect } from 'react'
import { getPrice, getKlines } from '../api/binance/rest'
import type { ParsedKline } from '../api/binance/parser'

export const PAIRS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT']

// Prix simulés utilisés si l'API Binance est inaccessible (blocage FAI/réseau)
const FALLBACK_PRICES: Record<string, number> = {
  BTCUSDT: 65_000,
  ETHUSDT: 3_500,
  BNBUSDT: 580,
  SOLUSDT: 145,
  XRPUSDT: 0.52,
}

export function useBinancePrices() {
  const [prices, setPrices] = useState<Record<string, number>>(FALLBACK_PRICES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const results = await Promise.all(PAIRS.map(s => getPrice(s)))
        const map: Record<string, number> = {}
        results.forEach(r => { map[r.symbol] = r.price })
        setPrices(map)
        setError(null)
      } catch {
        setPrices(FALLBACK_PRICES)
        setError('Prix simulés — API Binance inaccessible')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
    const interval = setInterval(fetchAll, 10_000)
    return () => clearInterval(interval)
  }, [])

  return { prices, loading, error, pairs: PAIRS }
}

export function useKlines(symbol: string) {
  const [klines, setKlines] = useState<ParsedKline[]>([])

  useEffect(() => {
    getKlines(symbol, '1h', 48)
      .then(setKlines)
      .catch(() => setKlines([]))
  }, [symbol])

  return klines
}
