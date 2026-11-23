<script setup lang="ts">
import type { RoundResult } from '../domain/raceSimulation'

defineProps<{ result: RoundResult }>()

const medals = ['Gold', 'Silver', 'Bronze'] as const
</script>

<template>
  <section class="podium" aria-labelledby="podium-title">
    <h3 id="podium-title">Round {{ result.round }} Podium</h3>
    <ol role="list">
      <li v-for="({ horse, finishSeconds }, index) in result.entries.slice(0, medals.length)" :key="horse.id">
        <span class="medal" :class="medals[index].toLowerCase()" role="img" :aria-label="`Place ${index + 1}, ${medals[index]}`">
          {{ index + 1 }}
        </span>
        <span class="podium-horse">
          <span class="color-dot" :style="{ backgroundColor: horse.color }" aria-hidden="true" />
          <span class="podium-name">{{ horse.name }}</span>
        </span>
        <span class="podium-time">{{ finishSeconds.toFixed(2) }} s</span>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.podium { padding: .65rem .55rem; background: #faf8f0; border-bottom: 1px solid var(--line); }
h3 { font-size: .875rem; margin: 0 0 .45rem; }
ol { list-style: none; margin: 0; padding: 0; display: grid; gap: .3rem; }
li { display: grid; grid-template-columns: 1.4rem minmax(0, 1fr) auto; gap: .35rem; align-items: center; font-size: .75rem; }
.medal { display: grid; place-items: center; aspect-ratio: 1; border-radius: 50%; font-weight: 750; }
.gold { background: #f2d487; color: #523a06; }
.silver { background: #dce4ec; color: #2d4055; }
.bronze { background: #edc3a7; color: #592d16; }
.podium-horse { display: flex; align-items: center; gap: .28rem; font-weight: 650; }
.color-dot { flex: 0 0 .45rem; height: .45rem; border-radius: 50%; }
.podium-name { overflow-wrap: anywhere; }
.podium-time { font-variant-numeric: tabular-nums; white-space: nowrap; }
</style>
