<script setup lang="ts">
import type { RaceRound } from '../domain/raceProgram'

defineProps<{ rounds: readonly RaceRound[] }>()
</script>

<template>
  <section class="panel" aria-labelledby="program-title">
    <h2 id="program-title" class="panel-title">Program</h2>
    <p v-if="!rounds.length" class="empty-state">Generate a program to see the lineups.</p>
    <div v-else class="table-scroll" tabindex="0" role="region" aria-labelledby="program-title">
      <table v-for="round in rounds" :key="round.number">
        <caption>Round {{ round.number }} · {{ round.distance }} m</caption>
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
tbody th { font-weight: 550; }
</style>
