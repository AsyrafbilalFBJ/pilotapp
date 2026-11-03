<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'button' | 'submit'
    variant?: 'primary' | 'secondary'
    loading?: boolean
    disabled?: boolean
    block?: boolean
  }>(),
  { type: 'button', variant: 'primary', loading: false, disabled: false, block: false },
)
</script>

<template>
  <button
    :type="type"
    class="app-button"
    :class="[`app-button--${variant}`, { 'app-button--block': block }]"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 48px;
  padding: 0 var(--space-6);
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.app-button--block {
  width: 100%;
}

.app-button--primary {
  background: var(--color-red);
  color: #fff;

  &:not(:disabled):hover {
    background: #cf2c4b;
  }
}

.app-button--secondary {
  background: var(--color-surface);
  border-color: var(--color-line);
  color: var(--color-navy);

  &:not(:disabled):hover {
    background: var(--color-bg);
  }
}
</style>
