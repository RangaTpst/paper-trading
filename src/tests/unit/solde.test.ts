import { describe, it, expect, beforeEach } from 'vitest'
import { createPortfolio, executeBuy, executeSell } from '../../core/portfolio'
import type { Portfolio } from '../../api/types'

// Tests dédiés à la vérification du solde (balance)

const BALANCE_INITIALE = 10_000

describe('Vérification du solde', () => {
  let portfolio: Portfolio

  beforeEach(() => {
    portfolio = createPortfolio(BALANCE_INITIALE)
  })

  it('le solde initial est correct', () => {
    expect(portfolio.balance).toBe(BALANCE_INITIALE)
  })

  it('le solde diminue après un achat (montant + frais)', () => {
    // 0.1 BTC à 40 000 = 4 000 USDT + 4 USDT de frais (0.1%)
    const result = executeBuy(portfolio, { symbol: 'BTCUSDT', side: 'BUY', quantity: 0.1, price: 40_000 })
    expect(result.balance).toBeCloseTo(5_996, 0)
  })

  it('le solde augmente après une vente', () => {
    const apresAchat = executeBuy(portfolio, { symbol: 'BTCUSDT', side: 'BUY', quantity: 0.1, price: 40_000 })
    const apresVente = executeSell(apresAchat, { symbol: 'BTCUSDT', side: 'SELL', quantity: 0.1, price: 43_000 })
    expect(apresVente.balance).toBeGreaterThan(apresAchat.balance)
  })

  it('le solde ne peut jamais être négatif', () => {
    expect(() =>
      executeBuy(portfolio, { symbol: 'BTCUSDT', side: 'BUY', quantity: 1, price: 15_000 })
    ).toThrow('Solde insuffisant')
    expect(portfolio.balance).toBe(BALANCE_INITIALE)
  })

  it('le solde est correct après plusieurs trades successifs', () => {
    let p = executeBuy(portfolio, { symbol: 'BTCUSDT', side: 'BUY', quantity: 0.05, price: 40_000 })
    p = executeBuy(p, { symbol: 'ETHUSDT', side: 'BUY', quantity: 1, price: 3_000 })
    // 10000 - (0.05*40000 + 2) - (3000 + 3) = 10000 - 2002 - 3003 = 4995
    expect(p.balance).toBeCloseTo(4_995, 0)
  })

  it('les frais sont bien inclus dans la déduction du solde', () => {
    const montant = 1_000
    const fraisAttendus = montant * 0.001
    const result = executeBuy(portfolio, { symbol: 'ETHUSDT', side: 'BUY', quantity: 1, price: montant })
    const deduit = BALANCE_INITIALE - result.balance
    expect(deduit).toBeCloseTo(montant + fraisAttendus, 2)
  })
})
