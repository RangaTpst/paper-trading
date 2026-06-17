import { describe, it, expect } from 'vitest'
import { calcPnL, calcRoi } from '../../core/stats'
import type { Trade } from '../../api/types'

const makeTrade = (override: Partial<Trade> = {}): Trade => ({
  id: Math.random().toString(),
  symbol: 'BTCUSDT',
  side: 'BUY',
  quantity: 0.1,
  price: 40_000,
  fees: 4,
  total: 4_004,
  timestamp: new Date(),
  ...override,
})

describe('Vérification des gains (P&L)', () => {
  describe('gain positif', () => {
    it('calcule le gain net après achat/vente profitable', () => {
      // Achat 0.1 BTC à 40 000 → vente à 43 000
      // Gain brut : (43000 - 40000) * 0.1 = 300
      // Frais : 4 (achat) + 4.3 (vente) = 8.3
      // Gain net : 300 - 8.3 = 291.7
      const buy = makeTrade({ side: 'BUY', price: 40_000, fees: 4 })
      const sell = makeTrade({ side: 'SELL', price: 43_000, fees: 4.3 })
      expect(calcPnL([buy, sell])).toBeCloseTo(291.7, 1)
    })

    it('calcule le gain sur ETH', () => {
      const buy = makeTrade({ symbol: 'ETHUSDT', side: 'BUY', quantity: 1, price: 3_000, fees: 3 })
      const sell = makeTrade({ symbol: 'ETHUSDT', side: 'SELL', quantity: 1, price: 3_500, fees: 3.5 })
      expect(calcPnL([buy, sell])).toBeCloseTo(500 - 6.5, 1)
    })
  })

  describe('perte (gain négatif)', () => {
    it('calcule une perte sur un trade perdant', () => {
      const buy = makeTrade({ side: 'BUY', price: 43_000, fees: 4.3 })
      const sell = makeTrade({ side: 'SELL', price: 40_000, fees: 4 })
      expect(calcPnL([buy, sell])).toBeLessThan(0)
    })

    it('la perte inclut les frais des deux côtés', () => {
      const buy = makeTrade({ side: 'BUY', price: 43_000, fees: 4.3 })
      const sell = makeTrade({ side: 'SELL', price: 40_000, fees: 4 })
      const pnl = calcPnL([buy, sell])
      // Perte brute : (40000 - 43000) * 0.1 = -300
      // Frais : 4.3 + 4 = 8.3
      // Perte nette : -300 - 8.3 = -308.3
      expect(pnl).toBeCloseTo(-308.3, 1)
    })
  })

  describe('cas limites', () => {
    it('retourne 0 si aucun trade', () => {
      expect(calcPnL([])).toBe(0)
    })

    it('retourne 0 si seulement des achats sans vente', () => {
      const buys = [
        makeTrade({ side: 'BUY' }),
        makeTrade({ side: 'BUY' }),
      ]
      expect(calcPnL(buys)).toBe(0)
    })
  })

  describe('ROI (retour sur investissement en %)', () => {
    it('calcule le ROI positif', () => {
      // Investi 4000, gagné 291.7 → ROI = 291.7 / 4000 * 100 ≈ 7.29%
      const roi = calcRoi(291.7, 4_000)
      expect(roi).toBeCloseTo(7.29, 1)
    })

    it('calcule le ROI négatif (perte)', () => {
      const roi = calcRoi(-308.3, 4_300)
      expect(roi).toBeLessThan(0)
    })

    it('retourne 0 si le capital investi est 0', () => {
      expect(calcRoi(0, 0)).toBe(0)
    })
  })
})
