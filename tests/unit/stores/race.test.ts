import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRaceStore } from '../../../src/stores/race'

describe('race store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
  })
  afterEach(() => vi.restoreAllMocks())

  it('starts idle and ignores race actions before a program exists', () => {
    const race = useRaceStore()
    race.start()
    race.startNextRound()
    race.resume()
    race.advance(100)
    expect(race.status).toBe('idle')
    expect(race.horses).toHaveLength(20)
    expect(race.rounds).toEqual([])
    expect(race.results).toEqual([])
    expect(race.simulation).toBeNull()
    expect(race.elapsedMs).toBe(0)
  })

  it('generates a ready program and starts its first round once', () => {
    const race = useRaceStore()
    race.generateProgram()
    expect(race.status).toBe('ready')
    expect(race.rounds).toHaveLength(6)

    race.start()
    const simulation = race.simulation
    race.advance(320)
    race.start()
    race.startNextRound()
    expect(race.status).toBe('running')
    expect(race.activeRound).toBe(1)
    expect(race.simulation).toBe(simulation)
    expect(race.simulation?.round).toBe(race.rounds[0])
    expect(race.elapsedMs).toBe(320)
  })

  it('freezes the active round and preserves its elapsed time on resume', () => {
    const race = useRaceStore()
    race.generateProgram()
    race.start()
    race.advance(333)
    race.pause()
    race.advance(50_000)
    race.startNextRound()
    expect(race.status).toBe('paused')
    expect(race.activeRound).toBe(1)
    expect(race.elapsedMs).toBe(333)
    expect(race.results).toEqual([])

    race.resume()
    race.resume()
    race.advance(50)
    expect(race.status).toBe('running')
    expect(race.elapsedMs).toBe(383)
    expect(race.activeRound).toBe(1)
  })

  it('blocks regeneration while running, paused or between rounds', () => {
    const race = useRaceStore()
    race.generateProgram()
    const program = race.rounds
    race.start()
    race.generateProgram()
    expect(race.rounds).toBe(program)
    race.pause()
    race.generateProgram()
    expect(race.rounds).toBe(program)
    expect(race.status).toBe('paused')
    race.resume()
    race.advance(race.simulation!.durationMs)
    race.generateProgram()
    expect(race.rounds).toBe(program)
    expect(race.status).toBe('transition')
    expect(race.results).toHaveLength(1)
  })

  it('records each round once, advances in order, and stops at round six', () => {
    const race = useRaceStore()
    race.generateProgram()
    race.start()
    for (const [index, round] of race.rounds.entries()) {
      const simulation = race.simulation!
      expect(simulation.round).toBe(round)
      expect(race.elapsedMs).toBe(0)
      race.advance(-100)
      expect(race.elapsedMs).toBe(0)
      race.advance(simulation.durationMs - 1)
      expect(race.results).toHaveLength(index)
      race.advance(3_600_000)
      race.advance(3_600_000)
      expect(race.elapsedMs).toBe(simulation.durationMs)
      expect(race.results.map(result => result.round)).toEqual(
        race.rounds.slice(0, index + 1).map(item => item.number),
      )
      expect(race.results[index].distance).toBe(round.distance)
      expect(race.results[index].entries).toHaveLength(10)
      expect(new Set(race.results[index].entries.map(entry => entry.horse.id)).size).toBe(10)
      expect(race.status).toBe(index === 5 ? 'finished' : 'transition')
      race.startNextRound()
      race.startNextRound()
    }
    expect(race.simulation?.round.number).toBe(6)
    expect(race.activeRound).toBeUndefined()
    expect(race.isActive).toBe(false)
  })

  it('resets a completed program without replacing the roster', () => {
    const race = useRaceStore()
    const horses = race.horses
    const roster = horses.map(({ id, condition }) => [id, condition])
    race.generateProgram()
    const firstProgram = race.rounds
    race.start()
    for (const _round of race.rounds) {
      race.advance(race.simulation!.durationMs)
      race.startNextRound()
    }
    vi.mocked(Math.random).mockReturnValue(0)
    race.generateProgram()
    expect(race.status).toBe('ready')
    expect(race.rounds[0].participants).not.toEqual(firstProgram[0].participants)
    expect(race.results).toEqual([])
    expect(race.simulation).toBeNull()
    expect(race.elapsedMs).toBe(0)
    expect(race.horses).toBe(horses)
    expect(race.horses.map(({ id, condition }) => [id, condition])).toEqual(roster)
    race.start()
    expect(race.activeRound).toBe(1)
  })
})
