import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPrice, getKlines, get24hrStats } from '../../api/binance/rest'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => mockFetch.mockReset())

describe('Mock API Binance', () => {
  describe('getPrice — réponses nominales', () => {
    it('retourne BTCUSDT avec price en number', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ symbol: 'BTCUSDT', price: '43250.50' }),
      })
      const result = await getPrice('BTCUSDT')
      expect(result.symbol).toBe('BTCUSDT')
      expect(result.price).toBe(43_250.5)
      expect(typeof result.price).toBe('number')
    })

    it('convertit correctement le string Binance en number', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ symbol: 'ETHUSDT', price: '3000.99' }),
      })
      const result = await getPrice('ETHUSDT')
      expect(result.price).not.toBeNaN()
      expect(result.price).toBeTypeOf('number')
    })
  })

  describe('getPrice — erreurs réseau', () => {
    it('lève une erreur si Binance répond 503', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 503 })
      await expect(getPrice('BTCUSDT')).rejects.toThrow('Binance API indisponible')
    })

    it('lève une erreur pour un symbole invalide (-1121)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ code: -1121, msg: 'Invalid symbol.' }),
      })
      await expect(getPrice('FAKEUSDT')).rejects.toThrow('Symbole invalide')
    })

    it('lève une erreur si fetch rejette (pas de réseau)', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
      await expect(getPrice('BTCUSDT')).rejects.toThrow()
    })
  })

  describe('getKlines — données des chandeliers', () => {
    it('parse les klines et retourne les valeurs en number', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          [1717200000000, '42000.00', '44000.00', '41500.00', '43250.50', '1250.5', 1717286399999],
        ],
      })
      const klines = await getKlines('BTCUSDT', '1d', 1)
      expect(klines).toHaveLength(1)
      expect(typeof klines[0].open).toBe('number')
      expect(typeof klines[0].close).toBe('number')
      expect(klines[0].open).toBe(42_000)
    })

    it('retourne un tableau vide si Binance retourne []', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] })
      const klines = await getKlines('BTCUSDT', '1d', 0)
      expect(klines).toHaveLength(0)
    })
  })

  describe('get24hrStats — statistiques 24h', () => {
    it('retourne les stats avec les valeurs parsées', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          symbol: 'BTCUSDT',
          priceChange: '-500.00',
          priceChangePercent: '-1.14',
          lastPrice: '43250.50',
          volume: '28450.123',
          highPrice: '44000.00',
          lowPrice: '42000.00',
        }),
      })
      const stats = await get24hrStats('BTCUSDT')
      expect(stats.priceChangePercent).toBeCloseTo(-1.14, 2)
      expect(typeof stats.lastPrice).toBe('number')
    })
  })
})
