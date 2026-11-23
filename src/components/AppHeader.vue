<script setup lang="ts">
import { ref, watch } from 'vue'
import { PLAYBACK_SPEEDS, type PlaybackSpeed, type RaceStatus } from '../stores/race'

const props = defineProps<{
  status: RaceStatus
  generateDisabled: boolean
  playbackSpeed: PlaybackSpeed
  stopConfirmationOpen: boolean
}>()
const emit = defineEmits<{
  generate: []
  toggleRace: []
  requestStop: []
  resolveStop: [confirmed: boolean]
  changeSpeed: [speed: PlaybackSpeed]
}>()

const confirmation = ref<HTMLDialogElement | null>(null)
const generateButton = ref<HTMLButtonElement | null>(null)
const stopButton = ref<HTMLButtonElement | null>(null)

watch(() => props.stopConfirmationOpen, open => {
  if (open) {
    confirmation.value?.showModal()
  } else {
    confirmation.value?.close()
    const destination = props.status === 'stopped' ? generateButton.value : stopButton.value
    destination?.focus()
  }
}, { flush: 'post' })

function selectSpeed(event: Event) {
  const speed = PLAYBACK_SPEEDS.find(value => value === Number((event.target as HTMLSelectElement).value))
  if (speed !== undefined) emit('changeSpeed', speed)
}

const raceLabels: Record<RaceStatus, string> = {
  idle: 'Start',
  ready: 'Start',
  running: 'Pause',
  paused: 'Resume',
  transition: 'Next Round Soon',
  finished: 'Program Complete',
  stopped: 'Race Stopped',
}
</script>

<template>
  <header class="app-header">
    <h1>Horse Racing</h1>
    <div class="controls">
      <button ref="generateButton" class="generate" type="button" :disabled="generateDisabled" @click="emit('generate')">
        Generate Program
      </button>
      <button
        class="race-action"
        type="button"
        :disabled="status === 'idle' || status === 'finished' || status === 'stopped'"
        :aria-disabled="status === 'transition' ? true : undefined"
        @click="emit('toggleRace')"
      >
        {{ raceLabels[status] }}
      </button>
      <button ref="stopButton" class="stop" type="button" :disabled="!generateDisabled" @click="emit('requestStop')">
        Stop
      </button>
      <label class="speed">
        Race Speed
        <select :value="playbackSpeed" @change="selectSpeed">
          <option v-for="speed in PLAYBACK_SPEEDS" :key="speed" :value="speed">{{ speed }}x</option>
        </select>
      </label>
    </div>
    <dialog ref="confirmation" aria-labelledby="stop-title" aria-describedby="stop-description"
      @cancel.prevent="emit('resolveStop', false)">
      <h2 id="stop-title">End Current Race?</h2>
      <p id="stop-description">
        The unfinished round will not receive a result. Completed round results will remain available
        until a new program is generated.
      </p>
      <div class="dialog-actions">
        <button type="button" autofocus @click="emit('resolveStop', false)">Cancel</button>
        <button class="confirm-stop" type="button" @click="emit('resolveStop', true)">End Race</button>
      </div>
    </dialog>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  padding: 1rem;
  background: #172d26;
  color: #fff;
}
h1 { margin: 0; font-size: 1.5rem; letter-spacing: -.025em; }
.controls { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
button, select {
  min-height: 2.75rem;
  padding: .65rem .85rem;
  border: 1px solid transparent;
  border-radius: .4rem;
  font-size: .875rem;
  font-weight: 650;
}
.speed { display: flex; align-items: center; gap: .45rem; font-size: .875rem; }
.speed select { font-family: inherit; background: #244238; color: white; border-color: #779185; }
.stop { background: transparent; color: #ffd9d5; border-color: #da8f85; cursor: pointer; }
.stop:hover:not(:disabled) { background: #56312e; }
.generate { background: #d8f3a3; color: #203415; cursor: pointer; }
.generate:hover:not(:disabled) { background: #e7fac6; }
.race-action { background: #fff; color: #172d26; cursor: pointer; }
.race-action:hover:not(:disabled, [aria-disabled='true']) { background: #e4efe9; }
button:focus-visible, select:focus-visible { outline: 2px solid white; outline-offset: 3px; }
button:disabled,
button[aria-disabled='true'] {
  background: transparent;
  border-color: #779185;
  color: #becec6;
  cursor: default;
}
dialog {
  max-width: min(29rem, calc(100% - 2rem));
  padding: 1.25rem;
  border: 1px solid var(--line);
  border-radius: .75rem;
  background: var(--surface);
  color: #192a26;
}
dialog::backdrop { background: rgb(17 34 28 / 65%); }
dialog h2 { margin: 0; font-size: 1.15rem; }
dialog p { color: var(--muted); }
.dialog-actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: .5rem; }
.dialog-actions button { border-color: var(--line); cursor: pointer; }
.dialog-actions button:focus-visible { outline-color: #14785e; }
.confirm-stop { background: #9e342b; color: white; }
</style>
