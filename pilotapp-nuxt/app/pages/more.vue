<script setup lang="ts">
import { LogOut } from 'lucide-vue-next'

useHead({ title: 'More · Susi Air Pilot' })

const auth = useAuthStore()
const pilot = usePilotProfile()

async function logout(): Promise<void> {
  auth.logout()
  await navigateTo('/login')
}
</script>

<template>
  <div class="more">
    <h1>More</h1>

    <SectionError
      v-if="pilot.error.value"
      :message="apiErrorMessage(pilot.error.value)"
      @retry="pilot.refresh()"
    />
    <section v-else class="profile" aria-labelledby="profile-name" :aria-busy="!pilot.data.value">
      <template v-if="pilot.data.value">
        <img
          class="profile__avatar"
          :src="pilot.data.value.avatarUrl"
          :alt="pilot.data.value.name"
          width="64"
          height="64"
        />
        <div class="profile__text">
          <h2 id="profile-name" class="profile__name">{{ pilot.data.value.name }}</h2>
          <p class="profile__hours">
            <span class="num">{{ pilot.data.value.totalFlightHours }}</span>
            total flight hours
          </p>
        </div>
      </template>
      <template v-else>
        <span class="profile__avatar profile__avatar--empty" aria-hidden="true" />
        <div class="profile__text" aria-hidden="true">
          <span class="placeholder placeholder--name" />
          <span class="placeholder placeholder--hours" />
        </div>
      </template>
    </section>

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

.profile {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.profile__avatar {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-track);

  &--empty {
    display: block;
  }
}

.profile__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.profile__name {
  overflow-wrap: anywhere;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.profile__hours {
  color: var(--color-text-muted);
  font-size: 14px;

  .num {
    color: var(--color-text);
  }
}

.placeholder {
  display: block;
  border-radius: var(--radius-small);
  background: var(--color-track);

  &--name {
    width: 140px;
    height: 22px;
  }

  &--hours {
    width: 170px;
    height: 16px;
    margin-top: 4px;
  }
}
</style>
