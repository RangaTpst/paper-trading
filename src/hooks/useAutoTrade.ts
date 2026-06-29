import { useEffect, useRef } from 'react'
import {
  detectSignal,
  shouldTrade,
  shouldStopLoss,
  calcPositionSize,
  SHORT_PERIOD,
  LONG_PERIOD,
} from '../core/strategy'
import type { ParsedKline } from '../api/binance/parser'
import type { OrderRequest, Position } from '../api/types'

const STOP_LOSS_PERCENT = 0.05 // vend si une position perd plus de 5% par rapport à son prix d'achat
const RISK_PER_TRADE = 0.05 // n'investit que 5% du solde disponible par achat auto

interface Params {
  readonly enabled: boolean
  readonly pairs: string[]
  readonly klinesMap: Record<string, ParsedKline[]>
  readonly prices: Record<string, number>
  readonly balance: number
  readonly positions: Position[]
  readonly onBuy: (order: OrderRequest) => void
  readonly onSell: (order: OrderRequest) => void
}

function decideOrder(
  symbol: string,
  klines: ParsedKline[],
  currentPrice: number,
  balance: number,
  position: Position | undefined
): OrderRequest | null {
  if (klines.length === 0 || currentPrice <= 0) return null

  // Sécurité avant tout : le stop-loss prime sur le signal de croisement,
  // qui peut réagir trop lentement face à une chute brutale du prix.
  if (position && shouldStopLoss(position.avgBuyPrice, currentPrice, STOP_LOSS_PERCENT)) {
    return { symbol, side: 'SELL', quantity: position.quantity, price: currentPrice }
  }

  // Les bougies historiques sont figées entre deux rechargements ; on ajoute le prix
  // live comme dernier point pour que la stratégie réagisse en continu, pas une seule fois.
  const closes = [...klines.map(k => k.close), currentPrice]
  const signal = detectSignal(closes, SHORT_PERIOD, LONG_PERIOD)
  const action = shouldTrade(signal, position !== undefined)
  if (!action) return null

  if (action === 'SELL') {
    return { symbol, side: 'SELL', quantity: position?.quantity ?? 0, price: currentPrice }
  }

  const quantity = calcPositionSize(balance, currentPrice, RISK_PER_TRADE)
  if (quantity <= 0) return null
  return { symbol, side: 'BUY', quantity, price: currentPrice }
}

export function useAutoTrade({ enabled, pairs, klinesMap, prices, balance, positions, onBuy, onSell }: Params) {
  const lastPriceSeenRef = useRef<Record<string, number | null>>({})

  useEffect(() => {
    if (!enabled) return

    for (const symbol of pairs) {
      const klines = klinesMap[symbol] ?? []
      const currentPrice = prices[symbol] ?? 0
      if (klines.length === 0 || currentPrice <= 0) continue
      if (lastPriceSeenRef.current[symbol] === currentPrice) continue // prix déjà traité
      lastPriceSeenRef.current[symbol] = currentPrice

      const position = positions.find(p => p.symbol === symbol)
      const order = decideOrder(symbol, klines, currentPrice, balance, position)
      if (!order) continue

      try {
        if (order.side === 'BUY') onBuy(order)
        else onSell(order)
      } catch {
        // ordre auto refusé (ex: solde insuffisant) — on continue avec les autres paires
      }
    }
  }, [enabled, pairs, klinesMap, prices, balance, positions, onBuy, onSell])
}
