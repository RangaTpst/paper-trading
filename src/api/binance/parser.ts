import { BinanceTicker, BinanceKline, Binance24hrStats } from './types'
import { CryptoPrice } from '../types'

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

export function parseTicker(raw: BinanceTicker): CryptoPrice {
  if (!raw.symbol) throw new Error('Champ symbol manquant')
  if (raw.price === undefined || raw.price === null) throw new Error('Champ price manquant')
  const price = parseFloat(raw.price)
  if (isNaN(price)) throw new Error('price non parseable en number')
  return { symbol: raw.symbol, price }
}

export function parseKline(raw: unknown[]): ParsedKline {
  if (!raw || raw.length < 7) throw new Error('Kline incomplète')
  return {
    openTime: raw[0] as number,
    open: parseFloat(raw[1] as string),
    high: parseFloat(raw[2] as string),
    low: parseFloat(raw[3] as string),
    close: parseFloat(raw[4] as string),
    volume: parseFloat(raw[5] as string),
    closeTime: raw[6] as number,
  }
}

export function parse24hrStats(raw: Partial<Binance24hrStats>): Parsed24hrStats {
  const required = ['symbol', 'priceChange', 'priceChangePercent', 'lastPrice', 'volume', 'highPrice', 'lowPrice']
  for (const field of required) {
    if (!(field in raw)) throw new Error(`Champ obligatoire manquant : ${field}`)
  }
  return {
    symbol: raw.symbol!,
    priceChange: parseFloat(raw.priceChange!),
    priceChangePercent: parseFloat(raw.priceChangePercent!),
    lastPrice: parseFloat(raw.lastPrice!),
    volume: parseFloat(raw.volume!),
    highPrice: parseFloat(raw.highPrice!),
    lowPrice: parseFloat(raw.lowPrice!),
  }
}
