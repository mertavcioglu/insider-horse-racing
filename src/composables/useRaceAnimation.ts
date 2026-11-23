import { onBeforeUnmount, watch } from 'vue'
import type { useRaceStore } from '../stores/race'

const ROUND_TRANSITION_MS = 1500

export function useRaceAnimation(race: ReturnType<typeof useRaceStore>) {
  let frameId: number | null = null
  let transitionId: number | null = null
  let lastTick = 0

  function updateClock() {
    const now = performance.now()
    race.advance(now - lastTick)
    lastTick = now
  }

  function animate() {
    frameId = null
    updateClock()
    if (race.status === 'running') frameId = requestAnimationFrame(animate)
  }

  function clearTimers() {
    if (frameId !== null) cancelAnimationFrame(frameId)
    if (transitionId !== null) window.clearTimeout(transitionId)
    frameId = null
    transitionId = null
  }

  const stopWatching = watch(() => race.status, status => {
    clearTimers()

    if (status === 'running') {
      lastTick = performance.now()
      frameId = requestAnimationFrame(animate)
    } else if (status === 'transition') {
      transitionId = window.setTimeout(() => {
        transitionId = null
        race.startNextRound()
      }, ROUND_TRANSITION_MS)
    }
  }, { flush: 'sync', immediate: true })

  function toggleRace() {
    if (race.status === 'running') {
      updateClock()
      race.pause()
    } else if (race.status === 'ready') {
      race.start()
    } else if (race.status === 'paused') {
      race.resume()
    }
  }

  onBeforeUnmount(() => {
    stopWatching()
    clearTimers()
    race.pause()
  })

  return { toggleRace }
}
