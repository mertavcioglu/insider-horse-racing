<script lang="ts">
import type { Horse } from '../domain/horse'

export interface Standing {
  readonly horse: Horse
  readonly change: number
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ standings: readonly Standing[]; complete: boolean; animate: boolean; fast: boolean }>()
const animateRanks = computed(() => props.animate && props.standings.every(row => Math.abs(row.change) <= 2))
</script>

<template>
  <section class="leaderboard" aria-labelledby="leaderboard-title">
    <div class="leaderboard-header">
      <h3 id="leaderboard-title">Live Leaderboard</h3>
      <span>{{ complete ? 'Round complete' : 'Provisional' }}</span>
    </div>
    <div class="standings-scroll" tabindex="0" role="region" aria-labelledby="leaderboard-title">
      <TransitionGroup tag="ol" class="standings" role="list"
        :class="{ animated: animateRanks, fast }" move-class="rank-move">
        <li v-for="({ horse, change }, index) in standings" :key="horse.id" :class="{ leading: index < 3 }">
          <span class="rank">{{ index + 1 }}</span>
          <span class="standing-horse">
            <span class="color-dot" :style="{ backgroundColor: horse.color }" aria-hidden="true" />
            <span class="standing-name">{{ horse.name }}</span>
          </span>
          <span v-if="change && !complete" class="change" role="img" :class="{ gained: change > 0, lost: change < 0 }"
            :aria-label="`${change > 0 ? 'Up' : 'Down'} ${Math.abs(change)}`">
            {{ change > 0 ? '↑' : '↓' }}
          </span>
        </li>
      </TransitionGroup>
    </div>
  </section>
</template>

<style scoped>
.leaderboard { margin-top: .8rem; }
.leaderboard-header { display: flex; justify-content: space-between; flex-wrap: wrap; align-items: baseline; gap: .3rem .6rem; margin-bottom: .45rem; }
h3 { margin: 0; font-size: .875rem; }
.leaderboard-header span { color: var(--muted); font-size: .75rem; }
.standings-scroll { max-height: 7.5rem; overflow-y: auto; border: 1px solid var(--line); border-radius: .4rem; }
.standings-scroll:focus-visible { outline: 2px solid #14785e; outline-offset: 2px; }
.standings { list-style: none; margin: 0; padding: 0; }
li { display: grid; grid-template-columns: 1.35rem minmax(0, 1fr) 1.25rem; gap: .35rem; align-items: center; padding: .3rem .5rem; min-height: 2rem; background: var(--surface); font-size: .8125rem; }
li + li { border-top: 1px solid var(--line); }
.leading { background: #edf4e4; font-weight: 650; }
.rank { font-variant-numeric: tabular-nums; }
.standing-horse { display: flex; align-items: center; gap: .4rem; }
.color-dot { flex: 0 0 .55rem; height: .55rem; border-radius: 50%; }
.change { text-align: center; }
.gained { color: #16623f; }
.lost { color: #9a3333; }

@media (prefers-reduced-motion: no-preference) {
  .animated .rank-move { transition: transform 160ms ease-out; }
  .animated.fast .rank-move { transition-duration: 110ms; }
}
</style>
