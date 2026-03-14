<script setup lang="ts">
defineProps<{ modelValue: boolean, title?: string, text?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="modal-container"
      role="dialog"
      aria-modal="true"
      @click.self="emit('update:modelValue', false)"
    >
      <div class="modal">
        <h2 v-if="title" class="modal__title">{{ title }}</h2>
        <p v-if="text" class="modal__text">{{ text }}</p>
        <slot/>
        <div v-if="$slots.actions" class="modal__actions">
          <slot name="actions"/>
        </div>
      </div>
    </div>
  </Teleport>
</template>


<style lang="scss" scoped>
.modal-container {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(18px);
  z-index: 50;
}

.modal {
  width: 100%;
  max-width: 420px;
  border-radius: 1.25rem;
  background: #1f2937;
  border: 1px solid $border-subtle;
  padding: 1.25rem 1.35rem 1.1rem;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.95),
  0 0 0 1px rgba(15, 23, 42, 1);

  &__title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  &__text {
    font-size: 0.9rem;
    color: $text-muted;
    margin-bottom: 0.9rem;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
}

</style>