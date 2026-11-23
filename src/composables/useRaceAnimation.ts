import { onUnmounted } from 'vue'
import { useRaceStore } from '../stores/race'

export function useRaceAnimation(race: ReturnType<typeof useRaceStore>) {
  let frameId: number | null = null
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

  function stopClock() {
    if (frameId !== null) cancelAnimationFrame(frameId)
    frameId = null
  }

  function toggleRace() {
    if (race.status === 'running') {
      stopClock()
      updateClock()
      race.pause()
      return
    }

    if (race.status === 'ready') race.start()
    else if (race.status === 'paused') race.resume()
    else return

    if (frameId === null) {
      lastTick = performance.now()
      frameId = requestAnimationFrame(animate)
    }
  }

  onUnmounted(() => {
    stopClock()
    race.pause()
  })

  return { toggleRace }
}
