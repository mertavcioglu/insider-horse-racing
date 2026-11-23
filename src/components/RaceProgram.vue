<script setup lang="ts">
import { ref, watch } from 'vue'
import type { RaceRound } from '../domain/raceProgram'
import RoundAccordionItem from './RoundAccordionItem.vue'

const props = defineProps<{
  rounds: readonly RaceRound[]
  activeRound?: number
  completedCount: number
}>()

const programScroll = ref<HTMLDivElement | null>(null)
const openRound = ref<number>()

watch(() => props.rounds, rounds => {
  openRound.value = rounds[0]?.number
  if (programScroll.value) programScroll.value.scrollTop = 0
}, { immediate: true })

watch(() => props.activeRound, round => {
  if (round !== undefined) openRound.value = round
})
</script>

<template>
  <section class="panel" aria-labelledby="program-title">
    <h2 id="program-title" class="panel-title">Program</h2>
    <p v-if="!rounds.length" class="empty-state">Generate a program to see the lineups.</p>
    <div v-else ref="programScroll" class="table-scroll" tabindex="0" role="region" aria-labelledby="program-title">
      <RoundAccordionItem v-for="round in rounds" :key="round.number" :id="`program-round-${round.number}`"
        :open="openRound === round.number"
        :state="activeRound === round.number ? 'active' : round.number <= completedCount ? 'completed' : undefined"
        @toggle="openRound = openRound === round.number ? undefined : round.number">
        <template #heading>
          Round {{ round.number }} · {{ round.distance }} m
          <small v-if="activeRound === round.number">Active</small>
          <small v-else-if="round.number <= completedCount">Completed</small>
          <small v-else>Upcoming</small>
        </template>
        <table :aria-labelledby="`program-round-${round.number}-heading`">
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
      </RoundAccordionItem>
    </div>
  </section>
</template>

<style scoped>
.panel-title { background: #e6edf9; }
small { display: block; margin-top: .15rem; color: var(--muted); font-size: .75rem; }
tbody th { font-weight: 550; }
</style>
