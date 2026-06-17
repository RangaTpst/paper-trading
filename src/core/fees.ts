export const FeeMode = {
  STANDARD: 0.001,
  BNB: 0.00075,
} as const

export type FeeMode = typeof FeeMode[keyof typeof FeeMode]

export function calculateFees(amount: number, mode: FeeMode): number {
  if (amount < 0) throw new Error('Le montant ne peut pas être négatif')
  return amount * mode
}
