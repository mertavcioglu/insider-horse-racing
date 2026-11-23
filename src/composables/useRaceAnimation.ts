import { onBeforeUnmount, readonly, ref, watch } from 'vue'
import type { PlaybackSpeed, useRaceStore } from '../stores/race'

const ROUND_TRANSITION_MS = 1500

export function useRaceAnimation(race: ReturnType<typeof useRaceStore>) {
  let frameId: number | null = null
  let transitionId: number | null = null
  let transitionDeadline = 0
  let transitionRemaining = ROUND_TRANSITION_MS
  let lastTick = 0
  const stopConfirmationOpen = ref(false)

  function updateClock() {
    const now = performance.now()
    race.advance((now - lastTick) * race.playbackSpeed)
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

  const stopWatching = watch([() => race.status, stopConfirmationOpen], ([status, confirming], [previousStatus]) => {
    if (status !== previousStatus) transitionRemaining = ROUND_TRANSITION_MS
    else if (confirming && transitionId !== null) {
      transitionRemaining = Math.max(0, transitionDeadline - performance.now())
    }
    clearTimers()

    if (confirming) return
    if (status === 'running') {
      lastTick = performance.now()
      frameId = requestAnimationFrame(animate)
    } else if (status === 'transition') {
      transitionDeadline = performance.now() + transitionRemaining
      transitionId = window.setTimeout(() => {
        transitionId = null
        race.startNextRound()
      }, transitionRemaining)
    }
  }, { flush: 'sync', immediate: true })

  function toggleRace() {
    if (stopConfirmationOpen.value) return
    if (race.status === 'running') {
      updateClock()
      race.pause()
    } else if (race.status === 'ready') {
      race.start()
    } else if (race.status === 'paused') {
      race.resume()
    }
  }

  function requestStop() {
    if (race.isActive) stopConfirmationOpen.value = true
  }

  function resolveStop(confirmed: boolean) {
    if (!stopConfirmationOpen.value) return
    if (confirmed) race.stop()
    stopConfirmationOpen.value = false
  }

  function changeSpeed(speed: PlaybackSpeed) {
    if (stopConfirmationOpen.value || race.playbackSpeed === speed) return
    // Account for the time up to this input at the previous rate.
    if (race.status === 'running') updateClock()
    race.setPlaybackSpeed(speed)
  }

  onBeforeUnmount(() => {
    stopWatching()
    clearTimers()
    race.pause()
  })

  return { toggleRace, requestStop, resolveStop, changeSpeed, stopConfirmationOpen: readonly(stopConfirmationOpen) }
}
