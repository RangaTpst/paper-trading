import { describe, it, expect } from 'vitest'
import { calculateFees, FeeMode } from '../../core/fees'

describe('calculateFees', () => {
  describe('taux standard (0.1%)', () => {
    it('calcule les frais sur un ordre de 1000 USDT', () => {
      const fees = calculateFees(1000, FeeMode.STANDARD)
      expect(fees).toBe(1)
    })

    it('calcule les frais sur un ordre de 500 USDT', () => {
      const fees = calculateFees(500, FeeMode.STANDARD)
      expect(fees).toBe(0.5)
    })

    it('calcule les frais sur un grand ordre', () => {
      const fees = calculateFees(43000, FeeMode.STANDARD)
      expect(fees).toBeCloseTo(43, 2)
    })
  })

  describe('taux réduit BNB (0.075%)', () => {
    it('applique une réduction de 25% avec paiement en BNB', () => {
      const fees = calculateFees(1000, FeeMode.BNB)
      expect(fees).toBe(0.75)
    })
  })

  describe('cas limites', () => {
    it('retourne 0 pour un montant de 0', () => {
      const fees = calculateFees(0, FeeMode.STANDARD)
      expect(fees).toBe(0)
    })

    it('lance une erreur si le montant est négatif', () => {
      expect(() => calculateFees(-100, FeeMode.STANDARD)).toThrow()
    })
  })
})
