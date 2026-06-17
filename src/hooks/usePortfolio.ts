import { useReducer } from 'react'
import { Portfolio, OrderRequest } from '../api/types'
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

const STORAGE_KEY = 'paper-trading-portfolio'

function loadPortfolio(): Portfolio {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved, (key, val) =>
      key === 'timestamp' ? new Date(val) : val
    )
  } catch {}
  return createPortfolio(10_000)
}

export function usePortfolio() {
  const [portfolio, dispatch] = useReducer(reducer, undefined, loadPortfolio)

  const save = (p: Portfolio) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)) } catch {}
  }

  const buy = (order: OrderRequest) => {
    dispatch({ type: 'BUY', order })
    save(portfolio)
  }

  const sell = (order: OrderRequest) => {
    dispatch({ type: 'SELL', order })
    save(portfolio)
  }

  const updatePrice = (symbol: string, price: number) => {
    dispatch({ type: 'UPDATE_PRICE', symbol, price })
  }

  return { portfolio, buy, sell, updatePrice }
}
