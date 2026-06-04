<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { Delete, Edit, Rank } from '@element-plus/icons-vue'
import { getPriorityConfig } from '@/constants/priority'
import { prefersReducedMotion } from '@/composables/useGsapContext'

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['toggle', 'delete', 'edit'])

const rootEl = ref(null)
const textEl = ref(null)
let ctx = null

const priorityConfig = computed(() => getPriorityConfig(props.task.priority))

const priorityClass = computed(() => `task-item--priority-${props.task.priority}`)

function playEnterAnimation() {
  if (!rootEl.value || prefersReducedMotion()) return

  gsap.from(rootEl.value, {
    autoAlpha: 0,
    scale: 0.98,
    duration: 0.35,
    ease: 'power2.out',
  })
}

function playToggleAnimation(completed) {
  if (!textEl.value || prefersReducedMotion()) return

  gsap.to(textEl.value, {
    opacity: completed ? 0.55 : 1,
    duration: 0.25,
    ease: 'power2.out',
  })
}

function handleToggle() {
  emit('toggle', props.task.id)
}

function handleDelete() {
  if (!rootEl.value || prefersReducedMotion()) {
    emit('delete', props.task.id)
    return
  }

  gsap.to(rootEl.value, {
    autoAlpha: 0,
    scale: 0.96,
    duration: 0.25,
    ease: 'power2.in',
    onComplete: () => emit('delete', props.task.id),
  })
}

function openEditDialog() {
  emit('edit', props.task)
}

watch(
  () => props.task.completed,
  (completed) => playToggleAnimation(completed)
)

onMounted(() => {
  if (!rootEl.value) return

  ctx = gsap.context(() => {
    playEnterAnimation()
  }, rootEl.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <li
    ref="rootEl"
    class="task-item"
    :data-id="task.id"
    :class="[
      priorityClass,
      { 'task-item--completed': task.completed },
    ]"
  >
    <button
      type="button"
      class="task-item__drag-handle"
      aria-label="拖拽排序"
      tabindex="-1"
    >
      <el-icon :size="16"><Rank /></el-icon>
    </button>

    <el-checkbox
      class="task-item__checkbox"
      :model-value="task.completed"
      :aria-label="`标记「${task.text}」为${task.completed ? '未完成' : '已完成'}`"
      @change="handleToggle"
    />

    <el-tag
      class="task-item__priority"
      :type="priorityConfig.tagType"
      size="small"
      effect="dark"
      round
    >
      {{ priorityConfig.label }}
    </el-tag>

    <span ref="textEl" class="task-item__text">{{ task.text }}</span>

    <div class="task-item__actions">
      <el-button
        class="task-item__edit"
        type="primary"
        text
        circle
        :aria-label="`编辑任务「${task.text}」`"
        @click="openEditDialog"
      >
        <el-icon><Edit /></el-icon>
      </el-button>
      <el-button
        class="task-item__delete"
        type="danger"
        text
        circle
        :aria-label="`删除任务「${task.text}」`"
        @click="handleDelete"
      >
        <el-icon><Delete /></el-icon>
      </el-button>
    </div>
  </li>
</template>

<style lang="scss" scoped>
.task-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-height: $task-item-min-height;
  padding: 0.75rem 1rem;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-left-width: 4px;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
  overflow: hidden;
  transition: border-color $transition, box-shadow $transition;

  &--ghost {
    opacity: 0.45;
    background: var(--app-primary-soft);
    box-shadow: none;
  }

  &--chosen {
    box-shadow: $shadow-md;
  }

  &--dragging {
    opacity: 0.92;
    box-shadow: $shadow-md;
  }

  &__drag-handle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 20px;
    height: 28px;
    padding: 0;
    color: var(--app-text-muted);
    background: transparent;
    border: none;
    border-radius: $radius-sm;
    cursor: grab;
    touch-action: none;
    transition: color $transition, background $transition;

    &:hover {
      color: var(--app-primary);
      background: rgba($color-primary, 0.06);
    }

    &:active {
      cursor: grabbing;
    }
  }

  &--priority-high {
    border-left-color: $color-priority-high;
  }

  &--priority-medium {
    border-left-color: $color-priority-medium;
  }

  &--priority-low {
    border-left-color: $color-priority-low;
  }

  &:hover {
    border-color: $color-primary-light;
    box-shadow: $shadow-md;
  }

  &--priority-high:hover {
    border-left-color: $color-priority-high;
  }

  &--priority-medium:hover {
    border-left-color: $color-priority-medium;
  }

  &--priority-low:hover {
    border-left-color: $color-priority-low;
  }

  &--completed {
    background: var(--app-surface-muted);
  }

  &__checkbox {
    flex-shrink: 0;
  }

  &__priority {
    flex-shrink: 0;
    min-width: 28px;
    justify-content: center;
  }

  &__text {
    flex: 1;
    font-size: 0.95rem;
    word-break: break-word;
    transition: color $transition;
  }

  &--completed &__text {
    text-decoration: line-through;
    color: $color-text-muted;
  }

  &__actions {
    display: flex;
    flex-shrink: 0;
    gap: 0.125rem;
  }

  @media (max-width: $breakpoint-mobile) {
    flex-wrap: wrap;
    min-height: $task-item-min-height-mobile;
    padding: 0.85rem;

    &__text {
      order: 4;
      width: 100%;
      padding-left: 1.75rem;
    }

    &__drag-handle {
      width: 24px;
      height: 32px;
    }

    &__actions {
      margin-left: auto;
    }

    &__edit,
    &__delete {
      width: 40px;
      height: 40px;
    }
  }
}
</style>
