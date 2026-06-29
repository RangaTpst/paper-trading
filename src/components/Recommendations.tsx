import { detectSignal, SHORT_PERIOD, LONG_PERIOD } from '../core/strategy'
import type { Signal } from '../core/strategy'
import type { ParsedKline } from '../api/binance/parser'
import { getDisplayName, getPropagandaLine, FUN_SIGNAL_LABEL } from '../theme/helldivers'

interface Props {
  readonly pairs: string[]
  readonly klinesMap: Record<string, ParsedKline[]>
  readonly funMode?: boolean
}

const SIGNAL_LABEL: Record<Signal, string> = {
  BUY: 'Achat conseillé',
  SELL: 'Vente conseillée',
  HOLD: 'Ne rien faire',
}

const SIGNAL_COLOR: Record<Signal, string> = {
  BUY: '#00c896',
  SELL: '#ff4d4d',
  HOLD: '#888',
}

const FUN_SIGNAL_COLOR: Record<Signal, string> = {
  BUY: '#ffcc00',
  SELL: '#ff4d4d',
  HOLD: '#888',
}

export function Recommendations({ pairs, klinesMap, funMode = false }: Props) {
  const labels = funMode ? FUN_SIGNAL_LABEL : SIGNAL_LABEL
  const colors = funMode ? FUN_SIGNAL_COLOR : SIGNAL_COLOR

  return (
    <div className="card" data-testid="recommendations">
      <span className="card-label">
        {funMode ? 'ORDRES STRATÉGIQUES — IA DE SUPER TERRE' : 'Recommandations (croisement de moyennes mobiles)'}
      </span>
      {funMode && (
        <p style={{ fontSize: '0.7rem', color: '#ffcc00', margin: '0.3rem 0 0.6rem', letterSpacing: '0.03em' }}>
          {getPropagandaLine()}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
        {pairs.map(pair => {
          const closes = (klinesMap[pair] ?? []).map(k => k.close)
          const signal = detectSignal(closes, SHORT_PERIOD, LONG_PERIOD)
          return (
            <div
              key={pair}
              data-testid={`recommendation-${pair}`}
              style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}
            >
              <span>{getDisplayName(pair, funMode)}</span>
              <span style={{ color: colors[signal], fontWeight: 600 }}>{labels[signal]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
