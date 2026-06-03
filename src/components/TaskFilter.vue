<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const options = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '进行中' },
  { value: 'completed', label: '已完成' },
]
</script>

<template>
  <div class="task-filter" role="tablist" aria-label="任务筛选">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="task-filter__btn"
      :class="{ 'task-filter__btn--active': modelValue === option.value }"
      role="tab"
      :aria-selected="modelValue === option.value"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.task-filter {
  display: flex;
  gap: 0.375rem;
  padding: 0.25rem;
  background: var(--app-surface-muted);
  border-radius: $radius-md;

  &__btn {
    flex: 1;
    padding: 0.5rem 0.75rem;
    font-family: inherit;
    font-size: 0.85rem;
    color: var(--app-text-muted);
    background: transparent;
    border: none;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: color $transition, background $transition, box-shadow $transition;

    &--active {
      color: var(--app-primary);
      font-weight: 600;
      background: var(--app-surface);
      box-shadow: $shadow-sm;
    }

    &:hover:not(.task-filter__btn--active) {
      color: var(--app-text);
    }
  }
}
</style>
