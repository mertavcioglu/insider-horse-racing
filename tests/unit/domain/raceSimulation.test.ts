import { describe, expect, it } from 'vitest'
import type { Horse } from '../../../src/domain/horse'
import type { RaceRound } from '../../../src/domain/raceProgram'
import { createRaceSimulation, getRaceProgress, getRoundResult } from '../../../src/domain/raceSimulation'

const horse: Horse = { id: 1, name: 'Test Horse', color: '#123456', condition: 50 }

function createRound(distance: RaceRound['distance'], conditions: number[]): RaceRound {
  return {
    number: 1,
    distance,
    participants: conditions.map((condition, index) => ({ ...horse, id: index + 1, condition })),
  }
}

describe('raceSimulation', () => {
  it.each([[1, 14], [50, 14 + 4 * 49 / 99], [100, 18]])(
    'maps condition %s to %s m/s at neutral form and tempo',
    (condition, speed) => {
      const simulation = createRaceSimulation(createRound(1200, [condition]), () => 0.5)
      for (const segment of simulation.runners[0].segments) {
        expect(segment.metersPerMs * 1000 / 8).toBeCloseTo(speed, 10)
      }
    },
  )

  it.each([[0, 0.88], [0.999999, 1.11999976]])(
    'maps the form draw %s to a bounded multiplier',
    (draw, multiplier) => {
      const values = [draw, 0.5, 0.5, 0.5]
      const { runners: [runner] } = createRaceSimulation(createRound(1200, [100]), () => values.shift()!)
      for (const segment of runner.segments) {
        expect(segment.metersPerMs * 1000 / 8 / 18).toBeCloseTo(multiplier, 10)
      }
    },
  )

  it.each([1200, 1400, 1600, 1800, 2000, 2200] as const)(
    'integrates three distinct tempos and clamps progress over %s m',
    distance => {
      const draws = [0.5, 0, 0.5, 0.999999]
      const simulation = createRaceSimulation(createRound(distance, [100]), () => draws.shift()!)
      const runner = simulation.runners[0]
      const progress = (elapsed: number) => getRaceProgress(runner, distance, elapsed)
      let time = 0
      expect(runner.segments).toHaveLength(3)
      expect(progress(-100)).toBe(0)
      expect(progress(0)).toBe(0)
      for (const [index, multiplier] of [0.95, 1, 1.0499999].entries()) {
        const duration = (distance / 3) / (18 * multiplier * 8 / 1000)
        expect(runner.segments[index].metersPerMs).toBeCloseTo(18 * multiplier * 8 / 1000, 10)
        expect(progress(time + duration / 2)).toBeCloseTo((index + 0.5) / 3, 10)
        time += duration
        expect(progress(time)).toBeCloseTo((index + 1) / 3, 10)
      }
      expect(runner.finishMs).toBeCloseTo(time, 10)
      expect(simulation.durationMs).toBe(runner.finishMs)
      expect(progress(runner.finishMs - 0.01)).toBeLessThan(1)
      expect(progress(runner.finishMs)).toBe(1)
      expect(progress(time + 100_000)).toBe(1)
      expect(draws).toHaveLength(0)
    },
  )

  it('can favor a lower-condition horse through form and ranks actual crossing times', () => {
    const round = createRound(1600, [60, 40])
    expect(getRoundResult(createRaceSimulation(round, () => 0.5)).entries[0].horse.id).toBe(1)

    const draws = [0, 0.5, 0.5, 0.5, 0.999999, 0.5, 0.5, 0.5]
    const simulation = createRaceSimulation(round, () => draws.shift()!)
    const [slower, faster] = simulation.runners
    expect(getRaceProgress(slower, round.distance, faster.finishMs)).toBeLessThan(1)
    expect(getRaceProgress(faster, round.distance, faster.finishMs)).toBe(1)
    expect(simulation.durationMs).toBe(slower.finishMs)
    expect(getRoundResult(simulation)).toEqual({
      round: 1,
      distance: 1600,
      entries: [faster, slower].map(runner => ({
        horse: runner.horse, finishSeconds: runner.finishMs * 8 / 1000,
      })),
    })
  })

  it('breaks exact ties by lane even when the input order differs', () => {
    const simulation = createRaceSimulation(createRound(1200, [50, 50]), () => 0.5)
    const reversed = [...simulation.runners].reverse()
    expect(getRoundResult({ ...simulation, runners: reversed }).entries.map(entry => entry.horse.id)).toEqual([1, 2])
    expect(reversed[0].lane).toBe(2)
  })
})
