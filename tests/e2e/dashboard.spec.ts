import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('affiche le solde disponible en USDT', async ({ page }) => {
    await expect(page.getByTestId('balance')).toBeVisible()
    await expect(page.getByTestId('balance')).toContainText('USDT')
  })

  test('affiche la valeur totale du portefeuille', async ({ page }) => {
    await expect(page.getByTestId('portfolio-value')).toBeVisible()
  })

  test('affiche le P&L (gain/perte) avec signe + ou -', async ({ page }) => {
    const pnl = page.getByTestId('pnl')
    await expect(pnl).toBeVisible()
    await expect(pnl).toHaveText(/[+-]?\d+(\.\d+)?\s*USDT/)
  })

  test('affiche les frais cumulés', async ({ page }) => {
    await expect(page.getByTestId('total-fees')).toBeVisible()
  })

  test('affiche un graphique de prix par paire', async ({ page }) => {
    await expect(page.getByTestId('price-chart-BTCUSDT')).toBeVisible()
    await expect(page.getByTestId('price-chart-ETHUSDT')).toBeVisible()
  })

  test('la liste des paires crypto est visible', async ({ page }) => {
    await expect(page.getByTestId('pair-BTCUSDT')).toBeVisible()
    await expect(page.getByTestId('pair-ETHUSDT')).toBeVisible()
  })
})

test.describe('Formulaire d\'ordre', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('permet de saisir une quantité et passer un ordre BUY', async ({ page }) => {
    await page.getByTestId('order-quantity').fill('0.001')
    await page.getByTestId('order-buy').click()
    await expect(page.getByTestId('trade-success')).toBeVisible()
  })

  test('affiche une erreur si solde insuffisant', async ({ page }) => {
    await page.getByTestId('order-quantity').fill('999')
    await page.getByTestId('order-buy').click()
    await expect(page.getByTestId('order-error')).toContainText('Solde insuffisant')
  })

  test('met à jour le solde après un achat', async ({ page }) => {
    const balanceBefore = await page.getByTestId('balance').textContent()
    await page.getByTestId('order-quantity').fill('0.001')
    await page.getByTestId('order-buy').click()
    await expect(page.getByTestId('balance')).not.toHaveText(balanceBefore!)
  })
})

test.describe('Historique des trades', () => {
  test('affiche la liste des trades passés', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('trade-history')).toBeVisible()
  })

  test('chaque trade affiche le symbole, côté, quantité et prix', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('order-quantity').fill('0.001')
    await page.getByTestId('order-buy').click()
    const firstRow = page.getByTestId('trade-history').locator('tr').first()
    await expect(firstRow).toContainText('BTCUSDT')
    await expect(firstRow).toContainText('BUY')
  })
})
