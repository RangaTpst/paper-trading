import { useState } from 'react'
import { usePortfolio } from './hooks/usePortfolio'
import { useBinancePrices } from './hooks/useBinancePrice'
import { BalanceCard } from './components/BalanceCard'
import { PairSelector } from './components/PairSelector'
import { PriceChart } from './components/PriceChart'
import { OrderForm } from './components/OrderForm'
import { PositionsList } from './components/PositionsList'
import { TradeHistory } from './components/TradeHistory'
import './App.css'

export default function App() {
  const [selectedPair, setSelectedPair] = useState('BTCUSDT')
  const { portfolio, buy, sell } = usePortfolio()
  const { prices, loading, error, pairs } = useBinancePrices()

  const currentPrice = prices[selectedPair] ?? 0

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', color: '#e0e0e0', fontFamily: 'monospace' }}>
      <header style={{ borderBottom: '1px solid #222', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#00c896' }}>Paper Trading</span>
        <span style={{ fontSize: '0.8rem', color: '#555' }}>Simulation · Binance Market Data</span>
        {loading && <span style={{ fontSize: '0.8rem', color: '#888' }}>Chargement des prix...</span>}
        {error && <span style={{ fontSize: '0.8rem', color: '#ff4d4d' }}>{error}</span>}
      </header>

      <main style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <BalanceCard portfolio={portfolio} />

        <PairSelector
          pairs={pairs}
          selected={selectedPair}
          prices={prices}
          onSelect={setSelectedPair}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <PriceChart symbol={selectedPair} />
          <OrderForm
            symbol={selectedPair}
            currentPrice={currentPrice}
            onBuy={buy}
            onSell={sell}
          />
        </div>

        <PositionsList positions={portfolio.positions} />
        <TradeHistory trades={portfolio.tradeHistory} />
      </main>
    </div>
  )
}
