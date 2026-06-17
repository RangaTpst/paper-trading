import { describe, it, expect } from 'vitest'
import { calculateFees, FeeMode } from '../../core/fees'

// T06 — Vérification des frais
describe('Frais de trading', () => {
  it('Given 1000 USDT, When frais standard (0.1%), Then frais = 1 USDT', () => {
    const frais = calculateFees(1000, FeeMode.STANDARD)
    expect(frais).toBe(1)
  })

  it('Given 1000 USDT, When frais BNB (0.075%), Then frais = 0.75 USDT', () => {
    const frais = calculateFees(1000, FeeMode.BNB)
    expect(frais).toBe(0.75)
  })

  it('Given montant négatif, When calcul frais, Then erreur levée', () => {
    expect(() => calculateFees(-100, FeeMode.STANDARD)).toThrow()
  })
})
