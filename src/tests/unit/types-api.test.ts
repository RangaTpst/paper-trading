import { describe, it, expect, vi } from 'vitest'
import { parseTicker, parseKline, parse24hrStats } from '../../api/binance/parser'

// Tests dédiés à la validation des types API Binance → types internes

describe('Validation des types API Binance', () => {
  describe('parseTicker', () => {
    it('convertit le price string en number', () => {
      const raw = { symbol: 'BTCUSDT', price: '43250.50' }
      const result = parseTicker(raw)
      expect(result.price).toBe(43_250.5)
      expect(typeof result.price).toBe('number')
    })

    it('lève une erreur si le champ price est absent', () => {
      expect(() => parseTicker({ symbol: 'BTCUSDT' } as any)).toThrow()
    })

    it('lève une erreur si symbol est absent', () => {
      expect(() => parseTicker({ price: '43000' } as any)).toThrow()
    })

    it('lève une erreur si price n\'est pas parseable en number', () => {
      expect(() => parseTicker({ symbol: 'BTCUSDT', price: 'abc' })).toThrow()
    })
  })

  describe('parseKline', () => {
    const validRaw = [
      1717200000000, '42000.00', '44000.00', '41500.00', '43250.50', '1250.5', 1717286399999,
    ]

    it('parse une kline Binance en objet typé', () => {
      const kline = parseKline(validRaw as any)
      expect(kline.openTime).toBe(1717200000000)
      expect(kline.open).toBe(42_000)
      expect(kline.high).toBe(44_000)
      expect(kline.low).toBe(41_500)
      expect(kline.close).toBe(43_250.5)
      expect(kline.volume).toBe(1_250.5)
    })

    it('tous les prix sont des numbers (pas des strings)', () => {
      const kline = parseKline(validRaw as any)
      expect(typeof kline.open).toBe('number')
      expect(typeof kline.high).toBe('number')
      expect(typeof kline.low).toBe('number')
      expect(typeof kline.close).toBe('number')
    })

    it('lève une erreur si le tableau est incomplet', () => {
      expect(() => parseKline([1717200000000] as any)).toThrow()
    })
  })

  describe('parse24hrStats', () => {
    const validRaw = {
      symbol: 'BTCUSDT',
      priceChange: '-500.00',
      priceChangePercent: '-1.14',
      lastPrice: '43250.50',
      volume: '28450.123',
      highPrice: '44000.00',
      lowPrice: '42000.00',
    }

    it('parse les stats 24h avec des numbers', () => {
      const stats = parse24hrStats(validRaw)
      expect(typeof stats.priceChange).toBe('number')
      expect(typeof stats.priceChangePercent).toBe('number')
      expect(typeof stats.lastPrice).toBe('number')
      expect(stats.priceChangePercent).toBeCloseTo(-1.14, 2)
    })

    it('lève une erreur si un champ obligatoire est manquant', () => {
      const incomplete = { symbol: 'BTCUSDT', lastPrice: '43250.50' }
      expect(() => parse24hrStats(incomplete as any)).toThrow()
    })
  })
})
