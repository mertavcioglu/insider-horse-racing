<script setup lang="ts">
import type { Horse } from '../domain/horse'

defineProps<{ horses: readonly Horse[] }>()
</script>

<template>
  <section class="panel horse-list" aria-labelledby="horse-list-title">
    <h2 id="horse-list-title" class="panel-title">Horse List <span>{{ horses.length }}</span></h2>
    <div class="table-scroll" tabindex="0" role="region" aria-labelledby="horse-list-title">
      <table aria-labelledby="horse-list-title">
        <thead>
          <tr>
            <th scope="col">Horse</th>
            <th scope="col" class="condition">Condition</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="horse in horses" :key="horse.id">
            <th scope="row">
              <span class="horse-name">
                <span class="swatch" :style="{ backgroundColor: horse.color }" aria-hidden="true" />
                {{ horse.name }}
              </span>
            </th>
            <td class="condition">{{ horse.condition }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.panel-title { background: #f1f5dc; }
.panel-title span { margin-inline-start: .35rem; color: var(--muted); font-size: .8125rem; }
thead { position: sticky; top: 0; }
tbody th { font-weight: 550; }
.horse-name { display: flex; align-items: center; gap: .5rem; }
.swatch { flex: 0 0 .75rem; height: .75rem; border: 1px solid #192a2655; border-radius: 50%; }
.condition { text-align: right; font-variant-numeric: tabular-nums; }
</style>
