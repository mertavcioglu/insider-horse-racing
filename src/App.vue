<script setup lang="ts">
import { storeToRefs } from 'pinia'
import AppHeader from './components/AppHeader.vue'
import HorseList from './components/HorseList.vue'
import RaceProgram from './components/RaceProgram.vue'
import RaceResults from './components/RaceResults.vue'
import RaceTrack from './components/RaceTrack.vue'
import { useRaceAnimation } from './composables/useRaceAnimation'
import { useRaceStore } from './stores/race'

const race = useRaceStore()
const { horses, rounds, status, isActive, activeRound, results, playbackSpeed } = storeToRefs(race)
const { toggleRace, requestStop, resolveStop, changeSpeed, stopConfirmationOpen } = useRaceAnimation(race)
</script>

<template>
  <div class="app">
    <AppHeader
      :status="status"
      :generate-disabled="isActive"
      :playback-speed="playbackSpeed"
      :stop-confirmation-open="stopConfirmationOpen"
      @generate="race.generateProgram"
      @toggle-race="toggleRace"
      @request-stop="requestStop"
      @resolve-stop="resolveStop"
      @change-speed="changeSpeed"
    />

    <main class="dashboard">
      <HorseList :horses="horses" />
      <RaceTrack :stop-confirmation-open="stopConfirmationOpen" />
      <div class="race-details">
        <RaceProgram :rounds="rounds" :active-round="activeRound" :completed-count="results.length"
          :stopped="status === 'stopped'" />
        <RaceResults :results="results" />
      </div>
    </main>
  </div>
</template>

<style>
:root {
  font-family: system-ui, sans-serif;
  color: #192a26;
  background: #eef2ef;
  --line: #d9e2dc;
  --muted: #50615b;
  --surface: #fff;
}

* { box-sizing: border-box; }
body { margin: 0; }
button { font: inherit; }

.app { max-width: 100rem; margin-inline: auto; }
.dashboard {
  display: grid;
  grid-template-columns: minmax(13rem, 1fr) minmax(18rem, 2fr) minmax(24rem, 1.65fr);
  gap: 1rem;
  padding: 1rem;
  align-items: start;
}

.race-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .75rem;
}

.panel {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: .75rem;
  background: var(--surface);
}

.panel-title {
  margin: 0;
  padding: .9rem 1rem;
  border-bottom: 1px solid var(--line);
  font-size: 1rem;
}

.empty-state { margin: 0; padding: 1rem; font-size: .875rem; color: var(--muted); }
.table-scroll { max-height: 36rem; overflow: auto; }
.table-scroll:focus-visible { outline: 2px solid #14785e; outline-offset: -2px; }

table { width: 100%; border-collapse: collapse; font-size: .8125rem; text-align: left; }
th, td { padding: .48rem .65rem; border-bottom: 1px solid var(--line); }
thead { background: #f5f7f6; color: var(--muted); }

@media (width > 60rem) {
  .dashboard { align-items: stretch; }
  .dashboard .panel { display: flex; flex-direction: column; }
  .dashboard .table-scroll {
    flex: 1;
    min-height: 0;
    max-height: none;
    /* Let the track determine the row height and scroll long lists inside their cards. */
    contain: size;
  }
}

@media (max-width: 60rem) {
  .dashboard { grid-template-columns: minmax(13rem, 1fr) minmax(0, 2fr); }
  .race-details { grid-column: 1 / -1; }
}

@media (max-width: 40rem) {
  .dashboard { grid-template-columns: minmax(0, 1fr); }
  .race-details { grid-template-columns: minmax(0, 1fr); }
  .table-scroll { max-height: 21rem; }
}
</style>
