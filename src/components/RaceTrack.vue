<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { LANE_COUNT } from '../domain/raceProgram'
import { getRaceProgress } from '../domain/raceSimulation'
import { useRaceStore } from '../stores/race'

const { simulation, elapsedMs, status } = storeToRefs(useRaceStore())

const laneProgress = computed(() => {
  const race = simulation.value
  if (!race) return []

  return race.runners.map(runner => getRaceProgress(runner, race.round.distance, elapsedMs.value))
})
</script>

<template>
  <section class="panel" aria-labelledby="track-title">
    <h2 id="track-title" class="panel-title">Race Track</h2>
    <div class="track">
      <p class="track-status" role="status">
        <template v-if="simulation">
          <strong>Round {{ simulation.round.number }} · {{ simulation.round.distance }} m</strong>
          <span v-if="status === 'paused'"> · Paused</span>
          <span v-else-if="status === 'transition'"> · Complete. Round {{ simulation.round.number + 1 }} starts shortly.</span>
          <span v-else-if="status === 'finished'"> · All rounds complete. Generate a new program to race again.</span>
        </template>
        <template v-else-if="status === 'ready'">Program ready. Select Start to begin round 1.</template>
        <template v-else>Select Generate Program to create six rounds.</template>
      </p>
      <div class="track-labels" aria-hidden="true"><span>Start</span><span>Finish</span></div>
      <ol class="lanes" aria-label="Race lanes">
        <li v-for="lane in LANE_COUNT" :key="lane">
          <span class="lane-number">{{ lane }}</span>
          <div v-if="simulation?.runners[lane - 1]" class="lane-course">
            <div class="lane-travel" :style="{ '--progress': `${laneProgress[lane - 1] * 100}%` }">
              <span
                class="horse-marker"
                role="img"
                :aria-label="simulation.runners[lane - 1].horse.name + (laneProgress[lane - 1] === 1 ? ', finished' : '')"
                :title="simulation.runners[lane - 1].horse.name"
                :style="{ '--horse-color': simulation.runners[lane - 1].horse.color }"
                data-runner
              >&#x265E;</span>
              <span v-if="laneProgress[lane - 1] === 1" class="finish-label" aria-hidden="true">Finished</span>
            </div>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.track { padding: .75rem 1rem 1rem; }
.track-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: .4rem;
  color: var(--muted);
  font-size: .75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
}
.lanes {
  margin: 0;
  padding: 0;
  list-style: none;
  border-right: .4rem solid #36574b;
  border-block: 1px solid var(--line);
  background: #edf2df;
}
li { display: flex; min-height: clamp(2rem, 5vh, 3rem); }
li:nth-child(even) { background: #e5ecd5; }
li + li { border-top: 1px dashed #96a77d; }
.lane-number {
  display: grid;
  place-items: center;
  flex: 0 0 2rem;
  background: #36574b;
  color: #fff;
  font-size: .8125rem;
  font-weight: 700;
}
.lane-course {
  --marker-width: 1.85rem;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  padding-right: var(--marker-width);
  overflow: hidden;
}
.lane-travel { width: 100%; transform: translateX(var(--progress)); }
.horse-marker {
  display: grid;
  place-items: center;
  width: var(--marker-width);
  height: 1.6rem;
  border: 2px solid var(--horse-color);
  border-radius: .35rem;
  background: white;
  color: #203415;
  font-size: 1.05rem;
  line-height: 1;
}
.track-status { min-height: 1.25rem; margin: 0 0 .75rem; color: var(--muted); font-size: .875rem; }
.track-status strong { color: #192a26; }
.finish-label { display: none; }

@media (prefers-reduced-motion: reduce) {
  .lane-course { padding-inline: .35rem; }
  .lane-travel { display: flex; align-items: center; gap: .5rem; transform: none; }
  .finish-label { display: inline; font-size: .75rem; font-weight: 650; }
}
</style>
