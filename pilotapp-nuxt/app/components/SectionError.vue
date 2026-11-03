<script setup lang="ts">
defineProps<{ message: string }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="section-error" role="alert">
    <p>{{ message }}</p>
    <AppButton variant="secondary" @click="$emit('retry')">Try again</AppButton>
  </div>
</template>

<style scoped lang="scss">
.section-error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  color: var(--color-text);
}
</style>
