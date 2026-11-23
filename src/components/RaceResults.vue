<script setup lang="ts">
import type { RoundResult } from '../domain/raceSimulation'

defineProps<{ results: readonly RoundResult[] }>()
</script>

<template>
  <section class="panel" aria-labelledby="results-title">
    <h2 id="results-title" class="panel-title">Results</h2>
    <p v-if="!results.length" class="empty-state">Results appear after each round.</p>
    <div v-else class="table-scroll" tabindex="0" role="region" aria-labelledby="results-title">
      <table v-for="result in results" :key="result.round">
        <caption>Round {{ result.round }} · {{ result.distance }} m</caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Horse</th>
            <th scope="col" class="time">Time (s)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="({ horse, finishSeconds }, index) in result.entries" :key="horse.id">
            <td>{{ index + 1 }}</td>
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
    </div>
  </section>
</template>

<style scoped>
.panel-title { background: #e6f3ec; }
caption { padding: .65rem; background: #eff7f2; font-weight: 700; text-align: left; }
th, td { padding-inline: .35rem; }
tbody th { font-weight: 550; }
.horse { display: flex; align-items: center; gap: .3rem; }
.swatch { flex: 0 0 .55rem; height: .55rem; border-radius: 50%; }
.time { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
</style>
