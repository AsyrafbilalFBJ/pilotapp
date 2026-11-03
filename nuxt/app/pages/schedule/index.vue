<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
useHead({ title: 'Schedule · Susi Air Pilot' })

const today = useToday()
const route = useRoute()
const router = useRouter()

// The month lives in the URL (?year=&month=) so returning from a day keeps the month.
const viewMonth = computed(
  () => parseYearMonth(route.query.year, route.query.month) ?? yearMonthOf(today.value),
)

const schedule = useMonthlySchedule(viewMonth)

const loading = computed(() => schedule.status.value === 'pending')
const data = computed(() => schedule.data.value)

async function goToMonth(delta: number): Promise<void> {
  const target = shiftMonth(viewMonth.value, delta)
  await router.replace({ query: { year: target.year, month: target.month } })
}

// Monday-first, matching leadingBlankDays from the API.
const WEEKDAYS = [
  { short: 'Mon', long: 'Monday' },
  { short: 'Tue', long: 'Tuesday' },
  { short: 'Wed', long: 'Wednesday' },
  { short: 'Thu', long: 'Thursday' },
  { short: 'Fri', long: 'Friday' },
  { short: 'Sat', long: 'Saturday' },
  { short: 'Sun', long: 'Sunday' },
] as const
</script>

<template>
  <div class="schedule">
    <h1 class="schedule__title">Schedule</h1>

    <div class="month-nav">
      <button type="button" class="month-nav__button" aria-label="Previous month" :disabled="loading" @click="goToMonth(-1)">
        <ChevronLeft :size="20" aria-hidden="true" />
      </button>
      <h2 class="month-nav__label" aria-live="polite">{{ data?.monthLabel ?? '\u00A0' }}</h2>
      <button type="button" class="month-nav__button" aria-label="Next month" :disabled="loading" @click="goToMonth(1)">
        <ChevronRight :size="20" aria-hidden="true" />
      </button>
    </div>

    <SectionError
      v-if="schedule.error.value"
      :message="apiErrorMessage(schedule.error.value)"
      @retry="schedule.refresh()"
    />

    <template v-else>
      <div class="calendar" :class="{ 'is-loading': loading }" :aria-busy="loading">
        <div class="calendar__weekdays" aria-hidden="true">
          <span v-for="weekday in WEEKDAYS" :key="weekday.short">{{ weekday.short }}</span>
        </div>

        <ol v-if="data" class="calendar__grid" :aria-label="`Duties in ${data.monthLabel}`">
          <li v-for="n in data.leadingBlankDays" :key="`blank-${n}`" class="calendar__blank" aria-hidden="true" />
          <li v-for="day in data.days" :key="day.date">
            <CalendarDayCell :day="day" />
          </li>
        </ol>
        <div v-else class="calendar__placeholder" />
      </div>

      <section v-if="data" class="legend" aria-labelledby="legend-title">
        <h2 id="legend-title" class="legend__title">Legend</h2>

        <ul class="legend__duties">
          <li v-for="entry in data.legend" :key="entry.code">
            <span class="legend__swatch" :style="{ background: entry.color }" aria-hidden="true"></span>
            <span class="legend__code">{{ entry.code }}</span>
            <span>{{ entry.label }}</span>
          </li>
        </ul>

        <ul class="legend__marks">
          <li>
            <span class="mark mark--done" aria-hidden="true">✓</span>
            All duties logged
          </li>
          <li>
            <span class="mark mark--left num" aria-hidden="true">2</span>
            Duties still to log
          </li>
          <li>
            <span class="mark mark--filled" aria-hidden="true" />
            Completed day
          </li>
          <li>
            <span class="mark mark--outlined" aria-hidden="true" />
            Upcoming day
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
.schedule {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6) var(--space-5) 0;
}

.schedule__title {
  font-size: 24px;
  font-weight: 800;
}

.month-nav {
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
}

.month-nav__label {
  font-size: 18px;
  font-weight: 800;
  text-align: center;
}

.month-nav__button {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--color-line);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-navy);
  cursor: pointer;

  &:disabled {
    cursor: progress;
    opacity: 0.5;
  }
}

.calendar {
  padding: var(--space-3);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.calendar.is-loading {
  opacity: 0.55;
}

.calendar__weekdays,
.calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
}

.calendar__weekdays {
  margin-bottom: var(--space-2);
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 700;
  text-align: center;
}

.calendar__grid {
  margin: 0;
  padding: 0;
  list-style: none;
}

// Narrow phones: less padding and gap give each day cell more width (see CalendarDayCell).
@media (max-width: 379px) {
  .calendar {
    padding: var(--space-2);
  }

  .calendar__weekdays,
  .calendar__grid {
    gap: 4px;
  }

  .calendar__weekdays {
    font-size: 10px;
  }
}

@media (max-width: 340px) {
  .schedule {
    padding-right: var(--space-4);
    padding-left: var(--space-4);
  }

  .calendar {
    padding: 6px;
  }

  .calendar__weekdays,
  .calendar__grid {
    gap: 3px;
  }
}

.calendar__placeholder {
  height: 340px;
  border-radius: var(--radius-small);
  background: var(--color-track);
}

.legend {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.legend__title {
  font-size: 16px;
  font-weight: 800;
}

.legend__duties,
.legend__marks {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2) var(--space-4);
  margin: 0;
  padding: 0;
  font-size: 13px;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
}

.legend__marks {
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-line);
  color: var(--color-text-muted);
}

.legend__swatch {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  border-radius: 4px;
}

.legend__code {
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 700;
}

.mark {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 17px;
  height: 17px;
  border-radius: var(--radius-pill);
  font-size: 10px;
  font-weight: 700;

  &--done {
    background: var(--color-surface);
    color: var(--color-navy);
    box-shadow: 0 0 0 1px rgb(14 33 56 / 20%);
  }

  &--left {
    background: var(--color-navy);
    color: #fff;
  }

  &--filled {
    border-radius: 4px;
    background: var(--color-navy);
  }

  &--outlined {
    border: 1.5px solid var(--color-navy);
    border-radius: 4px;
    background: rgb(14 33 56 / 8%);
  }
}
</style>
