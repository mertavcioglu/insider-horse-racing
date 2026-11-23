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

  it.each([[0.5, 16], [1, 32], [2, 64]] as const)(
    'advances the race clock at %sx without changing official results',
    (speed, expectedElapsed) => {
      expect(race.playbackSpeed).toBe(1)
      controls.toggleRace()
      const model = race.simulation
      controls.changeSpeed(speed)
      vi.advanceTimersByTime(32)
      expect(race.elapsedMs).toBe(expectedElapsed)
      expect(race.simulation).toBe(model)
      const seedResult = createRaceStoreResultAtNormalSpeed()
      vi.advanceTimersByTime(30_000 / speed)
      expect(race.results[0]).toEqual(seedResult)
    },
  )

  function createRaceStoreResultAtNormalSpeed() {
    const reference = useRaceStore(createPinia())
    reference.generateProgram()
    reference.start()
    reference.advance(reference.simulation!.durationMs)
    return reference.results[0]
  }

  it('charges the partial frame at the old speed and resumes at the newly selected rate', () => {
    controls.toggleRace()
    vi.advanceTimersByTime(23)
    controls.changeSpeed(2)
    expect(race.elapsedMs).toBe(23)
    expect(vi.getTimerCount()).toBe(1)
    vi.advanceTimersByTime(9)
    expect(race.elapsedMs).toBe(41)
    controls.toggleRace()
    controls.changeSpeed(0.5)
    vi.advanceTimersByTime(5000)
    expect(race.elapsedMs).toBe(41)
    controls.toggleRace()
    vi.advanceTimersByTime(32)
    expect(race.elapsedMs).toBe(57)
  })

  it('freezes the current frame and rejects other controls while confirming Stop', () => {
    controls.requestStop()
    expect(controls.stopConfirmationOpen.value).toBe(false)
    controls.toggleRace()
    vi.advanceTimersByTime(28)
    const displayed = race.elapsedMs
    controls.requestStop()
    controls.requestStop()
    controls.toggleRace()
    controls.changeSpeed(2)
    expect(vi.getTimerCount()).toBe(0)
    vi.advanceTimersByTime(30_000)
    expect(race.elapsedMs).toBe(displayed)
    expect(race.playbackSpeed).toBe(1)
    controls.resolveStop(false)
    controls.resolveStop(true)
    expect(race.status).toBe('running')
    expect(vi.getTimerCount()).toBe(1)
    vi.advanceTimersByTime(16)
    expect(race.elapsedMs).toBe(displayed + 16)
  })

  it('leaves a paused race paused after canceling Stop', () => {
    controls.toggleRace()
    vi.advanceTimersByTime(20)
    controls.toggleRace()
    controls.requestStop()
    vi.advanceTimersByTime(5000)
    controls.resolveStop(false)
    expect(race.status).toBe('paused')
    expect(race.elapsedMs).toBe(20)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('preserves only the remaining real-time transition delay through repeated cancellations', () => {
    controls.toggleRace()
    controls.changeSpeed(2)
    race.advance(race.simulation!.durationMs)
    for (const delay of [400, 300]) {
      vi.advanceTimersByTime(delay)
      controls.requestStop()
      expect(vi.getTimerCount()).toBe(0)
      vi.advanceTimersByTime(10_000)
      expect(race.status).toBe('transition')
      controls.resolveStop(false)
      expect(vi.getTimerCount()).toBe(1)
    }
    vi.advanceTimersByTime(799)
    expect(race.status).toBe('transition')
    vi.advanceTimersByTime(1)
    expect(race.activeRound).toBe(2)
    expect(race.playbackSpeed).toBe(2)
  })

  it.each(['running', 'paused', 'transition'] as const)(
    'stops from %s, retaining only completed results and clearing work before a new program',
    status => {
      const roster = race.horses
      controls.toggleRace()
      controls.changeSpeed(2)
      race.advance(race.simulation!.durationMs)
      if (status !== 'transition') vi.advanceTimersByTime(1500)
      if (status === 'paused') controls.toggleRace()
      expect(race.status).toBe(status)
      const results = race.results
      controls.requestStop()
      controls.resolveStop(true)
      expect(race.status).toBe('stopped')
      expect(race.results).toBe(results)
      expect(race.results).toHaveLength(1)
      expect(race.elapsedMs).toBe(0)
      expect(race.simulation).toBeNull()
      controls.toggleRace()
      expect(race.status).toBe('stopped')
      expect(vi.getTimerCount()).toBe(0)
      race.generateProgram()
      vi.advanceTimersByTime(20_000)
      expect(race.status).toBe('ready')
      expect(race.horses).toBe(roster)
      expect(race.playbackSpeed).toBe(1)
      expect(race.results).toEqual([])
      expect(vi.getTimerCount()).toBe(0)
    },
  )
})
