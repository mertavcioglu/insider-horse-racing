import { expect } from '@playwright/test'
import { test } from './fixtures'

test.use({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' })

test.beforeEach(async ({ openRace }) => {
  await openRace()
})

test('initial dashboard', async ({ page }) => {
  await expect(page.getByRole('status')).toContainText('Select Generate Program')
  await expect(page).toHaveScreenshot('dashboard-initial.png')
})

test('generated program', async ({ page }) => {
  await page.getByRole('button', { name: 'Generate Program' }).press('Enter')
  await expect(page.getByRole('status')).toContainText('Program ready')
  await expect(page).toHaveScreenshot('dashboard-program.png')
})

test('completed first round', async ({ page }) => {
  await page.getByRole('button', { name: 'Generate Program' }).press('Enter')
  await page.getByRole('button', { name: 'Start', exact: true }).press('Enter')
  await page.clock.fastForward(25_000)
  await expect(page.getByRole('status')).toContainText('Round 2 starts shortly')
  await expect(page).toHaveScreenshot('dashboard-first-result.png')
})
