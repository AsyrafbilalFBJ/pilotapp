<script setup lang="ts">
import { LogOut } from 'lucide-vue-next'

useHead({ title: 'More · Susi Air Pilot' })

const auth = useAuthStore()

async function logout(): Promise<void> {
  auth.logout()
  await navigateTo('/login')
}
</script>

<template>
  <div class="more">
    <h1>More</h1>
    <AppButton block @click="logout">
      <LogOut :size="18" :stroke-width="2" aria-hidden="true" />
      Log out
    </AppButton>
  </div>
</template>

<style scoped lang="scss">
.more {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6) var(--space-5);

  h1 {
    font-size: 24px;
    font-weight: 800;
  }
}
</style>
