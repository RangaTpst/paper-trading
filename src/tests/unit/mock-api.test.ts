import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPrice, getKlines, get24hrStats } from '../../api/binance/rest'

// T03 — Mock : simuler l'API sans vrais appels réseau
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => mockFetch.mockReset())

describe('Mock API Binance', () => {
  it('Given réponse simulée, When getPrice appelé, Then retourne le prix en number', async () => {
    // On simule la réponse de Binance sans appel réseau réel
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ symbol: 'BTCUSDT', price: '43000.00' }),
    })

    const result = await getPrice('BTCUSDT')

    expect(result.symbol).toBe('BTCUSDT')
    expect(result.price).toBe(43_000)
    expect(typeof result.price).toBe('number') // Binance envoie des strings, on veut des numbers
  })

  it('Given API en erreur (503), When getPrice appelé, Then erreur levée', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 })

    await expect(getPrice('BTCUSDT')).rejects.toThrow('Binance API indisponible')
  })

  it('Given pas de réseau, When getPrice appelé, Then erreur levée', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    await expect(getPrice('BTCUSDT')).rejects.toThrow()
  })

  it('Given symbole invalide (code -1121), When getPrice appelé, Then erreur "Symbole invalide"', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ code: -1121, msg: 'Invalid symbol.' }),
    })

    await expect(getPrice('FAKEUSDT')).rejects.toThrow('Symbole invalide')
  })

  it('Given bougies simulées, When getKlines appelé, Then retourne les valeurs en number', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        [1717200000000, '42000.00', '44000.00', '41500.00', '43000.00', '100.0', 1717286399999],
      ],
    })

    const klines = await getKlines('BTCUSDT', '1h', 1)

    expect(klines).toHaveLength(1)
    expect(klines[0].close).toBe(43_000)
  })

  it('Given stats 24h simulées, When get24hrStats appelé, Then retourne les valeurs en number', async () => {
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

    expect(stats.lastPrice).toBe(43_250.5)
    expect(typeof stats.priceChangePercent).toBe('number')
  })
})
