<script setup lang="ts">
import type { RaceStatus } from '../stores/race'

defineProps<{ status: RaceStatus; generateDisabled: boolean }>()
const emit = defineEmits<{ generate: []; toggleRace: [] }>()

const raceLabels: Record<RaceStatus, string> = {
  idle: 'Start',
  ready: 'Start',
  running: 'Pause',
  paused: 'Resume',
  transition: 'Next Round Soon',
  finished: 'Program Complete',
}
</script>

<template>
  <header class="app-header">
    <h1>Horse Racing</h1>
    <div class="controls">
      <button class="generate" type="button" :disabled="generateDisabled" @click="emit('generate')">
        Generate Program
      </button>
      <button
        class="race-action"
        type="button"
        :disabled="status === 'idle' || status === 'finished'"
        :aria-disabled="status === 'transition' ? true : undefined"
        @click="emit('toggleRace')"
      >
        {{ raceLabels[status] }}
      </button>
    </div>
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
.controls { display: flex; flex-wrap: wrap; gap: .5rem; }
button {
  min-height: 2.75rem;
  padding: .65rem .85rem;
  border: 1px solid transparent;
  border-radius: .4rem;
  font-size: .875rem;
  font-weight: 650;
}
.generate { background: #d8f3a3; color: #203415; cursor: pointer; }
.generate:hover:not(:disabled) { background: #e7fac6; }
.race-action { background: #fff; color: #172d26; cursor: pointer; }
.race-action:hover:not(:disabled, [aria-disabled='true']) { background: #e4efe9; }
button:focus-visible { outline: 2px solid white; outline-offset: 3px; }
button:disabled,
button[aria-disabled='true'] {
  background: transparent;
  border-color: #779185;
  color: #becec6;
  cursor: default;
}
</style>
