<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

useHead({ title: 'Duty detail · Susi Air Pilot' })

const router = useRouter()

async function back(): Promise<void> {
  // Returns to the month the pilot came from (kept in the Schedule URL).
  if (window.history.state?.back) {
    router.back()
  } else {
    await navigateTo('/schedule')
  }
}
</script>

<template>
  <div class="detail">
    <button type="button" class="detail__back" @click="back">
      <ArrowLeft :size="18" aria-hidden="true" />
      Back to schedule
    </button>
    <div class="detail__body">
      <h1>Detail page coming soon</h1>
      <p>Flights for this day will appear here.</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  padding: var(--space-6) var(--space-5);
}

.detail__back {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: var(--space-2);
  min-height: 44px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-navy);
  font-weight: 700;
  cursor: pointer;
}

.detail__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-8) var(--space-5);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  text-align: center;

  h1 {
    font-size: 20px;
    font-weight: 800;
  }

  p {
    color: var(--color-text-muted);
  }
}
</style>
