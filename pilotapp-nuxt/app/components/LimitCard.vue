<script setup lang="ts">
import type { LimitCard } from '~/types/api'

const props = defineProps<{ card: LimitCard }>()

/** Bar fill; a card above its limit shows a full bar (the status already says "danger"). */
const fill = computed(() => `${Math.min(props.card.percentage, 100)}%`)
</script>

<template>
  <article class="limit-card" :class="`limit-card--${card.status}`">
    <header class="limit-card__head">
      <h3>{{ card.label }}</h3>
      <p>{{ card.windowDescription }}</p>
    </header>

    <p class="limit-card__value">
      <span class="num limit-card__current">{{ card.currentHours }}</span>
      <span class="limit-card__limit">of <span class="num">{{ card.limit }}</span> h</span>
    </p>

    <div
      class="limit-card__bar"
      role="meter"
      :aria-label="`${card.label} used`"
      aria-valuemin="0"
      :aria-valuemax="card.limit"
      :aria-valuenow="card.currentHours"
      :aria-valuetext="`${card.currentHours} of ${card.limit} hours, ${card.percentage}%`"
    >
      <span :style="{ width: fill }" />
    </div>

    <p class="limit-card__foot">
      <span class="num">{{ card.percentage }}%</span>
      <span v-if="card.isExceeded" class="limit-card__over">Over limit</span>
      <span v-else><span class="num">{{ card.remainingHours }}</span> h left</span>
    </p>
  </article>
</template>

<style scoped lang="scss">
.limit-card {
  --status-color: var(--color-success);

  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);

  &--warning {
    --status-color: var(--color-warning);
  }

  &--danger {
    --status-color: var(--color-danger);
  }
}

.limit-card__head {
  h3 {
    font-size: 14px;
    font-weight: 700;
  }

  p {
    color: var(--color-text-muted);
    font-size: 12px;
  }
}

// Hours and limit stack so every card keeps the same height, even for "1013.8".
.limit-card__value {
  display: flex;
  flex-direction: column;
}

.limit-card__current {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.limit-card__limit {
  color: var(--color-text-muted);
  font-size: 14px;
}

.limit-card__bar {
  height: 6px;
  overflow: hidden;
  border-radius: var(--radius-pill);
  background: var(--color-track);

  span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--status-color);
  }
}

.limit-card__foot {
  display: flex;
  justify-content: space-between;
  gap: var(--space-2);
  color: var(--color-text-muted);
  font-size: 12px;

  > .num {
    color: var(--status-color);
  }
}

.limit-card__over {
  color: var(--color-danger);
  font-weight: 700;
}
</style>
