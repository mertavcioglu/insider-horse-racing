<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { LANE_COUNT } from '../domain/raceProgram'
import { getRaceProgress, rankRacePositions } from '../domain/raceSimulation'
import { useRaceStore } from '../stores/race'
import GallopingHorse from './GallopingHorse.vue'
import LiveLeaderboard, { type Standing } from './LiveLeaderboard.vue'

const props = defineProps<{ stopConfirmationOpen: boolean }>()
const { simulation, elapsedMs, status, results, playbackSpeed } = storeToRefs(useRaceStore())
const moving = computed(() => status.value === 'running' && !props.stopConfirmationOpen)

const hoveredLane = ref<number>()
const focusedLane = ref<number>()
const inspectedLane = computed(() => hoveredLane.value ?? focusedLane.value)

function dismissHorseInfo() {
  hoveredLane.value = undefined
  focusedLane.value = undefined
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && !props.stopConfirmationOpen && inspectedLane.value !== undefined) {
    dismissHorseInfo()
  }
}

onMounted(() => window.addEventListener('keydown', handleEscape))
onUnmounted(() => window.removeEventListener('keydown', handleEscape))

function hoverLane(event: PointerEvent, lane: number) {
  if (event.pointerType !== 'touch') hoveredLane.value = lane
}

function selectHorse(event: MouseEvent, lane: number) {
  focusedLane.value = event instanceof PointerEvent && event.pointerType === 'mouse' ? undefined : lane
}

const winningResult = computed(() => {
  if (status.value !== 'transition' && status.value !== 'finished') return
  const result = results.value.at(-1)
  if (result?.round === simulation.value?.round.number) return result
})
const winner = computed(() => winningResult.value?.entries[0])

const positions = computed(() => {
  const race = simulation.value
  if (!race) return []

  return race.runners.map(runner => ({
    runner,
    progress: getRaceProgress(runner, race.round.distance, elapsedMs.value),
  }))
})

const standings = shallowRef<Standing[]>([])
const leaderboardTick = computed(() => Math.floor(elapsedMs.value / 250))

// Sample the existing frame data so the table stays readable and only updates a few times per second.
watch([simulation, leaderboardTick, status], ([race], [previousRace]) => {
  const previousRanks = new Map(
    race === previousRace ? standings.value.map(({ horse }, index) => [horse.id, index]) : [],
  )
  if (race !== previousRace) dismissHorseInfo()
  standings.value = rankRacePositions(positions.value).map(({ runner: { horse } }, index) => ({
    horse,
    change: (previousRanks.get(horse.id) ?? index) - index,
  }))
})
</script>

