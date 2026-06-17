import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useKlines } from '../hooks/useBinancePrice'

interface Props {
  symbol: string
}

export function PriceChart({ symbol }: Props) {
  const klines = useKlines(symbol)

  const data = klines.map(k => ({
    time: new Date(k.openTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    close: k.close,
    high: k.high,
    low: k.low,
  }))

  return (
    <div className="card" data-testid="price-chart">
      <span className="card-label">Prix {symbol.replace('USDT', '/USDT')} — 48h</span>
      {data.length === 0 ? (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
          Chargement...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#888' }} interval="preserveStartEnd" />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: '#888' }}
              tickFormatter={v => v.toLocaleString()}
            />
            <Tooltip
              formatter={(v) => [`${Number(v).toLocaleString()} USDT`, 'Prix']}
              contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
            />
            <Line type="monotone" dataKey="close" stroke="#00c896" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
