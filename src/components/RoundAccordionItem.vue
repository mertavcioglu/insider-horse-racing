<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  id: string
  open: boolean
  state?: 'active' | 'completed'
}>()
const emit = defineEmits<{ toggle: [] }>()
const trigger = ref<HTMLButtonElement | null>(null)

watch(() => props.open, open => {
  const button = trigger.value
  const scrollArea = button?.closest('.table-scroll')
  if (!open || !button || !scrollArea) return

  const header = button.getBoundingClientRect()
  const viewport = scrollArea.getBoundingClientRect()
  if (header.top < viewport.top || header.bottom > viewport.bottom) {
    scrollArea.scrollTop += header.top - viewport.top
  }
}, { flush: 'post' })
</script>

<template>
  <h3 class="round-heading">
    <button ref="trigger" type="button" class="round-trigger" :class="state"
      :id="`${id}-heading`" :aria-controls="id" :aria-expanded="open"
      :aria-current="state === 'active' ? 'step' : undefined" @click="emit('toggle')">
      <span><slot name="heading" /></span>
      <span class="chevron" aria-hidden="true" />
    </button>
  </h3>
  <div v-show="open" :id="id">
    <slot />
  </div>
</template>

<style scoped>
.round-heading { margin: 0; }
.round-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .6rem;
  width: 100%;
  min-height: 3.2rem;
  padding: .55rem .65rem;
  border: 0;
  border-bottom: 1px solid var(--line);
  background: #f3f6fb;
  color: inherit;
  font-size: .8125rem;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}
.round-trigger:hover { filter: brightness(.97); }
.round-trigger:focus-visible { outline: 2px solid #14785e; outline-offset: -3px; }
.round-trigger.active { background: #d4edb5; }
.round-trigger.completed { background: #edf6ef; }
.chevron {
  flex: 0 0 .45rem;
  height: .45rem;
  border-right: 2px solid var(--muted);
  border-bottom: 2px solid var(--muted);
  transform: rotate(45deg);
}
[aria-expanded='true'] .chevron { transform: rotate(225deg); }
</style>
