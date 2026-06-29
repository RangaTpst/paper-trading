import { describe, it, expect } from 'vitest'
import { createPortfolio, executeBuy, executeSell } from '../../core/portfolio'

// Tests généraux du portefeuille (achat / vente / positions)
describe('Portefeuille', () => {
  it('Given nouveau portefeuille, When créé, Then vide avec solde initial', () => {
    const portfolio = createPortfolio(10_000)
    expect(portfolio.balance).toBe(10_000)
    expect(portfolio.positions).toHaveLength(0)
    expect(portfolio.tradeHistory).toHaveLength(0)
  })

  it('Given achat BTC, When executeBuy, Then position créée dans le portefeuille', () => {
    const portfolio = createPortfolio(10_000)
    const result = executeBuy(portfolio, { symbol: 'BTCUSDT', side: 'BUY', quantity: 0.1, price: 40_000 })
    expect(result.positions).toHaveLength(1)
    expect(result.positions[0].symbol).toBe('BTCUSDT')
    expect(result.positions[0].quantity).toBe(0.1)
  })

  it('Given position ouverte, When executeSell total, Then position supprimée', () => {
    let portfolio = createPortfolio(10_000)
    portfolio = executeBuy(portfolio, { symbol: 'BTCUSDT', side: 'BUY', quantity: 0.1, price: 40_000 })
    const result = executeSell(portfolio, { symbol: 'BTCUSDT', side: 'SELL', quantity: 0.1, price: 43_000 })
    expect(result.positions).toHaveLength(0)
  })

  it('Given pas de position ETH, When vente ETH, Then erreur "Position introuvable"', () => {
    const portfolio = createPortfolio(10_000)
    expect(() =>
      executeSell(portfolio, { symbol: 'ETHUSDT', side: 'SELL', quantity: 1, price: 3_000 })
    ).toThrow('Position introuvable')
  })

  it('Given position de 0.1 BTC, When vente partielle de 0.05, Then la position reste ouverte avec 0.05', () => {
    let portfolio = createPortfolio(10_000)
    portfolio = executeBuy(portfolio, { symbol: 'BTCUSDT', side: 'BUY', quantity: 0.1, price: 40_000 })
    const result = executeSell(portfolio, { symbol: 'BTCUSDT', side: 'SELL', quantity: 0.05, price: 43_000 })
    expect(result.positions).toHaveLength(1)
    expect(result.positions[0].quantity).toBeCloseTo(0.05, 5)
  })

  it('Given vente d\'une quantité supérieure à la position, When executeSell, Then erreur "Quantité insuffisante"', () => {
    let portfolio = createPortfolio(10_000)
    portfolio = executeBuy(portfolio, { symbol: 'BTCUSDT', side: 'BUY', quantity: 0.1, price: 40_000 })
    expect(() =>
      executeSell(portfolio, { symbol: 'BTCUSDT', side: 'SELL', quantity: 0.5, price: 43_000 })
    ).toThrow('Quantité insuffisante')
  })

  it('Given position BTC existante, When second achat du même symbole, Then les quantités se cumulent', () => {
    let portfolio = createPortfolio(10_000)
    portfolio = executeBuy(portfolio, { symbol: 'BTCUSDT', side: 'BUY', quantity: 0.1, price: 40_000 })
    const result = executeBuy(portfolio, { symbol: 'BTCUSDT', side: 'BUY', quantity: 0.1, price: 40_000 })
    expect(result.positions).toHaveLength(1)
    expect(result.positions[0].quantity).toBeCloseTo(0.2, 5)
  })
})
