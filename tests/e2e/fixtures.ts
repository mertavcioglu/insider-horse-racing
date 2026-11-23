import { test as base } from '@playwright/test'
import { createServer } from 'vite'

export const test = base.extend<{ openRace: () => Promise<void> }, { appUrl: string }>({
  appUrl: [async ({}, use) => {
    const server = await createServer({
      server: { host: '127.0.0.1', port: 0, hmr: false, watch: null },
    })
    try {
      await server.listen()
      const localUrl = server.resolvedUrls?.local[0]
      if (!localUrl) throw new Error('The Vite test server has no local URL.')
      await use(localUrl)
    } finally {
      await server.close()
    }
  }, { scope: 'worker' }],

  openRace: async ({ page, appUrl }, use) => {
    await use(async () => {
      await page.clock.install({ time: new Date('2025-01-01T12:00:00Z') })
      await page.clock.pauseAt(new Date('2025-01-01T12:01:00Z'))
      await page.addInitScript(() => {
        let seed = 1907
        Math.random = () => {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
          return seed / 2 ** 32
        }
      })
      await page.goto(appUrl)
    })
  },
})
