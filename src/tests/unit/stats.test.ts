import { describe, it, expect } from 'vitest'
import { calcTotalFees, calcPortfolioValue } from '../../core/stats'
import type { Trade, Position } from '../../api/types'

// Tests des statistiques du portefeuille
describe('Statistiques', () => {
  it('Given 3 trades avec frais, When calcTotalFees, Then somme de tous les frais', () => {
    const trades: Trade[] = [
      { id: '1', symbol: 'BTCUSDT', side: 'BUY', quantity: 0.1, price: 40_000, fees: 4, total: 4_004, timestamp: new Date() },
      { id: '2', symbol: 'ETHUSDT', side: 'BUY', quantity: 1, price: 3_000, fees: 3, total: 3_003, timestamp: new Date() },
      { id: '3', symbol: 'BTCUSDT', side: 'SELL', quantity: 0.1, price: 43_000, fees: 4.3, total: 4_295.7, timestamp: new Date() },
    ]
    expect(calcTotalFees(trades)).toBeCloseTo(11.3, 2)
  })

  it('Given solde 6000 + positions, When calcPortfolioValue, Then valeur totale = solde + positions', () => {
    const positions: Position[] = [
      { symbol: 'BTCUSDT', quantity: 0.1, avgBuyPrice: 40_000, currentPrice: 43_000 },
    ]
    // 6000 + (0.1 * 43 000) = 6000 + 4300 = 10 300
    expect(calcPortfolioValue(6_000, positions)).toBe(10_300)
  })

  it('Given aucune position, When calcPortfolioValue, Then valeur = solde seul', () => {
    expect(calcPortfolioValue(10_000, [])).toBe(10_000)
  })
})
