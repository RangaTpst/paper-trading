import { getDisplayName } from '../theme/helldivers'

interface Props {
  readonly pairs: string[]
  readonly selected: string
  readonly prices: Record<string, number>
  readonly onSelect: (pair: string) => void
  readonly funMode?: boolean
}

export function PairSelector({ pairs, selected, prices, onSelect, funMode = false }: Props) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {pairs.map(pair => (
        <button
          key={pair}
          data-testid={`pair-${pair}`}
          onClick={() => onSelect(pair)}
          className={`pair-btn ${selected === pair ? 'pair-btn--active' : ''}`}
        >
          <span className="pair-name">{getDisplayName(pair, funMode)}</span>
          {prices[pair] && (
            <span className="pair-price">{prices[pair].toLocaleString()} USDT</span>
          )}
        </button>
      ))}
    </div>
  )
}
