import { describe, it, expect } from 'vitest'
import { calcPnL } from '../../core/stats'
import type { Trade } from '../../api/types'

// T05 — Vérification des gains (P&L = Profit and Loss)
describe('Gains et pertes (P&L)', () => {
  const achat: Trade = {
    id: '1', symbol: 'BTCUSDT', side: 'BUY',
    quantity: 0.1, price: 40_000, fees: 4, total: 4_004,
    timestamp: new Date(),
  }

  const vente: Trade = {
    id: '2', symbol: 'BTCUSDT', side: 'SELL',
    quantity: 0.1, price: 43_000, fees: 4.3, total: 4_295.7,
    timestamp: new Date(),
  }

  it('Given achat 40 000 + vente 43 000, When calcul P&L, Then gain ≈ 291.7 USDT', () => {
    // Gain brut : (43000 - 40000) * 0.1 = 300
    // Frais totaux : 4 + 4.3 = 8.3
    // Gain net : 300 - 8.3 = 291.7
    expect(calcPnL([achat, vente])).toBeCloseTo(291.7, 1)
  })

  it('Given vente à prix inférieur à l\'achat, When calcul P&L, Then perte', () => {
    const ventePerdue: Trade = { ...vente, price: 38_000, fees: 3.8, total: 3_796.2 }
    expect(calcPnL([achat, ventePerdue])).toBeLessThan(0)
  })

  it('Given aucun trade, When calcul P&L, Then P&L = 0', () => {
    expect(calcPnL([])).toBe(0)
  })
})
