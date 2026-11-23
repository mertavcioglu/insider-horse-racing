<script setup lang="ts">
import { ref, watch } from 'vue'
import type { RaceRound } from '../domain/raceProgram'

const props = defineProps<{
  rounds: readonly RaceRound[]
  activeRound?: number
  completedCount: number
}>()

const programScroll = ref<HTMLDivElement | null>(null)

watch(() => props.rounds, () => {
  if (programScroll.value) programScroll.value.scrollTop = 0
}, { flush: 'post' })

watch(() => props.activeRound, round => {
  const panel = programScroll.value
  const caption = panel?.querySelector('caption[aria-current="step"]')
  if (!round || !panel || !caption) return

  // Scroll the program panel without moving the page or stealing focus.
  panel.scrollTop += caption.getBoundingClientRect().top - panel.getBoundingClientRect().top
}, { flush: 'post' })
</script>

<template>
  <section class="panel" aria-labelledby="program-title">
    <h2 id="program-title" class="panel-title">Program</h2>
    <p v-if="!rounds.length" class="empty-state">Generate a program to see the lineups.</p>
    <div v-else ref="programScroll" class="table-scroll" tabindex="0" role="region" aria-labelledby="program-title">
      <table v-for="round in rounds" :key="round.number">
        <caption
          :class="{ active: activeRound === round.number, complete: round.number <= completedCount }"
          :aria-current="activeRound === round.number ? 'step' : undefined"
        >
          Round {{ round.number }} · {{ round.distance }} m
          <span v-if="activeRound === round.number">Active</span>
          <span v-else-if="round.number <= completedCount">Complete</span>
          <span v-else>Upcoming</span>
        </caption>
        <thead>
          <tr>
            <th scope="col">Lane</th>
            <th scope="col">Horse</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(horse, index) in round.participants" :key="horse.id">
            <td>{{ index + 1 }}</td>
            <th scope="row">{{ horse.name }}</th>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.panel-title { background: #e6edf9; }
caption { padding: .65rem; background: #eef3fb; font-weight: 700; text-align: left; }
caption.active { background: #d4edb5; }
caption.complete { background: #e6f3ec; }
caption span { display: block; margin-top: .15rem; color: var(--muted); font-size: .75rem; }
tbody th { font-weight: 550; }
</style>
