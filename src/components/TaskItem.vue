<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { Delete, Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getPriorityConfig, PRIORITY_OPTIONS } from '@/constants/priority'
import { prefersReducedMotion } from '@/composables/useGsapContext'

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['toggle', 'delete', 'update'])

const rootEl = ref(null)
const textEl = ref(null)
const editVisible = ref(false)
const editText = ref('')
const editPriority = ref('medium')
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
  editText.value = props.task.text
  editPriority.value = props.task.priority
  editVisible.value = true
}

function saveEdit() {
  const trimmed = editText.value.trim()
  if (!trimmed) {
    ElMessage.warning('任务内容不能为空')
    return
  }

  emit('update', {
    id: props.task.id,
    text: trimmed,
    priority: editPriority.value,
  })
  editVisible.value = false
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
    :class="[
      priorityClass,
      { 'task-item--completed': task.completed },
    ]"
  >
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

    <el-dialog
      v-model="editVisible"
      title="编辑任务"
      width="420px"
      append-to-body
      destroy-on-close
      class="task-item__dialog"
    >
      <el-form label-position="top">
        <el-form-item label="任务内容">
          <el-input
            v-model="editText"
            maxlength="200"
            show-word-limit
            placeholder="请输入任务内容"
            @keyup.enter="saveEdit"
          />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="editPriority" placeholder="选择优先级" style="width: 100%">
            <el-option
              v-for="option in PRIORITY_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
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
      order: 3;
      width: 100%;
      padding-left: 1.75rem;
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
