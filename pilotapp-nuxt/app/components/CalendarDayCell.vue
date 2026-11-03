<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import type { CalendarDay } from '~/types/api'

const props = defineProps<{ day: CalendarDay }>()

const schedule = computed(() => props.day.schedule)

/** Completed days (status 2) are filled; upcoming days (status 1) are outlined. */
const style = computed(() => {
  const entry = schedule.value
  if (!entry) return undefined
  return entry.status === 2
    ? { '--duty': entry.base_color, color: readableTextOn(entry.base_color) }
    : { '--duty': entry.base_color }
})

const description = computed(() => {
  const entry = schedule.value
  if (!entry) return `${props.day.day}, no duty`
  const progress = entry.is_complete
    ? 'all duties logged'
    : `${entry.remaining_duties} of ${entry.count_schedules} duties left`
  const state = entry.status === 2 ? 'completed' : 'upcoming'
  return `${props.day.day}, ${entry.duty_type} ${entry.base_name}, ${state}, ${progress}`
})
</script>

<template>
  <NuxtLink
    :to="`/schedule/${day.date}`"
    class="day"
    :class="{
      'day--duty': schedule,
      'day--completed': schedule?.status === 2,
      'day--upcoming': schedule?.status === 1,
      'day--today': day.isToday,
    }"
    :style="style"
    :aria-label="description"
    :aria-current="day.isToday ? 'date' : undefined"
  >
    <span class="day__top">
      <span class="day__number num">{{ day.day }}</span>
      <template v-if="schedule">
        <span v-if="schedule.is_complete" class="day__status day__status--done" aria-hidden="true">
          <Check :size="10" :stroke-width="3.5" />
        </span>
        <span v-else class="day__status day__status--left num" aria-hidden="true">
          {{ schedule.remaining_duties }}
        </span>
      </template>
    </span>
    <span v-if="schedule" class="day__base">{{ schedule.base_name }}</span>
  </NuxtLink>
</template>

<style scoped lang="scss">
.day {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 60px;
  padding: 6px 5px;
  border: 1.5px solid transparent;
  border-radius: var(--radius-small);
  background: var(--color-surface);
  color: var(--color-text);
  text-decoration: none;
}

.day--completed {
  background: var(--duty);
}

.day--upcoming {
  border-color: var(--duty);
  background: color-mix(in srgb, var(--duty) 14%, white);
}

// Today gets a navy ring outside the cell so it reads on any duty colour.
.day--today {
  box-shadow: 0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-navy);
}

// Number and status share one row so two-digit days never sit under the badge.
.day__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2px;
}

.day__number {
  font-size: 13px;
  line-height: 1;
}

.day__base {
  overflow: hidden;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.day__status {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  color: var(--color-navy);
  font-size: 10px;
  box-shadow: 0 0 0 1px rgb(14 33 56 / 10%);
}

.day__status--left {
  background: var(--color-navy);
  color: #fff;
  box-shadow: none;
}
</style>
