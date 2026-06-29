import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getDisplayName } from '../theme/helldivers'
import type { ParsedKline } from '../api/binance/parser'

interface Props {
  readonly symbol: string
  readonly klines: ParsedKline[]
  readonly active?: boolean
  readonly funMode?: boolean
}

export function PriceChart({ symbol, klines, active = false, funMode = false }: Props) {
  const accentColor = funMode ? '#ffcc00' : '#00c896'
  // time = timestamp brut (toujours unique), formaté seulement à l'affichage.
  // Avec un label "HH:mm" comme clé d'axe, les 48 points (sur 2 jours) ne donnent
  // que 24 valeurs distinctes, ce qui fait boucler l'axe X au milieu du graphe.
  const data = klines.map(k => ({
    time: k.openTime,
    close: k.close,
    high: k.high,
    low: k.low,
  }))

  const formatTime = (t: number) =>
    new Date(t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      className="card"
      data-testid={`price-chart-${symbol}`}
      style={active ? { borderColor: accentColor } : undefined}
    >
      <span className="card-label">
        {funMode ? 'SECTEUR' : 'Prix'} {getDisplayName(symbol, funMode)} — 48h
      </span>
      {data.length === 0 ? (
        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
          Chargement...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis
              dataKey="time"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatTime}
              tick={{ fontSize: 11, fill: '#888' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: '#888' }}
              tickFormatter={v => v.toLocaleString()}
            />
            <Tooltip
              labelFormatter={formatTime}
              formatter={(v) => [`${Number(v).toLocaleString()} USDT`, 'Prix']}
              contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
            />
            <Line type="monotone" dataKey="close" stroke={accentColor} dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
