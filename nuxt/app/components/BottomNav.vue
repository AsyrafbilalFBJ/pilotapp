<script setup lang="ts">
import { BookOpen, CalendarDays, Ellipsis, House } from 'lucide-vue-next'

const items = [
  { to: '/', label: 'Home', icon: House },
  { to: '/schedule', label: 'Schedule', icon: CalendarDays },
  { to: '/logbook', label: 'Logbook', icon: BookOpen },
  { to: '/more', label: 'More', icon: Ellipsis },
] as const

const route = useRoute()

/** Home matches "/" only; other tabs also stay active on their sub-pages (e.g. /schedule/2026-05-19). */
function isActive(to: string): boolean {
  return to === '/' ? route.path === '/' : route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <nav class="bottom-nav" aria-label="Main">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="bottom-nav__item"
      :class="{ 'is-active': isActive(item.to) }"
      :aria-current="isActive(item.to) ? 'page' : undefined"
    >
      <component :is="item.icon" :size="22" :stroke-width="1.75" aria-hidden="true" />
      <span>{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped lang="scss">
.bottom-nav {
  position: fixed;
  inset: auto 0 0;
  z-index: 10;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  max-width: var(--app-max-width);
  height: calc(var(--nav-height) + env(safe-area-inset-bottom));
  margin: 0 auto;
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--color-surface);
  border-top: 1px solid var(--color-line);
}

.bottom-nav__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;

  &.is-active {
    color: var(--color-navy);

    // A short red bar marks the current tab, like an active strip on an ops board.
    &::before {
      content: '';
      position: absolute;
      top: 0;
      width: 28px;
      height: 3px;
      border-radius: 0 0 3px 3px;
      background: var(--color-red);
    }
  }
}
</style>
