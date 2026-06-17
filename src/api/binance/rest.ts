import { CryptoPrice } from '../types'
import { parseTicker, parseKline, parse24hrStats, ParsedKline, Parsed24hrStats } from './parser'

const BASE_URL = 'https://api.binance.com/api/v3'

async function binanceFetch(url: string): Promise<unknown> {
  const res = await fetch(url)
  if (!res.ok) {
    if (res.status === 503) throw new Error('Binance API indisponible')
    const body = await res.json().catch(() => ({}))
    if ((body as { code?: number }).code === -1121) throw new Error('Symbole invalide')
    throw new Error(`Erreur Binance : ${res.status}`)
  }
  return res.json()
}

export async function getPrice(symbol: string): Promise<CryptoPrice> {
  const data = await binanceFetch(`${BASE_URL}/ticker/price?symbol=${symbol}`)
  return parseTicker(data as { symbol: string; price: string })
}

export async function getKlines(symbol: string, interval: string, limit: number): Promise<ParsedKline[]> {
  const data = await binanceFetch(`${BASE_URL}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`)
  return (data as unknown[][]).map(parseKline)
}

export async function get24hrStats(symbol: string): Promise<Parsed24hrStats> {
  const data = await binanceFetch(`${BASE_URL}/ticker/24hr?symbol=${symbol}`)
  return parse24hrStats(data as Parameters<typeof parse24hrStats>[0])
}
