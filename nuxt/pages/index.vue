<script setup lang="ts">
import type { SummaryRange } from '~/types/api'

useHead({ title: 'Home · Susi Air Pilot' })

const range = ref<SummaryRange>('1w')

const pilot = usePilotProfile()
const summary = useFlightHoursSummary(range)
const documents = useDocuments()

const summaryLoading = computed(() => summary.status.value === 'pending')
</script>

<template>
  <div class="home">
    <header class="home__header">
      <img class="home__logo" src="/assets/brand.png" alt="Susi Air" width="112" height="28" />

      <SectionError
        v-if="pilot.error.value"
        :message="apiErrorMessage(pilot.error.value)"
        @retry="pilot.refresh()"
      />
      <div v-else class="pilot" :aria-busy="!pilot.data.value">
        <div class="pilot__text">
          <p class="pilot__greeting">Welcome back,</p>
          <h1 class="pilot__name">{{ pilot.data.value?.name ?? '\u00A0' }}</h1>
          <p class="pilot__hours">
            <span class="num">{{ pilot.data.value?.totalFlightHours ?? '–' }}</span>
            total flight hours
          </p>
        </div>
        <img
          v-if="pilot.data.value"
          class="pilot__avatar"
          :src="pilot.data.value.avatarUrl"
          :alt="pilot.data.value.name"
          width="56"
          height="56"
        />
        <span v-else class="pilot__avatar pilot__avatar--empty" aria-hidden="true" />
      </div>
    </header>

    <section class="limits" aria-labelledby="limits-title">
      <h2 id="limits-title" class="limits__title">Hours to limit</h2>

      <SectionError
        v-if="summary.error.value && !summary.data.value"
        :message="apiErrorMessage(summary.error.value)"
        @retry="summary.refresh()"
      />
      <template v-else>
        <div class="limits__grid">
          <template v-if="summary.data.value">
            <LimitCard v-for="card in summary.data.value.cards" :key="card.type" :card="card" />
          </template>
          <template v-else>
            <div v-for="n in 4" :key="n" class="placeholder placeholder--card" />
          </template>
        </div>

        <div class="chart-card">
          <div class="chart-card__head">
            <h3>Flight hours trend</h3>
            <p v-if="summary.data.value" class="chart-card__sub">
              Rolling {{ summary.data.value.chart.windowDays }}-day sum
            </p>
          </div>
          <RangeToggle v-model="range" :disabled="summaryLoading" />
          <p v-if="summary.error.value" class="chart-card__error" role="alert">
            {{ apiErrorMessage(summary.error.value) }}
          </p>
          <div :aria-busy="summaryLoading" :class="{ 'is-loading': summaryLoading }">
            <TrendChart v-if="summary.data.value" :chart="summary.data.value.chart" />
            <div v-else class="placeholder placeholder--chart" />
          </div>
        </div>
      </template>
    </section>

    <section class="docs" aria-labelledby="docs-title">
      <div class="docs__head">
        <h2 id="docs-title" class="docs__title">My Documents</h2>
        <p v-if="documents.data.value" class="docs__count">
          {{ documents.data.value.documents.length }}
          {{ documents.data.value.documents.length === 1 ? 'document' : 'documents' }}
        </p>
      </div>
      <SectionError
        v-if="documents.error.value"
        :message="apiErrorMessage(documents.error.value)"
        @retry="documents.refresh()"
      />
      <DocumentList v-else-if="documents.data.value" :documents="documents.data.value.documents" />
      <div v-else class="placeholder placeholder--list" />
    </section>
  </div>
</template>

<style scoped lang="scss">
.home__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-5) var(--space-5) var(--space-6);
  background: var(--color-surface);
}

.home__logo {
  width: 112px;
  height: auto;
}

.pilot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.pilot__greeting {
  color: var(--color-text-muted);
  font-size: 14px;
}

.pilot__name {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.pilot__hours {
  margin-top: var(--space-1);
  color: var(--color-text-muted);
  font-size: 14px;

  .num {
    color: var(--color-text);
  }
}

.pilot__avatar {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-track);

  &--empty {
    display: block;
  }
}

// The one bold area of the app: the duty limits sit on a navy panel.
.limits {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-5);
  background: var(--color-navy);
}

.limits__title {
  color: #fff;
  font-size: 18px;
  font-weight: 800;
}

.limits__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}

.chart-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-card);
  background: var(--color-surface);

  h3 {
    font-size: 15px;
    font-weight: 700;
  }
}

.chart-card__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
}

.chart-card__sub {
  color: var(--color-text-muted);
  font-size: 12px;
}

.chart-card__error {
  color: var(--color-danger);
  font-size: 13px;
  font-weight: 600;
}

.is-loading {
  opacity: 0.55;
  transition: opacity 0.15s ease;
}

.docs {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-5) 0;
}

.docs__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
}

.docs__title {
  font-size: 18px;
  font-weight: 800;
}

.docs__count {
  color: var(--color-text-muted);
  font-size: 13px;
}

.placeholder {
  border-radius: var(--radius-card);
  background: var(--color-track);

  &--card {
    height: 148px;
    background: var(--color-navy-soft);
  }

  &--chart {
    height: 250px;
  }

  &--list {
    height: 260px;
  }
}
</style>
