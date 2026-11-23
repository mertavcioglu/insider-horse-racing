<script setup lang="ts">
import { ref, watch } from 'vue'
import type { RoundResult } from '../domain/raceSimulation'
import RoundAccordionItem from './RoundAccordionItem.vue'

const props = defineProps<{ results: readonly RoundResult[] }>()
const openRound = ref<number>()
const rankClasses = ['gold', 'silver', 'bronze'] as const

watch(() => props.results.at(-1)?.round, round => {
  openRound.value = round
}, { immediate: true })
</script>

<template>
  <section class="panel" aria-labelledby="results-title">
    <h2 id="results-title" class="panel-title">Results</h2>
    <p v-if="!results.length" class="empty-state">Race results will appear here as each round finishes.</p>
    <div v-else class="table-scroll" tabindex="0" role="region" aria-labelledby="results-title">
      <RoundAccordionItem v-for="result in results" :key="result.round" :id="`result-round-${result.round}`"
        :open="openRound === result.round" state="completed"
        @toggle="openRound = openRound === result.round ? undefined : result.round">
        <template #heading>
          Round {{ result.round }} · {{ result.distance }} m
          <small>Winner: {{ result.entries[0]?.horse.name }}</small>
        </template>
        <table :aria-labelledby="`result-round-${result.round}-heading`">
          <thead>
            <tr>
              <th class="rank-column" scope="col" aria-label="Rank">#</th>
              <th scope="col">Horse</th>
              <th scope="col" class="time">Time (s)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="({ horse, finishSeconds }, index) in result.entries" :key="horse.id">
              <td class="rank-column"><span class="rank" :class="rankClasses[index]">{{ index + 1 }}</span></td>
              <th scope="row">
                <span class="horse">
                  <span class="swatch" :style="{ backgroundColor: horse.color }" aria-hidden="true" />
                  {{ horse.name }}
                </span>
              </th>
              <td class="time">{{ finishSeconds.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </RoundAccordionItem>
    </div>
  </section>
</template>

<style scoped>
.panel-title { background: #e6f3ec; }
small { display: block; margin-top: .15rem; color: var(--muted); font-size: .75rem; }
th, td { padding-inline: .35rem; }
.rank-column { width: 2.35rem; text-align: center; }
.rank {
  display: inline-grid;
  place-items: center;
  width: 1.55rem;
  height: 1.55rem;
  border-radius: 50%;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.gold { background: #f2d487; color: #523a06; }
.silver { background: #dce4ec; color: #2d4055; }
.bronze { background: #edc3a7; color: #592d16; }
tbody th { font-weight: 550; }
.horse { display: flex; align-items: center; gap: .3rem; }
.swatch { flex: 0 0 .55rem; height: .55rem; border-radius: 50%; }
.time { width: 4.4rem; text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
</style>
