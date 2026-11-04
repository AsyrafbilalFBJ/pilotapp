<template>
  <div class="app-frame">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.app-frame {
  max-width: var(--app-max-width);
  min-height: 100dvh;
  margin: 0 auto;
}
</style>
