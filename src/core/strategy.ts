export type Signal = 'BUY' | 'SELL' | 'HOLD'

export const SHORT_PERIOD = 5
export const LONG_PERIOD = 20

export function calcSMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null
  const slice = prices.slice(-period)
  return slice.reduce((sum, p) => sum + p, 0) / period
}

export function detectSignal(prices: number[], shortPeriod: number, longPeriod: number): Signal {
  if (prices.length < longPeriod + 1) return 'HOLD'

  const previousPrices = prices.slice(0, -1)
  const shortNow = calcSMA(prices, shortPeriod)
  const longNow = calcSMA(prices, longPeriod)
  const shortPrev = calcSMA(previousPrices, shortPeriod)
  const longPrev = calcSMA(previousPrices, longPeriod)

  if (shortNow === null || longNow === null || shortPrev === null || longPrev === null) {
    return 'HOLD'
  }

  if (shortPrev <= longPrev && shortNow > longNow) return 'BUY'
  if (shortPrev >= longPrev && shortNow < longNow) return 'SELL'
  return 'HOLD'
}

export function shouldTrade(signal: Signal, hasPosition: boolean): 'BUY' | 'SELL' | null {
  if (signal === 'BUY' && !hasPosition) return 'BUY'
  if (signal === 'SELL' && hasPosition) return 'SELL'
  return null
}

// Sécurité : vend une position dès qu'elle perd plus de stopLossPercent par rapport à son prix d'achat,
// indépendamment du signal de croisement (qui peut réagir trop tard sur une chute brutale).
export function shouldStopLoss(avgBuyPrice: number, currentPrice: number, stopLossPercent: number): boolean {
  return currentPrice <= avgBuyPrice * (1 - stopLossPercent)
}

// Sécurité : investit un % fixe du solde disponible plutôt qu'une quantité fixe arbitraire,
// pour que la taille du trade s'adapte au capital réellement disponible.
export function calcPositionSize(balance: number, price: number, riskPercent: number): number {
  if (price <= 0 || balance <= 0) return 0
  return (balance * riskPercent) / price
}
