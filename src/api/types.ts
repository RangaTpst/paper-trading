// Types internes normalisés de l'application

export type TradeSide = 'BUY' | 'SELL'

export interface CryptoPrice {
  symbol: string
  price: number
}

export interface Trade {
  id: string
  symbol: string
  side: TradeSide
  quantity: number
  price: number
  fees: number
  total: number
  timestamp: Date
}

export interface Position {
  symbol: string
  quantity: number
  avgBuyPrice: number
  currentPrice: number
}

export interface Portfolio {
  balance: number
  positions: Position[]
  tradeHistory: Trade[]
}

export interface OrderRequest {
  symbol: string
  side: TradeSide
  quantity: number
  price: number
}
