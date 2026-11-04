<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'

definePageMeta({ layout: 'bare' })
useHead({ title: 'Sign in · Susi Air Pilot' })

const auth = useAuthStore()

/** The pilot account from the brief, shown so a reviewer can sign in without looking it up. */
const DEMO_ACCOUNT = { username: 'johndoe', password: 'susiairtest' } as const

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const submitting = ref(false)
const errorMessage = ref<string | null>(null)

/** Fills the form with the demo account. The pilot still presses "Sign in". */
function fillDemoAccount(): void {
  username.value = DEMO_ACCOUNT.username
  password.value = DEMO_ACCOUNT.password
  errorMessage.value = null
}

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
      <p>Pilot App</p>
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
        <div class="field__control">
          <input
            id="password"
            v-model="password"
            class="field__input--with-action"
            :type="showPassword ? 'text' : 'password'"
            name="password"
            autocomplete="current-password"
            :aria-invalid="errorMessage ? 'true' : undefined"
            aria-describedby="sign-in-error"
          />
          <button
            type="button"
            class="field__toggle"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            :aria-pressed="showPassword"
            @click="showPassword = !showPassword"
          >
            <EyeOff v-if="showPassword" :size="20" :stroke-width="1.75" aria-hidden="true" />
            <Eye v-else :size="20" :stroke-width="1.75" aria-hidden="true" />
          </button>
        </div>
      </div>

      <p id="sign-in-error" class="sign-in__error" role="alert" aria-live="assertive">
        {{ errorMessage }}
      </p>

      <AppButton type="submit" block :loading="submitting">
        {{ submitting ? 'Signing in…' : 'Sign in' }}
      </AppButton>
    </form>

    <section class="demo" aria-labelledby="demo-title">
      <h2 id="demo-title" class="demo__title">Demo account</h2>
      <dl class="demo__credentials">
        <div>
          <dt>Username</dt>
          <dd>{{ DEMO_ACCOUNT.username }}</dd>
        </div>
        <div>
          <dt>Password</dt>
          <dd>{{ DEMO_ACCOUNT.password }}</dd>
        </div>
      </dl>
      <AppButton variant="secondary" block :disabled="submitting" @click="fillDemoAccount">
        Fill in demo account
      </AppButton>
    </section>
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
    width: 100%;
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

.field__control {
  position: relative;
}

// Leaves room on the right so typed text never runs under the eye button.
.field__input--with-action {
  padding-right: 52px;
}

.field__toggle {
  position: absolute;
  top: 0;
  right: 0;
  display: grid;
  place-items: center;
  width: 48px;
  height: 100%;
  border: 0;
  border-radius: var(--radius-small);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;

  &:hover,
  &[aria-pressed='true'] {
    color: var(--color-navy);
  }
}

.sign-in__error {
  min-height: 1.5em;
  color: var(--color-danger);
  font-size: 14px;
  font-weight: 600;
}

.demo {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-6);
  padding: var(--space-4);
  border: 1px dashed var(--color-line);
  border-radius: var(--radius-card);
  background: var(--color-bg);
}

.demo__title {
  font-size: 14px;
  font-weight: 800;
}

.demo__credentials {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;

  > div {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-3);
  }

  dt {
    color: var(--color-text-muted);
    font-size: 13px;
  }

  dd {
    margin: 0;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }
}
</style>
