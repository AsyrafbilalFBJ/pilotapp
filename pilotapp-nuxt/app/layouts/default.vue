<template>
  <div class="app-frame">
    <main class="app-main">
      <slot />
    </main>
    <BottomNav />
  </div>
</template>

<style scoped lang="scss">
.app-frame {
  max-width: var(--app-max-width);
  min-height: 100dvh;
  margin: 0 auto;
  background: var(--color-bg);
}

.app-main {
  padding-bottom: calc(var(--nav-height) + env(safe-area-inset-bottom) + var(--space-6));
}
</style>
