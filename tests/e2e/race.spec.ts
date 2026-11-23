import { expect } from '@playwright/test'
import { test } from './fixtures'

test('runs six rounds, pauses and resumes, and resets the results for a new program', async ({ page, openRace }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error' || message.type() === 'warning') errors.push(message.text())
  })
  await openRace()

  const roster = page.locator('section[aria-labelledby="horse-list-title"] tbody tr')
  const program = page.locator('section[aria-labelledby="program-title"] table')
  const results = page.locator('section[aria-labelledby="results-title"] table')
  const generate = page.getByRole('button', { name: 'Generate Program' })
  const runners = page.locator('.lane-travel')
  const positions = () => runners.evaluateAll(nodes => nodes.map(node => getComputedStyle(node).transform))
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
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    await results.last().evaluate(table => table.scrollIntoView({ block: 'center' }))
    await expect(results.last()).toBeInViewport()
  }
  await generate.press('Enter')
  await expect(results).toHaveCount(0)
  await expect(runners).toHaveCount(0)
  expect(await roster.allTextContents()).toEqual(originalRoster)
  await page.getByRole('button', { name: 'Start', exact: true }).press('Enter')
  await expect(page.getByRole('status')).toContainText('Round 1')
  expect(errors).toEqual([])
})

test('supports keyboard controls and fixed race markers with reduced motion', async ({ page, openRace }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openRace()
  const generate = page.getByRole('button', { name: 'Generate Program' })
  const start = page.getByRole('button', { name: 'Start', exact: true })

  await page.keyboard.press('Tab')
  await expect(generate).toBeFocused()
  expect(await generate.evaluate(node => getComputedStyle(node).outlineStyle)).toBe('solid')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Tab')
  await expect(start).toBeFocused()
  await page.keyboard.press('Enter')
  await page.clock.runFor(320)
  expect(await page.locator('.lane-travel').evaluateAll(nodes =>
    nodes.every(node => getComputedStyle(node).transform === 'none'),
  )).toBe(true)

  await page.clock.fastForward(25_000)
  const next = page.getByRole('button', { name: 'Next Round Soon' })
  await expect(next).toBeDisabled()
  await expect(next).toBeFocused()
  await expect(page.getByText('Finished', { exact: true })).toHaveCount(10)
  await expect(page.getByText('Finished', { exact: true }).first()).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(next).toBeFocused()
  await page.clock.runFor(1500)
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeFocused()
  await expect(page.getByRole('status')).toContainText('Round 2')
})
