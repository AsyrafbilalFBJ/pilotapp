<script setup lang="ts">
const app = useAppStore()

// Load "today" and confirm the API is up before any screen renders.
if (app.status === 'idle') {
  void app.load()
}
</script>

<template>
  <NuxtRouteAnnouncer />

  <NuxtLayout v-if="app.status === 'ready'">
    <NuxtPage />
  </NuxtLayout>

  <div v-else-if="app.status === 'error'" class="startup startup--error" role="alert">
    <img src="/assets/brand.png" alt="Susi Air" width="140" height="35" />
    <h1>Can't reach the Pilot App service</h1>
    <p>{{ app.errorMessage }}</p>
    <AppButton @click="app.load()">Try again</AppButton>
  </div>

  <div v-else class="startup" aria-busy="true" aria-label="Loading">
    <img src="/assets/brand.png" alt="Susi Air" width="140" height="35" />
  </div>
</template>

<style scoped lang="scss">
.startup {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  max-width: var(--app-max-width);
  min-height: 100dvh;
  margin: 0 auto;
  padding: var(--space-6);
  text-align: center;

  h1 {
    font-size: 20px;
    font-weight: 800;
  }

  p {
    max-width: 32ch;
    color: var(--color-text-muted);
  }
}

.startup--error img {
  margin-bottom: var(--space-4);
}
</style>
