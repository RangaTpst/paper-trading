import type { Trade, Position } from '../api/types'

type FrequencyPeriod = 'day' | 'week' | 'month'

export function calcPnL(trades: Trade[]): number {
  const sells = trades.filter(t => t.side === 'SELL')
  const buys = trades.filter(t => t.side === 'BUY')
  if (sells.length === 0 || buys.length === 0) return 0

  const totalSellReceived = sells.reduce((sum, t) => sum + t.quantity * t.price - t.fees, 0)
  const totalBuyCost = buys.reduce((sum, t) => sum + t.quantity * t.price + t.fees, 0)

  return totalSellReceived - totalBuyCost
}

export function calcRoi(pnl: number, invested: number): number {
  if (invested === 0) return 0
  return (pnl / invested) * 100
}

export function calcTradingFrequency(trades: Trade[], period: FrequencyPeriod): number {
  if (trades.length < 2) return 0

  const getPeriodKey = (date: Date): string => {
    if (period === 'day') return date.toISOString().slice(0, 10)
    if (period === 'week') {
      const d = new Date(date)
      d.setDate(d.getDate() - d.getDay())
      return d.toISOString().slice(0, 10)
    }
    return `${date.getFullYear()}-${date.getMonth()}`
  }

  const distinctPeriods = new Set(trades.map(t => getPeriodKey(t.timestamp))).size
  return trades.length / distinctPeriods
}

export function calcTotalFees(trades: Trade[]): number {
  return trades.reduce((sum, t) => sum + t.fees, 0)
}

export function calcPortfolioValue(balance: number, positions: Position[]): number {
  const positionsValue = positions.reduce((sum, p) => sum + p.quantity * p.currentPrice, 0)
  return balance + positionsValue
}

export function calcUnrealizedPnL(positions: Position[]): number {
  return positions.reduce((sum, p) => sum + (p.currentPrice - p.avgBuyPrice) * p.quantity, 0)
}

export function calcTotalInvested(trades: Trade[]): number {
  return trades.filter(t => t.side === 'BUY').reduce((sum, t) => sum + t.quantity * t.price, 0)
}
