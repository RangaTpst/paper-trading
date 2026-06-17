import type { BinanceTicker, Binance24hrStats } from './types'
import type { CryptoPrice } from '../types'

export interface ParsedKline {
  openTime: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  closeTime: number
}

export interface Parsed24hrStats {
  symbol: string
  priceChange: number
  priceChangePercent: number
  lastPrice: number
  volume: number
  highPrice: number
  lowPrice: number
}

// Format exact d'une kline Binance : [openTime, open, high, low, close, volume, closeTime, ...]
type RawKline = [number, string, string, string, string, string, number, ...unknown[]]

export function parseTicker(raw: BinanceTicker): CryptoPrice {
  if (!raw.symbol) throw new Error('Champ symbol manquant')
  if (raw.price === undefined || raw.price === null) throw new Error('Champ price manquant')
  const price = Number.parseFloat(raw.price)
  if (Number.isNaN(price)) throw new Error('price non parseable en number')
  return { symbol: raw.symbol, price }
}

export function parseKline(raw: RawKline): ParsedKline {
  if (raw.length < 7) throw new Error('Kline incomplète')
  return {
    openTime: raw[0],
    open: Number.parseFloat(raw[1]),
    high: Number.parseFloat(raw[2]),
    low: Number.parseFloat(raw[3]),
    close: Number.parseFloat(raw[4]),
    volume: Number.parseFloat(raw[5]),
    closeTime: raw[6],
  }
}

const REQUIRED_STATS_FIELDS = ['symbol', 'priceChange', 'priceChangePercent', 'lastPrice', 'volume', 'highPrice', 'lowPrice'] as const

export function parse24hrStats(raw: Partial<Binance24hrStats>): Parsed24hrStats {
  for (const field of REQUIRED_STATS_FIELDS) {
    if (!(field in raw)) throw new Error(`Champ obligatoire manquant : ${field}`)
  }
  const v = raw as Binance24hrStats
  return {
    symbol: v.symbol,
    priceChange: Number.parseFloat(v.priceChange),
    priceChangePercent: Number.parseFloat(v.priceChangePercent),
    lastPrice: Number.parseFloat(v.lastPrice),
    volume: Number.parseFloat(v.volume),
    highPrice: Number.parseFloat(v.highPrice),
    lowPrice: Number.parseFloat(v.lowPrice),
  }
}
