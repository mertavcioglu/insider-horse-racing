import type { Horse } from './horse'
import type { RaceRound } from './raceProgram'

// One real second represents eight seconds of racing.
const TIME_SCALE = 8
const SEGMENT_COUNT = 3

interface PaceSegment {
  readonly startMs: number
  readonly endMs: number
  readonly startMeters: number
  readonly metersPerMs: number
}

export interface RaceRunner {
  readonly horse: Horse
  readonly lane: number
  readonly finishMs: number
  readonly segments: readonly PaceSegment[]
}

export interface RaceSimulation {
  readonly round: RaceRound
  readonly runners: readonly RaceRunner[]
  readonly durationMs: number
}

export function createRaceSimulation(round: RaceRound, random = Math.random): RaceSimulation {
  const segmentMeters = round.distance / SEGMENT_COUNT
  const runners = round.participants.map((horse, index) => {
    const baseSpeed = 14 + 4 * ((horse.condition - 1) / 99)
    const form = 0.88 + 0.24 * random()
    let finishMs = 0

    const segments = Array.from({ length: SEGMENT_COUNT }, (_, segment) => {
      const pace = 0.95 + 0.1 * random()
      const metersPerMs = baseSpeed * form * pace * TIME_SCALE / 1000
      const startMs = finishMs
      finishMs += segmentMeters / metersPerMs
      return { startMs, endMs: finishMs, startMeters: segment * segmentMeters, metersPerMs }
    })

    return { horse, lane: index + 1, finishMs, segments }
  })

  return { round, runners, durationMs: Math.max(0, ...runners.map(runner => runner.finishMs)) }
}

export function getRaceProgress(runner: RaceRunner, distance: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0
  if (elapsedMs >= runner.finishMs) return 1

  for (const segment of runner.segments) {
    if (elapsedMs < segment.endMs) {
      const meters = segment.startMeters + (elapsedMs - segment.startMs) * segment.metersPerMs
      return Math.min(meters / distance, 1)
    }
  }

  return 1
}

export function getFinishOrder(simulation: RaceSimulation): RaceRunner[] {
  return [...simulation.runners].sort((a, b) => a.finishMs - b.finishMs || a.lane - b.lane)
}
