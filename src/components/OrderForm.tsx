import { useState } from 'react'
import { OrderRequest } from '../api/types'

interface Props {
  symbol: string
  currentPrice: number
  onBuy: (order: OrderRequest) => void
  onSell: (order: OrderRequest) => void
}

export function OrderForm({ symbol, currentPrice, onBuy, onSell }: Props) {
  const [quantity, setQuantity] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const total = parseFloat(quantity || '0') * currentPrice
  const fees = total * 0.001

  const handleOrder = (side: 'BUY' | 'SELL') => {
    setError(null)
    setSuccess(false)
    const qty = parseFloat(quantity)
    if (!qty || qty <= 0) { setError('Quantité invalide'); return }
    const order: OrderRequest = { symbol, side, quantity: qty, price: currentPrice }
    try {
      if (side === 'BUY') onBuy(order)
      else onSell(order)
      setSuccess(true)
      setQuantity('')
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="card">
      <span className="card-label">Passer un ordre — {symbol.replace('USDT', '/USDT')}</span>

      <div style={{ marginTop: '1rem' }}>
        <label style={{ fontSize: '0.85rem', color: '#888' }}>Quantité</label>
        <input
          data-testid="order-quantity"
          type="number"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          placeholder="ex : 0.001"
          min="0"
          step="0.001"
          className="input"
        />
      </div>

      <div style={{ fontSize: '0.8rem', color: '#888', margin: '0.5rem 0' }}>
        Prix actuel : <strong>{currentPrice.toLocaleString()} USDT</strong>
        {total > 0 && (
          <> · Total : <strong>{total.toFixed(2)} USDT</strong> · Frais : <strong>{fees.toFixed(4)} USDT</strong></>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button data-testid="order-buy" className="btn btn--buy" onClick={() => handleOrder('BUY')}>
          Acheter (BUY)
        </button>
        <button data-testid="order-sell" className="btn btn--sell" onClick={() => handleOrder('SELL')}>
          Vendre (SELL)
        </button>
      </div>

      {success && (
        <div data-testid="trade-success" className="alert alert--success">
          Ordre exécuté avec succès
        </div>
      )}
      {error && (
        <div data-testid="order-error" className="alert alert--error">
          {error}
        </div>
      )}
    </div>
  )
}
