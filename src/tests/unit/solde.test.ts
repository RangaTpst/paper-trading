import { describe, it, expect } from 'vitest'
import { createPortfolio, executeBuy } from '../../core/portfolio'

// T01 — Vérification du solde
describe('Solde du portefeuille', () => {
  it('Given un nouveau portefeuille, When créé avec 10 000, Then solde = 10 000', () => {
    const portfolio = createPortfolio(10_000)
    expect(portfolio.balance).toBe(10_000)
  })

  it('Given solde 10 000, When achat 0.1 BTC à 40 000, Then solde diminue de 4 004', () => {
    const portfolio = createPortfolio(10_000)
    const result = executeBuy(portfolio, { symbol: 'BTCUSDT', side: 'BUY', quantity: 0.1, price: 40_000 })
    // 0.1 * 40 000 = 4 000 + 4 USDT de frais (0.1%) = 4 004
    expect(result.balance).toBeCloseTo(5_996, 0)
  })

  it('Given solde insuffisant, When achat trop cher, Then erreur "Solde insuffisant"', () => {
    const portfolio = createPortfolio(1_000)
    expect(() =>
      executeBuy(portfolio, { symbol: 'BTCUSDT', side: 'BUY', quantity: 1, price: 50_000 })
    ).toThrow('Solde insuffisant')
  })
})
