<script setup lang="ts">
import { Calendar, CircleCheck, CircleX, TriangleAlert } from 'lucide-vue-next'
import type { DocumentStatus, PilotDocument } from '~/types/api'

defineProps<{ documents: PilotDocument[] }>()

const STATUS = {
  safe: { label: 'Safe', icon: CircleCheck },
  soon: { label: 'Expiring Soon', icon: TriangleAlert },
  expired: { label: 'Expired', icon: CircleX },
} as const satisfies Record<DocumentStatus, { label: string; icon: unknown }>

function days(count: number): string {
  return `${count} ${count === 1 ? 'day' : 'days'}`
}

/** Text after the date, from the API's daysRemaining (0 or less means expired). */
function remainingText(doc: PilotDocument): string {
  if (doc.daysRemaining > 0) return `${days(doc.daysRemaining)} left`
  if (doc.daysRemaining === 0) return 'expired today'
  return `expired ${days(-doc.daysRemaining)} ago`
}
</script>

<template>
  <ul class="doc-list">
    <li v-for="doc in documents" :key="doc.id" class="doc" :class="`doc--${doc.status}`">
      <div class="doc__top">
        <h3 class="doc__label">{{ doc.label }}</h3>
        <span class="badge">
          <component :is="STATUS[doc.status].icon" :size="15" :stroke-width="2.25" aria-hidden="true" />
          {{ STATUS[doc.status].label }}
        </span>
      </div>
      <p class="doc__expiry">
        <Calendar :size="15" :stroke-width="1.75" class="doc__icon" aria-hidden="true" />
        <time :datetime="doc.expiryDate" class="doc__date">{{ doc.formattedExpiryDate }}</time>
        <span class="doc__remaining">· {{ remainingText(doc) }}</span>
      </p>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.doc-list {
  margin: 0;
  padding: 0 var(--space-5);
  list-style: none;
  border-radius: var(--radius-card);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.doc {
  --status-bg: rgb(31 191 143 / 14%);
  --status-fg: #11835f;
  --remaining-fg: var(--color-text-muted);

  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4) 0;

  & + & {
    border-top: 1px solid var(--color-line);
  }

  &--soon {
    --status-bg: rgb(245 158 11 / 16%);
    --status-fg: #92580a;
    --remaining-fg: #92580a;
  }

  &--expired {
    --status-bg: rgb(230 55 87 / 12%);
    --status-fg: #c11f41;
    --remaining-fg: #c11f41;
  }
}

.doc__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.doc__label {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
}

.badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  background: var(--status-bg);
  color: var(--status-fg);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.doc__expiry {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.doc__icon {
  color: var(--color-text-muted);
}

.doc__date {
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.doc__remaining {
  color: var(--remaining-fg);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
</style>
