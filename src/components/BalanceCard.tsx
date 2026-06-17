import type { Portfolio } from '../api/types'
import { calcPnL, calcTotalFees, calcPortfolioValue } from '../core/stats'

interface Props {
  readonly portfolio: Portfolio
}

export function BalanceCard({ portfolio }: Props) {
  const pnl = calcPnL(portfolio.tradeHistory)
  const totalFees = calcTotalFees(portfolio.tradeHistory)
  const portfolioValue = calcPortfolioValue(portfolio.balance, portfolio.positions)
  const isPositive = pnl >= 0

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
      <div className="card">
        <span className="card-label">Solde disponible</span>
        <span className="card-value" data-testid="balance">
          {portfolio.balance.toFixed(2)} USDT
        </span>
      </div>

      <div className="card">
        <span className="card-label">Valeur du portefeuille</span>
        <span className="card-value" data-testid="portfolio-value">
          {portfolioValue.toFixed(2)} USDT
        </span>
      </div>

      <div className="card">
        <span className="card-label">P&L total</span>
        <span
          className="card-value"
          data-testid="pnl"
          style={{ color: isPositive ? '#00c896' : '#ff4d4d' }}
        >
          {isPositive ? '+' : ''}{pnl.toFixed(2)} USDT
        </span>
      </div>

      <div className="card">
        <span className="card-label">Frais cumulés</span>
        <span className="card-value" data-testid="total-fees">
          {totalFees.toFixed(2)} USDT
        </span>
      </div>
    </div>
  )
}
