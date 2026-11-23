import { describe, expect, it } from 'vitest'
import { createHorses } from '../../../src/domain/horse'

describe('createHorses', () => {
  it('creates 20 horses with unique IDs and valid unique colors', () => {
    const horses = createHorses(() => 0.5)

    expect(horses.map(horse => horse.id)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
    expect(new Set(horses.map(horse => horse.color)).size).toBe(20)
    for (const { color } of horses) expect(color).toMatch(/^#[\da-f]{6}$/i)
  })

  it('assigns the fixed names in roster order', () => {
    expect(createHorses(() => 0).map(horse => horse.name)).toEqual([
      'Amber Run', 'Blue Comet', 'Copper Trail', 'Dawn Patrol', 'Echo Ridge',
      'Front Runner', 'Golden Hour', 'High Meadow', 'Indigo Sky', 'Juniper Dash',
      'Kingfisher', 'Lunar Pace', 'Midnight Bell', 'North Star', 'Oak Valley',
      'Prairie Wind', 'Quiet Storm', 'River Bend', 'Silver Crest', 'Wild Aster',
    ])
  })

  it('draws one integer condition per horse, including both endpoints', () => {
    const rolls = [0, 0.009, 0.01, 0.5, 0.999999]
    let calls = 0
    const horses = createHorses(() => rolls[calls++ % rolls.length])

    expect(calls).toBe(20)
    expect(horses.map(horse => horse.condition)).toEqual(
      [1, 1, 2, 51, 100, 1, 1, 2, 51, 100, 1, 1, 2, 51, 100, 1, 1, 2, 51, 100],
    )
  })
})
