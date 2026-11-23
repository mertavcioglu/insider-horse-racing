import { expect, test } from '@playwright/test'
import { createServer, type ViteDevServer } from 'vite'

let server: ViteDevServer | undefined
let appUrl: string

test.beforeAll(async () => {
  server = await createServer({
    server: { host: '127.0.0.1', port: 0, hmr: false, watch: null },
  })
  await server.listen()
  const localUrl = server.resolvedUrls?.local[0]
  if (!localUrl) throw new Error('The Vite test server has no local URL.')
  appUrl = localUrl
})

test.afterAll(async () => {
  await server?.close()
})

test('runs six rounds, pauses and resumes, and resets the results for a new program', async ({ page }) => {
  const startTime = new Date('2025-01-01T12:00:00Z')
  await page.clock.install({ time: startTime })
  await page.clock.pauseAt(new Date(startTime.getTime() + 60_000))
  await page.addInitScript(() => {
    let seed = 1907
    Math.random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      return seed / 2 ** 32
    }
  })
  await page.goto(appUrl)

  const roster = page.locator('section[aria-labelledby="horse-list-title"] tbody tr')
  const program = page.locator('section[aria-labelledby="program-title"] table')
  const results = page.locator('section[aria-labelledby="results-title"] table')
  const generate = page.getByRole('button', { name: 'Generate Program' })
  const runners = page.locator('.lane-travel')
  const positions = () => runners.evaluateAll(nodes => nodes.map(node => (node as HTMLElement).style.transform))
  const distances = [1200, 1400, 1600, 1800, 2000, 2200]

  await expect(roster).toHaveCount(20)
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeDisabled()
  const originalRoster = await roster.allTextContents()
  await generate.press('Enter')
  await expect(program).toHaveCount(6)
  await expect(results).toHaveCount(0)
  for (const [index, distance] of distances.entries()) {
    await expect(program.nth(index).locator('caption')).toContainText(`Round ${index + 1} · ${distance} m`)
  }

  await page.getByRole('button', { name: 'Start', exact: true }).press('Enter')
  await expect(page.getByRole('status')).toContainText('Round 1')
  await expect(runners).toHaveCount(10)
  await expect(generate).toBeDisabled()
  await page.clock.runFor(320)
  await page.getByRole('button', { name: 'Pause', exact: true }).press('Enter')
  const paused = await positions()
  await page.clock.runFor(2000)
  expect(await positions()).toEqual(paused)
  await expect(generate).toBeDisabled()
  await page.getByRole('button', { name: 'Resume', exact: true }).press('Enter')
  await page.clock.runFor(320)
  expect(await positions()).not.toEqual(paused)

  for (const [index, distance] of distances.entries()) {
    const round = index + 1
    await expect(page.getByRole('status')).toContainText(`Round ${round} · ${distance} m`)
    await expect(results).toHaveCount(index)

    // A jump beyond the slowest possible finish triggers the pending animation frame once.
    await page.clock.fastForward(25_000)
    await expect(results).toHaveCount(round)
    const table = results.nth(index)
    await expect(table.locator('caption')).toContainText(`Round ${round} · ${distance} m`)
    await expect(table.locator('tbody tr')).toHaveCount(10)
    const names = (await table.locator('tbody th').allTextContents()).map(name => name.trim())
    const participants = (await program.nth(index).locator('tbody th').allTextContents()).map(name => name.trim())
    expect(new Set(names).size).toBe(10)
    expect([...names].sort()).toEqual([...participants].sort())
    const times = (await table.locator('tbody .time').allTextContents()).map(Number)
    expect(times).toEqual([...times].sort((a, b) => a - b))
    if (round < distances.length) {
      await expect(page.getByRole('button', { name: 'Next Round Soon' })).toBeDisabled()
      await page.clock.runFor(1499)
      await expect(results).toHaveCount(round)
      await expect(page.getByRole('button', { name: 'Next Round Soon' })).toBeDisabled()
      await page.clock.runFor(1)
    }
  }

  await expect(page.getByRole('status')).toContainText('All rounds complete.')
  await expect(generate).toBeEnabled()
  await generate.press('Enter')
  await expect(results).toHaveCount(0)
  await expect(runners).toHaveCount(0)
  expect(await roster.allTextContents()).toEqual(originalRoster)
  await page.getByRole('button', { name: 'Start', exact: true }).press('Enter')
  await expect(page.getByRole('status')).toContainText('Round 1')
})
