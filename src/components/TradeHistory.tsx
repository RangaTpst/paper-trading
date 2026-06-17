import { Trade } from '../api/types'

interface Props {
  trades: Trade[]
}

export function TradeHistory({ trades }: Props) {
  const sorted = [...trades].reverse()

  return (
    <div className="card">
      <span className="card-label">Historique des trades</span>
      {trades.length === 0 ? (
        <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Aucun trade pour le moment.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table data-testid="trade-history" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', fontSize: '0.8rem', color: '#888' }}>
                <th style={{ textAlign: 'left', padding: '0.4rem' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '0.4rem' }}>Paire</th>
                <th style={{ textAlign: 'left', padding: '0.4rem' }}>Côté</th>
                <th style={{ textAlign: 'right', padding: '0.4rem' }}>Quantité</th>
                <th style={{ textAlign: 'right', padding: '0.4rem' }}>Prix (USDT)</th>
                <th style={{ textAlign: 'right', padding: '0.4rem' }}>Frais (USDT)</th>
                <th style={{ textAlign: 'right', padding: '0.4rem' }}>Total (USDT)</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(trade => (
                <tr key={trade.id} style={{ borderBottom: '1px solid #1f1f1f', fontSize: '0.85rem' }}>
                  <td style={{ padding: '0.4rem', color: '#888' }}>
                    {trade.timestamp.toLocaleString('fr-FR')}
                  </td>
                  <td style={{ padding: '0.4rem' }}>{trade.symbol}</td>
                  <td style={{ padding: '0.4rem', color: trade.side === 'BUY' ? '#00c896' : '#ff4d4d', fontWeight: 600 }}>
                    {trade.side}
                  </td>
                  <td style={{ padding: '0.4rem', textAlign: 'right' }}>{trade.quantity}</td>
                  <td style={{ padding: '0.4rem', textAlign: 'right' }}>{trade.price.toLocaleString()}</td>
                  <td style={{ padding: '0.4rem', textAlign: 'right', color: '#ff9800' }}>{trade.fees.toFixed(4)}</td>
                  <td style={{ padding: '0.4rem', textAlign: 'right' }}>{trade.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
