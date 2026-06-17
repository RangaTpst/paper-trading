// Types bruts reçus depuis l'API Binance
// Attention : Binance retourne les nombres sous forme de string

export interface BinanceTicker {
  symbol: string
  price: string
}

export interface BinanceKline {
  openTime: number
  open: string
  high: string
  low: string
  close: string
  volume: string
  closeTime: number
}

export interface Binance24hrStats {
  symbol: string
  priceChange: string
  priceChangePercent: string
  lastPrice: string
  volume: string
  highPrice: string
  lowPrice: string
}
