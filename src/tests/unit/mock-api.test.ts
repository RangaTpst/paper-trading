import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPrice } from '../../api/binance/rest'

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
})
