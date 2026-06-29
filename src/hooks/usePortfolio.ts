import { useReducer, useEffect } from 'react'
import type { Portfolio, OrderRequest } from '../api/types'
import { createPortfolio, executeBuy, executeSell } from '../core/portfolio'

type Action =
  | { type: 'BUY'; order: OrderRequest }
  | { type: 'SELL'; order: OrderRequest }
  | { type: 'UPDATE_PRICE'; symbol: string; price: number }

function reducer(state: Portfolio, action: Action): Portfolio {
  switch (action.type) {
    case 'BUY':
      return executeBuy(state, action.order)
    case 'SELL':
      return executeSell(state, action.order)
    case 'UPDATE_PRICE':
      return {
        ...state,
        positions: state.positions.map(p =>
          p.symbol === action.symbol ? { ...p, currentPrice: action.price } : p
        ),
      }
    default:
      return state
  }
}

export const REAL_PORTFOLIO_KEY = 'paper-trading-portfolio'
export const FUN_PORTFOLIO_KEY = 'paper-trading-portfolio-fun'

function loadPortfolio(storageKey: string): Portfolio {
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved) return JSON.parse(saved, (key, val) =>
      key === 'timestamp' ? new Date(val) : val
    )
  } catch {
    console.warn('localStorage indisponible, portefeuille réinitialisé')
  }
  return createPortfolio(10_000)
}

function savePortfolio(storageKey: string, p: Portfolio): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(p))
  } catch {
    console.warn('Impossible de sauvegarder le portefeuille')
  }
}

// storageKey distinct = portefeuille distinct (ex: réel vs mode fun) — jamais mélangés
export function usePortfolio(storageKey: string = REAL_PORTFOLIO_KEY) {
  const [portfolio, dispatch] = useReducer(reducer, storageKey, loadPortfolio)

  // Sauvegarde après que React ait bien appliqué le nouvel état (pas juste après dispatch,
  // qui est asynchrone et sauvegarderait l'état précédent).
  useEffect(() => {
    savePortfolio(storageKey, portfolio)
  }, [storageKey, portfolio])

  const buy = (order: OrderRequest) => dispatch({ type: 'BUY', order })
  const sell = (order: OrderRequest) => dispatch({ type: 'SELL', order })
  const updatePrice = (symbol: string, price: number) => dispatch({ type: 'UPDATE_PRICE', symbol, price })

  return { portfolio, buy, sell, updatePrice }
}
