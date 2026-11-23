import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { createHorses } from '../domain/horse'
import { createRaceProgram, type RaceRound } from '../domain/raceProgram'
import {
  createRaceSimulation, getRoundResult, type RoundResult, type RaceSimulation,
} from '../domain/raceSimulation'

export type RaceStatus = 'idle' | 'ready' | 'running' | 'paused' | 'transition' | 'finished'

export const useRaceStore = defineStore('race', () => {
  const horses = ref(createHorses())
  const rounds = ref<RaceRound[]>([])
  const status = ref<RaceStatus>('idle')
  const simulation = shallowRef<RaceSimulation | null>(null)
  const elapsedMs = ref(0)
  const results = shallowRef<readonly RoundResult[]>([])
  const activeRound = computed(() =>
    status.value === 'running' || status.value === 'paused' ? simulation.value?.round.number : undefined,
  )
  const isActive = computed(() =>
    status.value === 'running' || status.value === 'paused' || status.value === 'transition',
  )

  function generateProgram() {
    if (isActive.value) return
    rounds.value = createRaceProgram(horses.value)
    simulation.value = null
    elapsedMs.value = 0
    results.value = []
    status.value = 'ready'
  }

  function start() {
    if (status.value === 'ready') beginRound()
  }

  function startNextRound() {
    if (status.value === 'transition') beginRound()
  }

  function beginRound() {
    const round = rounds.value[results.value.length]
    if (!round) return

    simulation.value = createRaceSimulation(round)
    elapsedMs.value = 0
    status.value = 'running'
  }

  function pause() {
    if (status.value === 'running') status.value = 'paused'
  }

  function resume() {
    if (status.value === 'paused') status.value = 'running'
  }

  function advance(deltaMs: number) {
    const currentRace = simulation.value
    if (status.value !== 'running' || !currentRace) return

    elapsedMs.value = Math.min(elapsedMs.value + Math.max(0, deltaMs), currentRace.durationMs)
    if (elapsedMs.value === currentRace.durationMs) {
      results.value = [...results.value, getRoundResult(currentRace)]
      status.value = results.value.length === rounds.value.length ? 'finished' : 'transition'
    }
  }

  return {
    horses, rounds, status, simulation, elapsedMs, results, activeRound, isActive,
    generateProgram, start, startNextRound, pause, resume, advance,
  }
})
