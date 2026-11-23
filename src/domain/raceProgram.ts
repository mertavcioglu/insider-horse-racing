import type { Horse } from './horse'

export const LANE_COUNT = 10
const ROUND_DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200] as const

export interface RaceRound {
  readonly number: number
  readonly distance: (typeof ROUND_DISTANCES)[number]
  readonly participants: readonly Horse[]
}

export function createRaceProgram(
  horses: readonly Horse[],
  random = Math.random,
): RaceRound[] {
  if (new Set(horses.map(({ id }) => id)).size !== horses.length || horses.length < LANE_COUNT) {
    throw new RangeError('The horse pool must contain at least 10 horses with unique IDs.')
  }

  return ROUND_DISTANCES.map((distance, index) => {
    const pool = [...horses]

    // Partial Fisher–Yates: each lane draws from the remaining horses.
    for (let lane = 0; lane < LANE_COUNT; lane++) {
      const selected = lane + Math.floor(random() * (pool.length - lane))
      const horse = pool[selected]
      pool[selected] = pool[lane]
      pool[lane] = horse
    }

    return {
      number: index + 1,
      distance,
      participants: pool.slice(0, LANE_COUNT),
    }
  })
}
