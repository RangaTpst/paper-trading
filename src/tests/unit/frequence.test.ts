import { describe, it, expect } from 'vitest'
import { calcTradingFrequency } from '../../core/stats'
import type { Trade } from '../../api/types'

const makeTrade = (date: string): Trade => ({
  id: Math.random().toString(),
  symbol: 'BTCUSDT',
  side: 'BUY',
  quantity: 0.01,
  price: 40_000,
  fees: 4,
  total: 400,
  timestamp: new Date(date),
})

describe('Fréquence de trading', () => {
  describe('par jour', () => {
    it('calcule la moyenne de trades par jour', () => {
      const trades = [
        makeTrade('2024-01-01'),
        makeTrade('2024-01-01'),
        makeTrade('2024-01-02'),
        makeTrade('2024-01-02'),
        makeTrade('2024-01-03'),
      ]
      const freq = calcTradingFrequency(trades, 'day')
      expect(freq).toBeCloseTo(5 / 3, 1)
    })

    it('retourne 0 si aucun trade', () => {
      expect(calcTradingFrequency([], 'day')).toBe(0)
    })

    it('retourne 0 si un seul trade (pas de période mesurable)', () => {
      expect(calcTradingFrequency([makeTrade('2024-01-01')], 'day')).toBe(0)
    })

    it('gère plusieurs trades le même jour', () => {
      const trades = Array.from({ length: 5 }, () => makeTrade('2024-01-01'))
      const freq = calcTradingFrequency(trades, 'day')
      expect(freq).toBe(5)
    })
  })

  describe('par semaine', () => {
    it('calcule la fréquence hebdomadaire', () => {
      const trades = [
        makeTrade('2024-01-01'), // semaine 1
        makeTrade('2024-01-03'), // semaine 1
        makeTrade('2024-01-08'), // semaine 2
      ]
      const freq = calcTradingFrequency(trades, 'week')
      expect(freq).toBeCloseTo(3 / 2, 1)
    })
  })

  describe('par mois', () => {
    it('calcule la fréquence mensuelle', () => {
      const trades = [
        makeTrade('2024-01-05'),
        makeTrade('2024-01-20'),
        makeTrade('2024-02-10'),
        makeTrade('2024-02-25'),
        makeTrade('2024-03-01'),
      ]
      const freq = calcTradingFrequency(trades, 'month')
      expect(freq).toBeCloseTo(5 / 3, 1)
    })

    it('retourne 0 sur une période sans activité', () => {
      expect(calcTradingFrequency([], 'month')).toBe(0)
    })
  })
})
