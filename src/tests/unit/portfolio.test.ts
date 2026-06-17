import { describe, it, expect, beforeEach } from 'vitest'
import { createPortfolio, executeBuy, executeSell } from '../../core/portfolio'
import { Portfolio } from '../../api/types'

const INITIAL_BALANCE = 10_000

describe('createPortfolio', () => {
  it('crée un portefeuille avec le solde initial', () => {
    const portfolio = createPortfolio(INITIAL_BALANCE)
    expect(portfolio.balance).toBe(INITIAL_BALANCE)
    expect(portfolio.positions).toHaveLength(0)
    expect(portfolio.tradeHistory).toHaveLength(0)
  })
})

describe('executeBuy', () => {
  let portfolio: Portfolio

  beforeEach(() => {
    portfolio = createPortfolio(INITIAL_BALANCE)
  })

  it('déduit le montant + frais du solde après un achat', () => {
    // 0.1 BTC à 40 000 USDT = 4 000 USDT + 4 USDT de frais
    const result = executeBuy(portfolio, { symbol: 'BTCUSDT', side: 'BUY', quantity: 0.1, price: 40_000 })
    expect(result.balance).toBeCloseTo(10_000 - 4_000 - 4, 2)
  })

  it('crée une position après un achat', () => {
    const result = executeBuy(portfolio, { symbol: 'BTCUSDT', side: 'BUY', quantity: 0.1, price: 40_000 })
    expect(result.positions).toHaveLength(1)
    expect(result.positions[0].symbol).toBe('BTCUSDT')
    expect(result.positions[0].quantity).toBe(0.1)
  })

  it('enregistre le trade dans l\'historique', () => {
    const result = executeBuy(portfolio, { symbol: 'BTCUSDT', side: 'BUY', quantity: 0.1, price: 40_000 })
    expect(result.tradeHistory).toHaveLength(1)
    expect(result.tradeHistory[0].side).toBe('BUY')
  })

  it('rejette l\'ordre si le solde est insuffisant', () => {
    expect(() =>
      executeBuy(portfolio, { symbol: 'BTCUSDT', side: 'BUY', quantity: 10, price: 40_000 })
    ).toThrow('Solde insuffisant')
  })

  it('le solde ne peut pas devenir négatif', () => {
    expect(() =>
      executeBuy(portfolio, { symbol: 'BTCUSDT', side: 'BUY', quantity: 999, price: 1_000 })
    ).toThrow()
  })

  it('cumule les quantités si la position existe déjà', () => {
    const after1 = executeBuy(portfolio, { symbol: 'BTCUSDT', side: 'BUY', quantity: 0.1, price: 40_000 })
    const after2 = executeBuy(after1, { symbol: 'BTCUSDT', side: 'BUY', quantity: 0.1, price: 40_000 })
    expect(after2.positions).toHaveLength(1)
    expect(after2.positions[0].quantity).toBeCloseTo(0.2, 5)
  })
})

describe('executeSell', () => {
  let portfolio: Portfolio

  beforeEach(() => {
    portfolio = createPortfolio(INITIAL_BALANCE)
    portfolio = executeBuy(portfolio, { symbol: 'BTCUSDT', side: 'BUY', quantity: 0.1, price: 40_000 })
  })

  it('crédite le solde après une vente', () => {
    const result = executeSell(portfolio, { symbol: 'BTCUSDT', side: 'SELL', quantity: 0.1, price: 43_000 })
    // solde avant vente + (0.1 * 43000) - frais (0.1% de 4300 = 4.3)
    expect(result.balance).toBeCloseTo(portfolio.balance + 4_300 - 4.3, 2)
  })

  it('supprime la position après vente totale', () => {
    const result = executeSell(portfolio, { symbol: 'BTCUSDT', side: 'SELL', quantity: 0.1, price: 43_000 })
    expect(result.positions).toHaveLength(0)
  })

  it('réduit la quantité après vente partielle', () => {
    const result = executeSell(portfolio, { symbol: 'BTCUSDT', side: 'SELL', quantity: 0.05, price: 43_000 })
    expect(result.positions[0].quantity).toBeCloseTo(0.05, 5)
  })

  it('rejette la vente si la position n\'existe pas', () => {
    expect(() =>
      executeSell(portfolio, { symbol: 'ETHUSDT', side: 'SELL', quantity: 1, price: 3_000 })
    ).toThrow('Position introuvable')
  })

  it('rejette la vente si la quantité dépasse la position', () => {
    expect(() =>
      executeSell(portfolio, { symbol: 'BTCUSDT', side: 'SELL', quantity: 0.5, price: 43_000 })
    ).toThrow('Quantité insuffisante')
  })
})
