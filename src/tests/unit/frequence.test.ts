import { describe, it, expect } from 'vitest'
import { calcTradingFrequency } from '../../core/stats'
import type { Trade } from '../../api/types'

// T02 — Vérification de la fréquence de trading
describe('Fréquence de trading', () => {
  const makeTrade = (date: string): Trade => ({
    id: Math.random().toString(),
    symbol: 'BTCUSDT', side: 'BUY',
    quantity: 0.01, price: 40_000, fees: 4, total: 400,
    timestamp: new Date(date),
  })

  it('Given 5 trades sur 3 jours, When fréquence/jour, Then ≈ 1.67 trades/jour', () => {
    const trades = [
      makeTrade('2024-01-01'),
      makeTrade('2024-01-01'),
      makeTrade('2024-01-02'),
      makeTrade('2024-01-02'),
      makeTrade('2024-01-03'),
    ]
    expect(calcTradingFrequency(trades, 'day')).toBeCloseTo(5 / 3, 1)
  })

  it('Given aucun trade, When fréquence calculée, Then fréquence = 0', () => {
    expect(calcTradingFrequency([], 'day')).toBe(0)
  })

  it('Given trades sur 2 semaines, When fréquence/semaine, Then compte bien par semaine', () => {
    const trades = [
      makeTrade('2024-01-01'), // semaine 1
      makeTrade('2024-01-08'), // semaine 2
      makeTrade('2024-01-08'), // semaine 2
    ]
    expect(calcTradingFrequency(trades, 'week')).toBeCloseTo(3 / 2, 1)
  })

  it('Given trades sur 2 mois, When fréquence/mois, Then compte bien par mois', () => {
    const trades = [
      makeTrade('2024-01-05'), // janvier
      makeTrade('2024-01-20'), // janvier
      makeTrade('2024-02-10'), // février
    ]
    expect(calcTradingFrequency(trades, 'month')).toBeCloseTo(3 / 2, 1)
  })
})
