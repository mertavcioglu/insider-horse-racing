<script setup lang="ts">
defineProps<{ gait?: boolean; paused?: boolean }>()
</script>

<template>
  <svg viewBox="0 0 64 36" aria-hidden="true" focusable="false" fill="currentColor"
    :class="{ gait, paused }">
    <g stroke="#24362f" stroke-width=".8" stroke-linejoin="round" paint-order="stroke fill">
      <!-- Extended, gathered, and push-off poses share the same shoulders and hips. -->
      <path class="legs extended"
        d="m20 21-5 5-8 6 3 1 9-5 7-2-2 4-7 4 3 1 8-4 3-8z m17-3 7 4 7 6 3-1-7-8-5-3z m4 3 4 5 3 6 3 1-3-9-3-5z" />
      <path class="legs gathered"
        d="m20 21 5 5 6 2-1 3-8-2-5-6z m6 1 5 3 4-1 1 2-6 2-5-2z m12-4 3 6-5 3 1 3 7-4-2-8z m4 1 5 5-3 5-3 1 1-2 2-4-4-3z" />
      <path class="legs push-off"
        d="m20 21-4 5-7 7 3 1 8-6 5-4z m5 1-1 6-5 5 3 1 6-5 2-7z m12-4 7 4 8-1 2 2-10 2-7-4z m5 1 5 4 7 4 3-1-7-6-7-3z" />
      <path
        d="M23 14c-4-2-7-2-10 0-4 3-7 4-12 2 3 4 8 5 12 3l5-2
           c-1 3 0 5 2 7 3 1 5 0 7-2 4 1 8 0 11-2
           l5-2 2-5 5-4 3 3 6 1 2-2-3-3-3-2-1-4-2 3-2-2v4
           c-6 1-9 3-13 8-6 2-11-1-16 0Z"
      />
    </g>
    <path fill="#24362f" d="m52 8 2-1 1 1-2 1Z" />
  </svg>
</template>

<style scoped>
.gathered, .push-off { opacity: 0; }

@media (prefers-reduced-motion: no-preference) {
  .gait .legs { animation: stride .48s steps(1, end) infinite; }
  .gait .gathered { animation-delay: -.32s; }
  .gait .push-off { animation-delay: -.16s; }
  .gait.paused .legs { animation-play-state: paused; }
}

@keyframes stride {
  0% { opacity: 1; }
  33.333% { opacity: 0; }
}
</style>
