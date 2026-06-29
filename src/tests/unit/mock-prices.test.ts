import { describe, it, expect, vi, afterEach } from 'vitest'
import { nextMockPrice } from '../../core/mockPrices'

// T08 — Mode "fun" : générateur de prix simulés et volatils (mode démo)
describe('nextMockPrice', () => {
  afterEach(() => vi.restoreAllMocks())

  it('Given hasard au maximum, When nextMockPrice(100, 0.05), Then prix monte de 5%', () => {
    vi.spyOn(Math, 'random').mockReturnValue(1)
    expect(nextMockPrice(100, 0.05)).toBeCloseTo(105, 5)
  })

  it('Given hasard au minimum, When nextMockPrice(100, 0.05), Then prix baisse de 5%', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(nextMockPrice(100, 0.05)).toBeCloseTo(95, 5)
  })

  it('Given hasard au milieu, When nextMockPrice, Then le prix ne change pas', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    expect(nextMockPrice(100, 0.05)).toBeCloseTo(100, 5)
  })

  it('Given un prix très bas, When forte baisse simulée, Then le prix reste positif', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(nextMockPrice(0.001, 0.9)).toBeGreaterThan(0)
  })
})
