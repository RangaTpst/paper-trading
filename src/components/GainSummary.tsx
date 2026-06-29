import type { Portfolio } from '../api/types'
import { calcPnL, calcUnrealizedPnL, calcTotalInvested, calcRoi } from '../core/stats'

interface Props {
  readonly portfolio: Portfolio
  readonly funMode?: boolean
}

export function GainSummary({ portfolio, funMode = false }: Props) {
  const realizedPnL = calcPnL(portfolio.tradeHistory)
  const unrealizedPnL = calcUnrealizedPnL(portfolio.positions)
  const totalEstimatedPnL = realizedPnL + unrealizedPnL
  const invested = calcTotalInvested(portfolio.tradeHistory)
  const roi = calcRoi(totalEstimatedPnL, invested)
  const isPositive = totalEstimatedPnL >= 0
  const color = isPositive ? (funMode ? '#ffcc00' : '#00c896') : '#ff4d4d'

  return (
    <div className="card" data-testid="gain-summary">
      <span className="card-label">
        {funMode ? 'BILAN DE LA CAMPAGNE' : 'Estimation gain / perte'}
      </span>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.85rem' }}>
        <span>{funMode ? 'GAIN ESTIMÉ (réalisé + en cours)' : 'Gain/perte total estimé'}</span>
        <span data-testid="estimated-gain" style={{ color, fontWeight: 600 }}>
          {isPositive ? '+' : ''}{totalEstimatedPnL.toFixed(2)} USDT
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', fontSize: '0.85rem' }}>
        <span>% de gain total</span>
        <span data-testid="gain-percent" style={{ color, fontWeight: 600 }}>
          {isPositive ? '+' : ''}{roi.toFixed(2)} %
        </span>
      </div>
    </div>
  )
}
