import { useState } from 'react'
import { usePortfolio, REAL_PORTFOLIO_KEY, FUN_PORTFOLIO_KEY } from './hooks/usePortfolio'
import { useBinancePrices, useAllKlines, PAIRS } from './hooks/useBinancePrice'
import { useAutoTrade } from './hooks/useAutoTrade'
import { useFunModePrices } from './hooks/useFunModePrices'
import { usePersistedToggle } from './hooks/usePersistedToggle'
import { BalanceCard } from './components/BalanceCard'
import { PairSelector } from './components/PairSelector'
import { PriceChart } from './components/PriceChart'
import { OrderForm } from './components/OrderForm'
import { PositionsList } from './components/PositionsList'
import { TradeHistory } from './components/TradeHistory'
import { Recommendations } from './components/Recommendations'
import { GainSummary } from './components/GainSummary'
import './App.css'

export default function App() {
  const [selectedPair, setSelectedPair] = useState('BTCUSDT')
  const [autoTradeEnabled, setAutoTradeEnabled] = usePersistedToggle('paper-trading-auto-trade', false)
  const [funMode, setFunMode] = usePersistedToggle('paper-trading-fun-mode', false)
  const realPortfolio = usePortfolio(REAL_PORTFOLIO_KEY)
  const funPortfolio = usePortfolio(FUN_PORTFOLIO_KEY)
  const { portfolio, buy, sell } = funMode ? funPortfolio : realPortfolio
  const realData = useBinancePrices()
  const realKlinesMap = useAllKlines()
  const funData = useFunModePrices(funMode)

  const prices = funMode ? funData.prices : realData.prices
  const klinesMap = funMode ? funData.klinesMap : realKlinesMap
  const pairs = funMode ? PAIRS : realData.pairs
  const { loading, error } = realData

  const currentPrice = prices[selectedPair] ?? 0

  useAutoTrade({
    enabled: autoTradeEnabled,
    pairs,
    klinesMap,
    prices,
    balance: portfolio.balance,
    positions: portfolio.positions,
    onBuy: buy,
    onSell: sell,
  })

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', color: '#e0e0e0', fontFamily: 'monospace' }}>
      <header style={{ borderBottom: `1px solid ${funMode ? '#ffcc00' : '#222'}`, padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: funMode ? '#ffcc00' : '#00c896' }}>
          {funMode ? 'GESTION DES RESSOURCES — SUPER TERRE' : 'Paper Trading'}
        </span>
        <span style={{ fontSize: '0.8rem', color: '#555' }}>
          {funMode ? 'POUR LA DÉMOCRATIE ! (prix simulés, hyper volatils)' : 'Simulation · Binance Market Data'}
        </span>
        {loading && !funMode && <span style={{ fontSize: '0.8rem', color: '#888' }}>Chargement des prix...</span>}
        {error && !funMode && <span style={{ fontSize: '0.8rem', color: '#ff4d4d' }}>{error}</span>}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              data-testid="auto-trade-toggle"
              checked={autoTradeEnabled}
              onChange={e => setAutoTradeEnabled(e.target.checked)}
            />
            Trading automatique (toutes les paires)
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: funMode ? '#ffcc00' : undefined }}>
            <input
              type="checkbox"
              data-testid="fun-mode-toggle"
              checked={funMode}
              onChange={e => setFunMode(e.target.checked)}
            />
            MODE DÉMOCRATIE
          </label>
        </div>
      </header>

      <main style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <BalanceCard portfolio={portfolio} />

          <PairSelector
            pairs={pairs}
            selected={selectedPair}
            prices={prices}
            onSelect={setSelectedPair}
            funMode={funMode}
          />

          {pairs.map(pair => (
            <PriceChart
              key={pair}
              symbol={pair}
              klines={klinesMap[pair] ?? []}
              active={pair === selectedPair}
              funMode={funMode}
            />
          ))}

          <PositionsList positions={portfolio.positions} />
          <TradeHistory trades={portfolio.tradeHistory} />
        </div>

        <div style={{ position: 'sticky', top: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <OrderForm
            symbol={selectedPair}
            currentPrice={currentPrice}
            onBuy={buy}
            onSell={sell}
            funMode={funMode}
          />
          <Recommendations pairs={pairs} klinesMap={klinesMap} funMode={funMode} />
          <GainSummary portfolio={portfolio} funMode={funMode} />
        </div>
      </main>
    </div>
  )
}
