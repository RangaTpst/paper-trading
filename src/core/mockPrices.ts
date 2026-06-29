const MIN_PRICE = 0.0001

// Marche aléatoire : variation entre -volatility et +volatility autour du prix actuel
export function nextMockPrice(currentPrice: number, volatility: number): number {
  const change = (Math.random() * 2 - 1) * volatility
  return Math.max(currentPrice * (1 + change), MIN_PRICE)
}
