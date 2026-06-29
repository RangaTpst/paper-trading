// Habillage du "mode fun" — purement cosmétique, ne touche à aucune logique de trading.

export const PAIR_CALLSIGNS: Record<string, string> = {
  BTCUSDT: 'BIOMASSE TERMINID',
  ETHUSDT: 'ALLIAGE AUTOMATON',
  BNBUSDT: 'CRÉDITS SUPER TERRE',
  SOLUSDT: 'NOYAU DE STRATAGÈME',
  XRPUSDT: 'JETON DÉMOCRATIE',
}

export function getDisplayName(symbol: string, funMode: boolean): string {
  if (funMode) return PAIR_CALLSIGNS[symbol] ?? symbol
  return symbol.replace('USDT', '/USDT')
}

export const PROPAGANDA_LINES = [
  'LA DÉMOCRATIE NE FAIT JAMAIS FAILLITE.',
  'CHAQUE TRADE EST UN ACTE DE LIBERTÉ.',
  "L'IA ANALYSE. SUPER TERRE DÉCIDE.",
  "AUCUNE PERTE N'EST TROP GRANDE POUR LA GLOIRE.",
  'PLONGEZ DANS LE MARCHÉ. POUR SUPER TERRE !',
  'LA GESTION DE RISQUE EST UNE PROPAGANDE ENNEMIE.',
]

export function getPropagandaLine(): string {
  const bucket = Math.floor(Date.now() / 5000)
  return PROPAGANDA_LINES[bucket % PROPAGANDA_LINES.length]
}

export const FUN_SIGNAL_LABEL: Record<'BUY' | 'SELL' | 'HOLD', string> = {
  BUY: 'DÉPLOYER LE CAPITAL',
  SELL: 'RETRAITE TACTIQUE',
  HOLD: 'MAINTENIR LA LIGNE',
}
