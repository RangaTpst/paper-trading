import type { Position } from '../api/types'

interface Props {
  readonly positions: Position[]
}

export function PositionsList({ positions }: Props) {
  return (
    <div className="card">
      <span className="card-label">Positions ouvertes</span>
      {positions.length === 0 ? (
        <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '0.5rem' }}>Aucune position ouverte.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333', fontSize: '0.8rem', color: '#888' }}>
              <th style={{ textAlign: 'left', padding: '0.4rem' }}>Paire</th>
              <th style={{ textAlign: 'right', padding: '0.4rem' }}>Quantité</th>
              <th style={{ textAlign: 'right', padding: '0.4rem' }}>Prix moy. achat</th>
              <th style={{ textAlign: 'right', padding: '0.4rem' }}>Prix actuel</th>
              <th style={{ textAlign: 'right', padding: '0.4rem' }}>P&L</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(pos => {
              const pnl = (pos.currentPrice - pos.avgBuyPrice) * pos.quantity
              const isPos = pnl >= 0
              return (
                <tr key={pos.symbol} style={{ borderBottom: '1px solid #1f1f1f', fontSize: '0.85rem' }}>
                  <td style={{ padding: '0.4rem', fontWeight: 600 }}>{pos.symbol}</td>
                  <td style={{ padding: '0.4rem', textAlign: 'right' }}>{pos.quantity}</td>
                  <td style={{ padding: '0.4rem', textAlign: 'right' }}>{pos.avgBuyPrice.toLocaleString()}</td>
                  <td style={{ padding: '0.4rem', textAlign: 'right' }}>{pos.currentPrice.toLocaleString()}</td>
                  <td style={{ padding: '0.4rem', textAlign: 'right', color: isPos ? '#00c896' : '#ff4d4d' }}>
                    {isPos ? '+' : ''}{pnl.toFixed(2)} USDT
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
