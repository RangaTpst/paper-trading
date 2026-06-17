import { Portfolio, OrderRequest, Trade, Position } from '../api/types'
import { calculateFees, FeeMode } from './fees'

export function createPortfolio(initialBalance: number): Portfolio {
  return { balance: initialBalance, positions: [], tradeHistory: [] }
}

export function executeBuy(portfolio: Portfolio, order: OrderRequest): Portfolio {
  const total = order.quantity * order.price
  const fees = calculateFees(total, FeeMode.STANDARD)
  const cost = total + fees

  if (cost > portfolio.balance) throw new Error('Solde insuffisant')

  const trade: Trade = {
    id: crypto.randomUUID(),
    symbol: order.symbol,
    side: 'BUY',
    quantity: order.quantity,
    price: order.price,
    fees,
    total: cost,
    timestamp: new Date(),
  }

  const positions = updatePosition(portfolio.positions, order.symbol, order.quantity, order.price)

  return {
    balance: portfolio.balance - cost,
    positions,
    tradeHistory: [...portfolio.tradeHistory, trade],
  }
}

export function executeSell(portfolio: Portfolio, order: OrderRequest): Portfolio {
  const position = portfolio.positions.find(p => p.symbol === order.symbol)
  if (!position) throw new Error('Position introuvable')
  if (order.quantity > position.quantity) throw new Error('Quantité insuffisante')

  const total = order.quantity * order.price
  const fees = calculateFees(total, FeeMode.STANDARD)
  const received = total - fees

  const trade: Trade = {
    id: crypto.randomUUID(),
    symbol: order.symbol,
    side: 'SELL',
    quantity: order.quantity,
    price: order.price,
    fees,
    total: received,
    timestamp: new Date(),
  }

  const newQty = position.quantity - order.quantity
  const positions = newQty === 0
    ? portfolio.positions.filter(p => p.symbol !== order.symbol)
    : portfolio.positions.map(p =>
        p.symbol === order.symbol ? { ...p, quantity: newQty } : p
      )

  return {
    balance: portfolio.balance + received,
    positions,
    tradeHistory: [...portfolio.tradeHistory, trade],
  }
}

function updatePosition(positions: Position[], symbol: string, quantity: number, price: number): Position[] {
  const existing = positions.find(p => p.symbol === symbol)
  if (!existing) {
    return [...positions, { symbol, quantity, avgBuyPrice: price, currentPrice: price }]
  }
  const totalQty = existing.quantity + quantity
  const avgPrice = (existing.avgBuyPrice * existing.quantity + price * quantity) / totalQty
  return positions.map(p =>
    p.symbol === symbol ? { ...p, quantity: totalQty, avgBuyPrice: avgPrice } : p
  )
}
