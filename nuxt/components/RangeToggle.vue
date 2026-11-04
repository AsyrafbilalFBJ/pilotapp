<script setup lang="ts">
import { SUMMARY_RANGES, type SummaryRange } from '~/types/api'

const model = defineModel<SummaryRange>({ required: true })
defineProps<{ disabled?: boolean }>()
</script>

<template>
  <div class="range-toggle" role="radiogroup" aria-label="Rolling sum range">
    <button
      v-for="range in SUMMARY_RANGES"
      :key="range"
      type="button"
      role="radio"
      :aria-checked="model === range"
      :disabled="disabled"
      class="range-toggle__option"
      :class="{ 'is-selected': model === range }"
      @click="model = range"
    >
      {{ range }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.range-toggle {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
  padding: 3px;
  border-radius: var(--radius-pill);
  background: var(--color-track);
}

.range-toggle__option {
  min-height: 32px;
  border: 0;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;

  &.is-selected {
    background: var(--color-navy);
    color: #fff;
  }

  &:disabled {
    cursor: progress;
  }
}
</style>
