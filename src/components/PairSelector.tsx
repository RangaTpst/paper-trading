interface Props {
  pairs: string[]
  selected: string
  prices: Record<string, number>
  onSelect: (pair: string) => void
}

export function PairSelector({ pairs, selected, prices, onSelect }: Props) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {pairs.map(pair => (
        <button
          key={pair}
          data-testid={`pair-${pair}`}
          onClick={() => onSelect(pair)}
          className={`pair-btn ${selected === pair ? 'pair-btn--active' : ''}`}
        >
          <span className="pair-name">{pair.replace('USDT', '/USDT')}</span>
          {prices[pair] && (
            <span className="pair-price">{prices[pair].toLocaleString()} USDT</span>
          )}
        </button>
      ))}
    </div>
  )
}
