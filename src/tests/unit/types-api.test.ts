import { describe, it, expect } from 'vitest'
import { parseTicker, parseKline, parse24hrStats } from '../../api/binance/parser'
import type { BinanceTicker, Binance24hrStats } from '../../api/binance/types'

// T04 — Validation des types API : Binance retourne des strings, on veut des numbers
describe('Validation des types API Binance', () => {
  it('Given price en string "43000.50", When parseTicker, Then price est un number', () => {
    const raw = { symbol: 'BTCUSDT', price: '43000.50' }
    const result = parseTicker(raw)
    expect(result.price).toBe(43_000.5)
    expect(typeof result.price).toBe('number')
  })

  it('Given kline Binance (tableau de strings), When parseKline, Then open/close sont des numbers', () => {
    const raw: [number, string, string, string, string, string, number] = [
      1717200000000, '42000.00', '44000.00', '41500.00', '43000.00', '100.0', 1717286399999,
    ]
    const kline = parseKline(raw)
    expect(kline.open).toBe(42_000)
    expect(kline.close).toBe(43_000)
    expect(typeof kline.open).toBe('number')
  })

  it('Given ticker sans champ price, When parseTicker, Then erreur levée', () => {
    expect(() =>
      parseTicker({ symbol: 'BTCUSDT' } as unknown as BinanceTicker)
    ).toThrow()
  })

  it('Given stats 24h complètes (strings), When parse24hrStats, Then valeurs converties en number', () => {
    const raw: Binance24hrStats = {
      symbol: 'BTCUSDT',
      priceChange: '-500.00',
      priceChangePercent: '-1.14',
      lastPrice: '43250.50',
      volume: '28450.123',
      highPrice: '44000.00',
      lowPrice: '42000.00',
    }
    const stats = parse24hrStats(raw)
    expect(stats.priceChangePercent).toBeCloseTo(-1.14, 2)
    expect(typeof stats.lastPrice).toBe('number')
  })

  it('Given un champ obligatoire manquant, When parse24hrStats, Then erreur levée', () => {
    const incomplete = { symbol: 'BTCUSDT', lastPrice: '43250.50' }
    expect(() =>
      parse24hrStats(incomplete as unknown as Partial<Binance24hrStats>)
    ).toThrow()
  })
})
