import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPrice, getKlines } from '../../api/binance/rest'

// Mock du fetch global — on ne tape jamais sur la vraie API Binance dans les tests
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
})

describe('getPrice', () => {
  it('retourne le prix parsé en number pour BTCUSDT', async () => {
    // Binance retourne price en string → doit être converti en number
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ symbol: 'BTCUSDT', price: '43250.50' }),
    })

    const result = await getPrice('BTCUSDT')
    expect(result.symbol).toBe('BTCUSDT')
    expect(result.price).toBe(43_250.5)
    expect(typeof result.price).toBe('number')
  })

  it('lance une erreur si l\'API Binance répond 503', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 })
    await expect(getPrice('BTCUSDT')).rejects.toThrow('Binance API indisponible')
  })

  it('lance une erreur pour un symbole invalide (code -1121)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ code: -1121, msg: 'Invalid symbol.' }),
    })
    await expect(getPrice('AAAUSDT')).rejects.toThrow('Symbole invalide')
  })
})

describe('getKlines', () => {
  it('retourne des chandeliers avec les valeurs numériques', async () => {
    // Format Binance : tableau de tableaux [openTime, open, high, low, close, volume, ...]
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        [1717200000000, '42000.00', '44000.00', '41500.00', '43250.50', '1250.5', 1717286399999],
      ],
    })

    const klines = await getKlines('BTCUSDT', '1d', 1)
    expect(klines).toHaveLength(1)
    expect(klines[0].open).toBe(42_000)
    expect(klines[0].close).toBe(43_250.5)
    expect(typeof klines[0].high).toBe('number')
  })
})
