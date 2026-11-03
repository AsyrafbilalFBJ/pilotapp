<script setup lang="ts">
definePageMeta({ layout: 'bare' })
useHead({ title: 'Sign in · Susi Air Pilot' })

const auth = useAuthStore()

const username = ref('')
const password = ref('')
const submitting = ref(false)
const errorMessage = ref<string | null>(null)

async function submit(): Promise<void> {
  submitting.value = true
  errorMessage.value = null
  try {
    await auth.login({ username: username.value, password: password.value })
    await navigateTo('/')
  } catch (error) {
    // 401 carries "Invalid username or password"; 400 lists the missing fields.
    errorMessage.value = apiErrorMessage(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="sign-in">
    <header class="sign-in__brand">
      <img src="/assets/brand.png" alt="Susi Air" width="160" height="40" />
      <p>Pilot</p>
    </header>

    <form class="sign-in__form" novalidate @submit.prevent="submit">
      <h1>Sign in</h1>

      <div class="field">
        <label for="username">Username</label>
        <input
          id="username"
          v-model.trim="username"
          type="text"
          name="username"
          autocomplete="username"
          autocapitalize="none"
          spellcheck="false"
          :aria-invalid="errorMessage ? 'true' : undefined"
          aria-describedby="sign-in-error"
        />
      </div>

      <div class="field">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          name="password"
          autocomplete="current-password"
          :aria-invalid="errorMessage ? 'true' : undefined"
          aria-describedby="sign-in-error"
        />
      </div>

      <p id="sign-in-error" class="sign-in__error" role="alert" aria-live="assertive">
        {{ errorMessage }}
      </p>

      <AppButton type="submit" block :loading="submitting">
        {{ submitting ? 'Signing in…' : 'Sign in' }}
      </AppButton>
    </form>
  </div>
</template>

<style scoped lang="scss">
.sign-in {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: var(--space-8) var(--space-6);
  background: var(--color-surface);
}

.sign-in__brand {
  display: flex;
  align-items: flex-end;
  gap: var(--space-2);

  p {
    color: var(--color-text-muted);
    font-weight: 600;
  }
}

.sign-in__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-top: 14vh;

  h1 {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);

  label {
    font-size: 14px;
    font-weight: 600;
  }

  input {
    min-height: 48px;
    padding: 0 var(--space-4);
    border: 1px solid var(--color-line);
    border-radius: var(--radius-small);
    background: var(--color-bg);

    &:focus-visible {
      outline: none;
      border-color: var(--color-navy);
      box-shadow: 0 0 0 3px rgb(14 33 56 / 12%);
    }

    &[aria-invalid='true'] {
      border-color: var(--color-danger);
    }
  }
}

.sign-in__error {
  min-height: 1.5em;
  color: var(--color-danger);
  font-size: 14px;
  font-weight: 600;
}
</style>
