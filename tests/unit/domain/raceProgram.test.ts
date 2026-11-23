import { describe, expect, it } from 'vitest'
import { createHorses } from '../../../src/domain/horse'
import { createRaceProgram } from '../../../src/domain/raceProgram'

describe('createRaceProgram', () => {
  const horses = createHorses(() => 0.5)

  it('uses six numbered rounds and the prescribed distance order', () => {
    const rounds = createRaceProgram(horses, () => 0)
    expect(rounds.map(round => [round.number, round.distance])).toEqual([
      [1, 1200], [2, 1400], [3, 1600], [4, 1800], [5, 2000], [6, 2200],
    ])
  })

  it.each([0, 0.5, 0.999999])('selects 10 unique horses from the pool with a draw of %s', draw => {
    for (const { participants } of createRaceProgram(horses, () => draw)) {
      expect(participants).toHaveLength(10)
      expect(new Set(participants.map(horse => horse.id)).size).toBe(10)
      for (const horse of participants) expect(horses.includes(horse)).toBe(true)
    }
  })

  it('permits the same horse in separate rounds', () => {
    const rounds = createRaceProgram(horses, () => 0)
    for (const round of rounds) expect(round.participants).toEqual(horses.slice(0, 10))
  })

  it('can redraw participants without changing the pool', () => {
    const original = structuredClone(horses)
    const first = createRaceProgram(horses, () => 0)
    const second = createRaceProgram(horses, () => 0.999999)
    expect(second[0].participants).not.toEqual(first[0].participants)
    expect(horses).toEqual(original)
  })

  it('rejects an undersized pool or duplicate IDs', () => {
    expect(() => createRaceProgram(horses.slice(0, 9))).toThrow(RangeError)
    expect(() => createRaceProgram([...horses, { ...horses[0] }])).toThrow(RangeError)
  })
})