<template>
  <section class="panel" aria-labelledby="track-title">
    <h2 id="track-title" class="panel-title track-heading" :class="{ 'winner-announcement': winner }">
      <span class="visually-hidden">Race Track</span>
      <template v-if="winner">
        <span class="winner-name" aria-hidden="true" :title="winner.horse.name">Winner: {{ winner.horse.name }}!</span>
        <span class="winner-time" aria-hidden="true">{{ winner.finishSeconds.toFixed(2) }} s</span>
      </template>
      <span v-else aria-hidden="true">Race Track</span>
    </h2>
    <div class="track">
      <div class="track-status" role="status">
        <template v-if="winningResult && winner">
          <span class="visually-hidden">Winner: {{ winner.horse.name }}, {{ winner.finishSeconds.toFixed(2) }} seconds. </span>
          <strong>Round {{ winningResult.round }} · {{ winningResult.distance }} m completed.</strong>
          <span v-if="status === 'transition'">{{ ' ' }}Round {{ winningResult.round + 1 }} starts shortly.</span>
          <span v-else>{{ ' ' }}All rounds complete.</span>
        </template>
        <template v-else-if="simulation">
          <strong>Round {{ simulation.round.number }} · {{ simulation.round.distance }} m</strong>
          <span v-if="status === 'paused'"> · Paused</span>
        </template>
        <template v-else-if="status === 'stopped'">Race stopped. Select Generate Program to race again.</template>
        <template v-else-if="status === 'ready'">Program ready. Select Start to begin round 1.</template>
        <template v-else>Select Generate Program to create six rounds.</template>
      </div>
      <div class="track-labels" aria-hidden="true"><span>Start</span><span>Finish</span></div>
      <ol class="lanes" aria-label="Race lanes">
        <li v-for="(position, index) in simulation ? positions : LANE_COUNT" :key="index"
          @pointerenter="typeof position !== 'number' && hoverLane($event, index + 1)"
          @pointerleave="hoveredLane = undefined">
          <span class="lane-number">{{ index + 1 }}</span>
          <template v-if="typeof position !== 'number'">
            <div class="lane-course">
              <div class="lane-travel" :style="{ '--progress': `${position.progress * 100}%` }">
                <button type="button" class="horse-marker"
                  :aria-label="position.runner.horse.name + (position.progress === 1 ? ', finished' : '')"
                  :aria-describedby="`horse-info-${index + 1}`"
                  :style="{ '--horse-color': position.runner.horse.color }"
                  @focus="focusedLane = index + 1" @blur="focusedLane = undefined"
                  @click="selectHorse($event, index + 1)">
                  <GallopingHorse :gait="position.progress < 1" :paused="!moving" />
                </button>
                <span v-if="position.progress === 1" class="finish-label" aria-hidden="true">Finished</span>
              </div>
            </div>
            <div v-show="inspectedLane === index + 1" :id="`horse-info-${index + 1}`"
              class="horse-info" :class="{ 'horse-info-start': position.progress >= .5 }" role="tooltip">
              <strong>{{ position.runner.horse.name }}</strong>
              <span>Lane {{ index + 1 }} · Condition {{ position.runner.horse.condition }}/100</span>
            </div>
          </template>
        </li>
      </ol>
      <LiveLeaderboard v-if="standings.length" :key="simulation?.round.number" :standings="standings"
        :animate="moving && playbackSpeed < 4" :fast="playbackSpeed === 2"
        :complete="status === 'transition' || status === 'finished'" />
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
li { position: relative; display: flex; min-height: clamp(2rem, 5vh, 3rem); }
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
  --marker-width: 2.9rem;
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
  flex: 0 0 var(--marker-width);
  height: 1.7rem;
  padding: 0;
  border: 0;
  border-radius: .2rem;
  background: transparent;
  color: var(--horse-color);
  cursor: pointer;
}
.horse-marker:focus-visible { outline: 2px solid #36574b; outline-offset: -2px; }
.horse-marker svg { display: block; width: 100%; height: 100%; }
.horse-info {
  position: absolute;
  z-index: 1;
  inset-block-start: 50%;
  inset-inline-end: .4rem;
  transform: translateY(-50%);
  max-width: calc(100% - 3rem);
  padding: .15rem .4rem;
  border-radius: .3rem;
  background: #192a26;
  color: #fff;
  font-size: .6875rem;
  line-height: 1.2;
  pointer-events: none;
}
.horse-info-start { inset-inline-start: 2.4rem; inset-inline-end: auto; }
.horse-info strong { display: block; font-size: .75rem; }
.track-heading {
  display: flex;
  align-items: center;
  gap: .55rem;
  block-size: 3.2rem;
}
.track-status {
  block-size: 2.5rem;
  overflow: hidden;
  margin: 0 0 .75rem;
  color: var(--muted);
  font-size: .875rem;
  line-height: 1.25rem;
}
.track-status strong { color: #192a26; }
.winner-announcement { background: #faf5e8; color: #5d4a26; }
.winner-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.winner-time { flex: none; font-size: .875rem; font-variant-numeric: tabular-nums; }
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.finish-label { display: none; }

@media (prefers-reduced-motion: reduce) {
  .lane-course { padding-inline: .35rem; }
  .lane-travel { display: flex; align-items: center; gap: .5rem; transform: none; }
  .finish-label { display: inline; font-size: .75rem; font-weight: 650; }
  .horse-info { inset-inline-start: auto; inset-inline-end: .4rem; }
}
</style>
