import { useState, useEffect } from 'react'
import { getPrice, getKlines } from '../api/binance/rest'
import type { ParsedKline } from '../api/binance/parser'

const PAIRS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT']

export function useBinancePrices() {
  const [prices, setPrices] = useState<Record<string, number>>({})
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
        setError('Impossible de récupérer les prix Binance')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
    const interval = setInterval(fetchAll, 5_000)
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
