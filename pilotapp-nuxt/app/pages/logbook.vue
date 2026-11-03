<script setup lang="ts">
import type { FlightHoursRange } from '~/types/api'

useHead({ title: 'Logbook · Susi Air Pilot' })

const api = useApi()
const today = useToday()

// Default range: the 1st of today's month up to today.
const from = ref(firstOfMonth(today.value))
const to = ref(today.value)

/** The range last sent to the API; the form fields only apply when "Show hours" is pressed. */
const applied = ref({ from: from.value, to: to.value })

const logbook = useAsyncData(
  'logbook',
  () => api<FlightHoursRange>('/flight-hours', { query: applied.value }),
  { watch: [applied] },
)

const loading = computed(() => logbook.status.value === 'pending')
const data = computed(() => logbook.data.value)
const rangeLabel = computed(() => {
  const days = data.value?.days
  const first = days?.[0]
  const last = days?.[days.length - 1]
  if (!first || !last) return ''
  return first === last ? first.formattedDate : `${first.formattedDate} – ${last.formattedDate}`
})

const rangeError = computed(() => {
  const error = logbook.error.value
  if (!error || apiErrorStatus(error) !== 400) return null
  const message = apiErrorMessage(error)
  return /[.!?]$/.test(message) ? message : `${message}.`
})

function submit(): void {
  applied.value = { from: from.value, to: to.value }
}
</script>

<template>
  <div class="logbook">
    <h1 class="logbook__title">Logbook</h1>

    <form class="range" @submit.prevent="submit">
      <div class="range__fields">
        <label class="field">
          <span>From</span>
          <input v-model="from" type="date" name="from" />
        </label>
        <label class="field">
          <span>To</span>
          <input v-model="to" type="date" name="to" />
        </label>
      </div>
      <AppButton type="submit" block :loading="loading">Show hours</AppButton>
    </form>

    <!-- 400: the range itself is wrong, so the API's reason is shown with no retry button. -->
    <p v-if="rangeError" class="range-error" role="alert">{{ rangeError }} Change the dates and try again.</p>
    <SectionError
      v-else-if="logbook.error.value"
      :message="apiErrorMessage(logbook.error.value)"
      @retry="logbook.refresh()"
    />

    <template v-else-if="data">
      <section class="total" :class="{ 'is-loading': loading }" aria-live="polite">
        <p class="total__label">Total flight hours</p>
        <p class="total__value"><span class="num">{{ data.totalHours }}</span> h</p>
        <p class="total__range">{{ rangeLabel }}</p>
      </section>

      <ol class="days" :class="{ 'is-loading': loading }" aria-label="Flight hours per day">
        <li
          v-for="day in data.days"
          :key="day.date"
          class="days__item"
          :class="{ 'days__item--zero': day.hours === 0, 'days__item--planned': day.isFuture }"
        >
          <time :datetime="day.date" class="days__date">{{ day.formattedDate }}</time>
          <span v-if="day.isFuture" class="days__planned">Planned</span>
          <span class="days__hours"><span class="num">{{ day.hours }}</span> h</span>
        </li>
      </ol>
    </template>

    <div v-else class="placeholder" />
  </div>
</template>

<style scoped lang="scss">
.logbook {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6) var(--space-5) 0;
}

.logbook__title {
  font-size: 24px;
  font-weight: 800;
}

.range {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.range__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: 13px;
  font-weight: 600;

  input {
    width: 100%;
    min-height: 44px;
    padding: 0 var(--space-3);
    border: 1px solid var(--color-line);
    border-radius: var(--radius-small);
    background: var(--color-bg);
    font-variant-numeric: tabular-nums;

    &:focus-visible {
      outline: none;
      border-color: var(--color-navy);
      box-shadow: 0 0 0 3px rgb(14 33 56 / 12%);
    }
  }
}

.range-error {
  padding: var(--space-3) var(--space-4);
  border-left: 3px solid var(--color-danger);
  border-radius: var(--radius-small);
  background: rgb(230 55 87 / 8%);
  color: #b0203f;
  font-size: 14px;
  font-weight: 600;
}

.total {
  padding: var(--space-5);
  border-radius: var(--radius-card);
  background: var(--color-navy);
  color: #fff;
}

.total__label {
  color: rgb(255 255 255 / 70%);
  font-size: 13px;
}

.total__value {
  font-size: 15px;

  .num {
    font-size: 36px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }
}

.total__range {
  color: rgb(255 255 255 / 70%);
  font-size: 13px;
}

.days {
  margin: 0;
  padding: 0;
  list-style: none;
  border-radius: var(--radius-card);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.days__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 48px;
  padding: 0 var(--space-4);

  & + & {
    border-top: 1px solid var(--color-line);
  }
}

.days__date {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.days__hours {
  margin-left: auto;
}

.days__item--zero .days__hours,
.days__item--zero .days__date {
  color: var(--color-text-muted);
  font-weight: 500;
}

.days__planned {
  padding: 2px 8px;
  border: 1px dashed var(--color-chart);
  border-radius: var(--radius-pill);
  color: #0e7f97;
  font-size: 11px;
  font-weight: 700;
}

.is-loading {
  opacity: 0.55;
}

.placeholder {
  height: 320px;
  border-radius: var(--radius-card);
  background: var(--color-track);
}
</style>
