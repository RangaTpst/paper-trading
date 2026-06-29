import { describe, it, expect } from 'vitest'
import { calcSMA, detectSignal, shouldTrade, shouldStopLoss, calcPositionSize } from '../../core/strategy'

// T07 — Stratégie automatique : croisement de moyennes mobiles (courte vs longue)
describe('calcSMA (moyenne mobile simple)', () => {
  it('Given [10, 20, 30] période 3, When calcSMA, Then moyenne = 20', () => {
    expect(calcSMA([10, 20, 30], 3)).toBe(20)
  })

  it('Given moins de prix que la période, When calcSMA, Then null (pas assez de données)', () => {
    expect(calcSMA([10, 20], 3)).toBeNull()
  })
})

describe('detectSignal (croisement de moyennes mobiles)', () => {
  it('Given la moyenne courte qui dépasse la moyenne longue, When detectSignal, Then BUY (golden cross)', () => {
    const prices = [10, 10, 10, 10, 20]
    expect(detectSignal(prices, 2, 4)).toBe('BUY')
  })

  it('Given la moyenne courte qui chute sous la moyenne longue, When detectSignal, Then SELL (death cross)', () => {
    const prices = [10, 10, 10, 10, 0]
    expect(detectSignal(prices, 2, 4)).toBe('SELL')
  })

  it('Given des prix stables (pas de croisement), When detectSignal, Then HOLD', () => {
    const prices = [10, 10, 10, 10, 10]
    expect(detectSignal(prices, 2, 4)).toBe('HOLD')
  })

  it('Given pas assez d\'historique de prix, When detectSignal, Then HOLD', () => {
    expect(detectSignal([10, 10], 2, 4)).toBe('HOLD')
  })
})

describe('shouldTrade (décide si on déclenche un ordre auto)', () => {
  it('Given signal BUY et aucune position ouverte, When shouldTrade, Then BUY', () => {
    expect(shouldTrade('BUY', false)).toBe('BUY')
  })

  it('Given signal BUY mais position déjà ouverte, When shouldTrade, Then null (pas de double achat)', () => {
    expect(shouldTrade('BUY', true)).toBeNull()
  })

  it('Given signal SELL et position ouverte, When shouldTrade, Then SELL', () => {
    expect(shouldTrade('SELL', true)).toBe('SELL')
  })

  it('Given signal SELL mais aucune position, When shouldTrade, Then null (rien à vendre)', () => {
    expect(shouldTrade('SELL', false)).toBeNull()
  })

  it('Given signal HOLD, When shouldTrade, Then null', () => {
    expect(shouldTrade('HOLD', false)).toBeNull()
  })
})

describe('shouldStopLoss (vente forcée si grosse perte)', () => {
  it('Given prix tombé exactement à -5% du prix d\'achat, When shouldStopLoss(0.05), Then true', () => {
    expect(shouldStopLoss(40_000, 38_000, 0.05)).toBe(true)
  })

  it('Given prix tombé de seulement -2.5%, When shouldStopLoss(0.05), Then false', () => {
    expect(shouldStopLoss(40_000, 39_000, 0.05)).toBe(false)
  })

  it('Given prix en hausse, When shouldStopLoss, Then false', () => {
    expect(shouldStopLoss(40_000, 41_000, 0.05)).toBe(false)
  })
})

describe('calcPositionSize (taille de position selon le solde disponible)', () => {
  it('Given solde 10 000 et risque 5%, When calcPositionSize à 40 000 USDT, Then quantité = 0.0125', () => {
    // On investit 5% de 10 000 = 500 USDT, au prix de 40 000 → 500/40000 = 0.0125
    expect(calcPositionSize(10_000, 40_000, 0.05)).toBeCloseTo(0.0125, 6)
  })

  it('Given un prix de 0, When calcPositionSize, Then 0 (évite la division par zéro)', () => {
    expect(calcPositionSize(10_000, 0, 0.05)).toBe(0)
  })

  it('Given un solde de 0, When calcPositionSize, Then 0', () => {
    expect(calcPositionSize(0, 40_000, 0.05)).toBe(0)
  })
})
