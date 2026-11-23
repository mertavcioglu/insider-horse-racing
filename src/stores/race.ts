import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { createHorses } from '../domain/horse'
import { createRaceProgram, type RaceRound } from '../domain/raceProgram'
import { createRaceSimulation, getFinishOrder, type RaceRunner, type RaceSimulation } from '../domain/raceSimulation'

export type RaceStatus = 'idle' | 'ready' | 'running' | 'paused' | 'finished'

export const useRaceStore = defineStore('race', () => {
  const horses = ref(createHorses())
  const rounds = ref<RaceRound[]>([])
  const status = ref<RaceStatus>('idle')
  const simulation = shallowRef<RaceSimulation | null>(null)
  const elapsedMs = ref(0)
  const finishOrder = shallowRef<readonly RaceRunner[]>([])
  const isActive = computed(() => status.value === 'running' || status.value === 'paused')

  function generateProgram() {
    if (isActive.value) return
    rounds.value = createRaceProgram(horses.value)
    simulation.value = null
    elapsedMs.value = 0
    finishOrder.value = []
    status.value = 'ready'
  }

  function start() {
    const firstRound = rounds.value[0]
    if (status.value !== 'ready' || !firstRound) return

    simulation.value = createRaceSimulation(firstRound)
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
      finishOrder.value = getFinishOrder(currentRace)
      status.value = 'finished'
    }
  }

  return {
    horses, rounds, status, simulation, elapsedMs, finishOrder, isActive,
    generateProgram, start, pause, resume, advance,
  }
})
