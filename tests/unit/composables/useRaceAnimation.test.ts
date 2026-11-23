import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRenderer } from 'vue'
import { useRaceAnimation } from '../../../src/composables/useRaceAnimation'
import { useRaceStore } from '../../../src/stores/race'

// Mount the real Vue lifecycle without adding a browser emulator to the unit suite.
const renderer = createRenderer<object, object>({
  createElement: () => ({}),
  createText: () => ({}),
  createComment: () => ({}),
  insert() {},
  remove() {},
  patchProp() {},
  setText() {},
  setElementText() {},
  parentNode: () => null,
  nextSibling: () => null,
})

describe('useRaceAnimation', () => {
  let race: ReturnType<typeof useRaceStore>
  let controls: ReturnType<typeof useRaceAnimation>
  let unmount: (() => void) | undefined

  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
      setTimeout(() => callback(performance.now()), 16),
    )
    vi.stubGlobal('cancelAnimationFrame', (id: ReturnType<typeof setTimeout>) => clearTimeout(id))
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
    vi.stubGlobal('window', { setTimeout, clearTimeout })
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    setActivePinia(createPinia())
    race = useRaceStore()
    const app = renderer.createApp({
      setup() {
        controls = useRaceAnimation(race)
        return () => null
      },
    })
    app.mount({})
    unmount = () => app.unmount()
    race.generateProgram()
  })

  afterEach(() => {
    unmount?.()
    unmount = undefined
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('schedules one frame through repeated start, pause and resume calls', () => {
    controls.toggleRace()
    race.start()
    expect(vi.getTimerCount()).toBe(1)
    vi.advanceTimersByTime(23)
    controls.toggleRace()
    expect(race.elapsedMs).toBe(23)
    expect(vi.getTimerCount()).toBe(0)

    vi.advanceTimersByTime(60_000)
    expect(race.elapsedMs).toBe(23)
    controls.toggleRace()
    race.resume()
    vi.advanceTimersByTime(32)
    expect(race.elapsedMs).toBe(55)
    expect(vi.getTimerCount()).toBe(1)
  })

  it('keeps only the 1.5-second transition timer and resets the next round clock', () => {
    controls.toggleRace()
    race.advance(race.simulation!.durationMs)
    const firstSimulation = race.simulation
    expect(race.status).toBe('transition')
    expect(vi.getTimerCount()).toBe(1)
    controls.toggleRace()
    vi.advanceTimersByTime(1499)
    expect(race.simulation).toBe(firstSimulation)
    vi.advanceTimersByTime(1)
    expect(race.activeRound).toBe(2)
    expect(race.elapsedMs).toBe(0)
    expect(vi.getTimerCount()).toBe(1)
    vi.advanceTimersByTime(16)
    expect(race.elapsedMs).toBe(16)
  })

  it('schedules a transition if the pause click itself reaches the finish', () => {
    controls.toggleRace()
    race.advance(race.simulation!.durationMs - 5)
    vi.advanceTimersByTime(6)
    controls.toggleRace()
    expect(race.status).toBe('transition')
    expect(race.results).toHaveLength(1)
    expect(vi.getTimerCount()).toBe(1)
    vi.advanceTimersByTime(1500)
    expect(race.activeRound).toBe(2)
  })

  it.each(['running', 'transition'] as const)('clears the %s timer on unmount', status => {
    controls.toggleRace()
    if (status === 'transition') race.advance(race.simulation!.durationMs)
    unmount?.()
    unmount = undefined
    expect(vi.getTimerCount()).toBe(0)
    vi.advanceTimersByTime(60_000)
    expect(race.simulation?.round.number).toBe(1)
    expect(race.status).toBe(status === 'running' ? 'paused' : 'transition')
  })

  it('leaves no scheduled work after round six or when generating a fresh program', () => {
    controls.toggleRace()
    for (let index = 0; index < 6; index++) {
      race.advance(race.simulation!.durationMs)
      if (index < 5) vi.advanceTimersByTime(1500)
    }
    expect(race.status).toBe('finished')
    expect(vi.getTimerCount()).toBe(0)
    race.generateProgram()
    vi.advanceTimersByTime(600_000)
    expect(race.status).toBe('ready')
    expect(race.simulation).toBeNull()
    expect(race.results).toEqual([])
    expect(vi.getTimerCount()).toBe(0)
  })
})
