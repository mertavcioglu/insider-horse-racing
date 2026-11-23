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
  const podium = page.locator('.podium')
  const live = page.locator('.standings')
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
  await expect(podium).toHaveCount(0)
  await expect(live).toHaveCount(0)
  for (const [index, distance] of distances.entries()) {
    await expect(program.nth(index).locator('caption')).toContainText(`Round ${index + 1} · ${distance} m`)
  }

  await page.getByRole('button', { name: 'Start', exact: true }).press('Enter')
  await expect(page.getByRole('status')).toContainText('Round 1')
  await expect(runners).toHaveCount(10)
  await expect(live.locator('.progress')).toHaveText(Array(10).fill('0%'))
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
    const lineup = (await program.nth(index).locator('tbody th').allTextContents()).map(name => name.trim())
    if (index === 0) await expect(podium).toHaveCount(0)
    else {
      await expect(live.locator('.standing-name')).toHaveText(lineup)
      await expect(live.locator('.progress')).toHaveText(Array(10).fill('0%'))
      await expect(live.getByRole('img', { name: 'Unchanged' })).toHaveCount(10)
      await expect(podium.getByRole('heading')).toHaveText(`Round ${index} Podium`)
    }

    // A jump beyond the slowest possible finish triggers the pending animation frame once.
    await page.clock.fastForward(25_000)
    await expect(results).toHaveCount(round)
    const table = results.nth(index)
    await expect(table.locator('caption')).toContainText(`Round ${round} · ${distance} m`)
    await expect(table.locator('tbody tr')).toHaveCount(10)
    const names = (await table.locator('tbody th').allTextContents()).map(name => name.trim())
    expect(new Set(names).size).toBe(10)
    expect([...names].sort()).toEqual([...lineup].sort())
    const timeLabels = await table.locator('tbody .time').allTextContents()
    const times = timeLabels.map(Number)
    expect(times).toEqual([...times].sort((a, b) => a - b))
    await expect(live.locator('.standing-name')).toHaveText(names)
    await expect(live.locator('.progress')).toHaveText(Array(10).fill('100%'))
    await expect(podium.getByRole('heading')).toHaveText(`Round ${round} Podium`)
    await expect(podium.locator('.podium-name')).toHaveText(names.slice(0, 3))
    await expect(podium.locator('.podium-time')).toHaveText(timeLabels.slice(0, 3).map(time => `${time} s`))
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
  await expect(podium).toHaveCount(0)
  await expect(live).toHaveCount(0)
  await expect(runners).toHaveCount(0)
  expect(await roster.allTextContents()).toEqual(originalRoster)
  await page.getByRole('button', { name: 'Start', exact: true }).press('Enter')
  await expect(page.getByRole('status')).toContainText('Round 1')
  expect(errors).toEqual([])
})

test('mirrors lane progress and horse colors in the live standings', async ({ page, openRace }) => {
  await openRace()
  await page.getByRole('button', { name: 'Generate Program' }).press('Enter')
  const rosterColors = await page.locator('.horse-list tbody tr').evaluateAll(rows => rows.map(row => ({
    name: row.querySelector('th')?.textContent?.trim(),
    color: getComputedStyle(row.querySelector('.swatch')!).backgroundColor,
  })))
  const lineup = await page.locator('section[aria-labelledby="program-title"] table').first().locator('tbody th').allTextContents()
  await page.getByRole('button', { name: 'Start', exact: true }).press('Enter')
  await expect(page.locator('.horse-marker svg')).toHaveCount(10)
  const visibleRunners = page.locator('.horse-marker')
  const standings = page.locator('.standings li')
  const progress = () => page.locator('.lane-travel').evaluateAll(nodes => nodes.map((node, index) => ({
    lane: index + 1,
    name: node.querySelector('.horse-marker')?.getAttribute('title'),
    percent: Number.parseFloat(getComputedStyle(node).getPropertyValue('--progress')),
  })))
  expect(await visibleRunners.evaluateAll(nodes =>
    nodes.map(node => [node.getAttribute('title'), getComputedStyle(node.querySelector('svg')!).fill]),
  )).toEqual(lineup.map(name => [name.trim(), rosterColors.find(horse => horse.name === name.trim())?.color]))
  await page.clock.runFor(265)
  expect(await page.getByRole('img', { name: /^Up \d/ }).count()).toBeGreaterThan(0)
  expect(await page.getByRole('img', { name: /^Down \d/ }).count()).toBeGreaterThan(0)
  await page.clock.runFor(535)
  await expect(standings.first().getByRole('img', { name: 'Unchanged' })).toBeVisible()
  await page.getByRole('button', { name: 'Pause', exact: true }).press('Enter')
  const markers = await progress()
  const ordered = [...markers].sort((a, b) => b.percent - a.percent || a.lane - b.lane)
  await expect(standings.locator('.standing-name')).toHaveText(ordered.map(row => row.name ?? ''))
  await expect(standings.locator('.progress')).toHaveText(ordered.map(row => `${Math.floor(row.percent)}%`))
  const frozen = await standings.allTextContents()
  await page.clock.runFor(2000)
  expect(await progress()).toEqual(markers)
  expect(await standings.allTextContents()).toEqual(frozen)
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    expect(await visibleRunners.evaluateAll(nodes => nodes.every(node => {
      const marker = node.getBoundingClientRect()
      const lane = node.closest('.lane-course')!.getBoundingClientRect()
      return marker.left >= lane.left - 0.5 && marker.right <= lane.right + 0.5 &&
        marker.top >= lane.top - 0.5 && marker.bottom <= lane.bottom + 0.5
    }))).toBe(true)
  }
  await page.getByRole('button', { name: 'Resume', exact: true }).press('Enter')
  await page.clock.runFor(500)
  expect(await standings.allTextContents()).not.toEqual(frozen)
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
