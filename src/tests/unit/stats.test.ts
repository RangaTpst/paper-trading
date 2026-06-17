import { describe, it, expect } from 'vitest'
import { calcPnL, calcTradingFrequency, calcTotalFees, calcPortfolioValue } from '../../core/stats'
import { Trade, Position } from '../../api/types'

const makeTrade = (override: Partial<Trade> = {}): Trade => ({
  id: '1',
  symbol: 'BTCUSDT',
  side: 'BUY',
  quantity: 0.1,
  price: 40_000,
  fees: 4,
  total: 4_004,
  timestamp: new Date('2024-01-10'),
  ...override,
})

describe('calcPnL', () => {
  it('calcule un gain net positif', () => {
    // Achat 0.1 BTC à 40 000 → vente à 43 000
    const buy = makeTrade({ side: 'BUY', price: 40_000, fees: 4, total: 4_004 })
    const sell = makeTrade({ side: 'SELL', price: 43_000, fees: 4.3, total: 4_295.7 })
    const pnl = calcPnL([buy, sell])
    expect(pnl).toBeCloseTo(291.7, 1)
  })

  it('calcule une perte nette (trade perdant)', () => {
    const buy = makeTrade({ side: 'BUY', price: 40_000, fees: 4 })
    const sell = makeTrade({ side: 'SELL', price: 38_000, fees: 3.8 })
    const pnl = calcPnL([buy, sell])
    expect(pnl).toBeLessThan(0)
  })

  it('retourne 0 si aucun trade', () => {
    expect(calcPnL([])).toBe(0)
  })
})

describe('calcTradingFrequency', () => {
  it('calcule la fréquence journalière', () => {
    const trades = [
      makeTrade({ timestamp: new Date('2024-01-01') }),
      makeTrade({ timestamp: new Date('2024-01-01') }),
      makeTrade({ timestamp: new Date('2024-01-02') }),
      makeTrade({ timestamp: new Date('2024-01-02') }),
      makeTrade({ timestamp: new Date('2024-01-03') }),
    ]
    const freq = calcTradingFrequency(trades, 'day')
    expect(freq).toBeCloseTo(5 / 3, 1)
  })

  it('retourne 0 si aucun trade', () => {
    expect(calcTradingFrequency([], 'day')).toBe(0)
  })

  it('retourne 0 si 1 seul trade (pas de période calculable)', () => {
    expect(calcTradingFrequency([makeTrade()], 'day')).toBe(0)
  })
})

describe('calcTotalFees', () => {
  it('additionne tous les frais des trades', () => {
    const trades = [
      makeTrade({ fees: 4 }),
      makeTrade({ fees: 4.3 }),
      makeTrade({ fees: 2 }),
    ]
    expect(calcTotalFees(trades)).toBeCloseTo(10.3, 2)
  })

  it('retourne 0 si aucun trade', () => {
    expect(calcTotalFees([])).toBe(0)
  })
})

describe('calcPortfolioValue', () => {
  it('calcule la valeur totale : solde + positions au prix actuel', () => {
    const balance = 6_000
    const positions: Position[] = [
      { symbol: 'BTCUSDT', quantity: 0.1, avgBuyPrice: 40_000, currentPrice: 43_000 },
      { symbol: 'ETHUSDT', quantity: 1, avgBuyPrice: 3_000, currentPrice: 3_200 },
    ]
    // 6000 + (0.1 * 43000) + (1 * 3200) = 6000 + 4300 + 3200 = 13500
    expect(calcPortfolioValue(balance, positions)).toBe(13_500)
  })

  it('retourne le solde si aucune position ouverte', () => {
    expect(calcPortfolioValue(10_000, [])).toBe(10_000)
  })
})
