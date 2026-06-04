<script setup>
import { ref, watch, nextTick, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { gsap } from 'gsap'
import draggable from 'vuedraggable'
import { List, Plus } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useTaskStore } from '@/stores/tasks'
import { useTasks } from '@/composables/useTasks'
import { useFilter } from '@/composables/useFilter'
import { useGsapContext, prefersReducedMotion } from '@/composables/useGsapContext'
import { PRIORITY_OPTIONS, DEFAULT_PRIORITY } from '@/constants/priority'
import TaskItem from './TaskItem.vue'
import TaskFilter from './TaskFilter.vue'
import ThemeToggle from './ThemeToggle.vue'

const inputText = ref('')
const inputPriority = ref(DEFAULT_PRIORITY)
const inputRef = ref(null)
const composerRef = ref(null)
const containerRef = ref(null)
const statsActiveRef = ref(null)
const statsCompletedRef = ref(null)
const emptyRef = ref(null)
const editVisible = ref(false)
const editText = ref('')
const editPriority = ref(DEFAULT_PRIORITY)
const editingTaskId = ref(null)

const { create: createGsapContext } = useGsapContext()

const taskStore = useTaskStore()
const { sortedTasks, activeCount, completedCount } = storeToRefs(taskStore)
const { filter, filteredTasks } = useFilter(() => sortedTasks.value)

const {
  addTask,
  updateTask,
  toggleTask,
  deleteTask,
  clearAllTasks,
  clearCompleted,
  reorderByVisibleIds,
} = useTasks()

const draggableTasks = computed({
  get() {
    return filteredTasks.value
  },
  set(newList) {
    reorderByVisibleIds(newList.map((task) => task.id))
  },
})

function shakeInput() {
  const el = composerRef.value
  if (!el || prefersReducedMotion()) {
    inputRef.value?.focus()
    return
  }

  gsap.fromTo(
    el,
    { x: 0 },
    {
      x: 8,
      duration: 0.06,
      repeat: 5,
      yoyo: true,
      ease: 'power1.inOut',
      onComplete: () => {
        gsap.set(el, { x: 0 })
      },
    }
  )
  inputRef.value?.focus()
}

function handleSubmit() {
  if (addTask(inputText.value, inputPriority.value)) {
    inputText.value = ''
  } else {
    shakeInput()
  }
}

function handleUpdate(payload) {
  const trimmed = payload.text.trim()
  if (!trimmed) {
    ElMessage.warning('任务内容不能为空')
    return false
  }

  return updateTask(payload.id, {
    text: trimmed,
    priority: payload.priority,
  })
}

function openEditDialog(task) {
  editingTaskId.value = task.id
  editText.value = task.text
  editPriority.value = task.priority
  editVisible.value = true
}

function saveEdit() {
  if (!editingTaskId.value) return

  const success = handleUpdate({
    id: editingTaskId.value,
    text: editText.value,
    priority: editPriority.value,
  })

  if (success) {
    editVisible.value = false
    editingTaskId.value = null
  }
}

async function handleClearAll() {
  if (sortedTasks.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要清空全部 ${sortedTasks.value.length} 条任务吗？此操作不可恢复。`,
      '全部清空',
      {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
      }
    )
    clearAllTasks()
    ElMessage.success('已清空全部任务')
    nextTick(() => animateEmptyState(true))
  } catch {
    // 用户取消
  }
}

async function handleClearCompleted() {
  if (completedCount.value === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要清除 ${completedCount.value} 条已完成任务吗？`,
      '清除已完成',
      {
        confirmButtonText: '确定清除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    clearCompleted()
    ElMessage.success('已清除已完成任务')
    if (filteredTasks.value.length === 0) {
      nextTick(() => animateEmptyState(true))
    }
  } catch {
    // 用户取消
  }
}

function animateStats() {
  if (prefersReducedMotion()) return

  const targets = [
    statsActiveRef.value?.$el,
    statsCompletedRef.value?.$el,
  ].filter(Boolean)

  if (!targets.length) return

  gsap.fromTo(
    targets,
    { scale: 1.25 },
    { scale: 1, duration: 0.35, ease: 'back.out(2)', stagger: 0.05 }
  )
}

function animateEmptyState(show) {
  const el = emptyRef.value?.$el
  if (!el || !show || prefersReducedMotion()) return

  gsap.fromTo(
    el,
    { autoAlpha: 0, y: 12 },
    { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }
  )
}

watch([activeCount, completedCount], () => {
  nextTick(animateStats)
})

watch(
  () => filteredTasks.value.length,
  (len, prevLen) => {
    if (len === 0 && prevLen > 0) {
      nextTick(() => animateEmptyState(true))
    }
  }
)

onMounted(() => {
  if (!containerRef.value || prefersReducedMotion()) return

  createGsapContext(containerRef.value, () => {
    gsap.from('.todo-app__icon', {
      scale: 0,
      rotation: -120,
      duration: 0.55,
      ease: 'back.out(1.7)',
    })
    gsap.from('.todo-app__title', {
      autoAlpha: 0,
      y: 18,
      duration: 0.45,
      delay: 0.12,
      ease: 'power2.out',
    })
    gsap.from('.todo-app__subtitle', {
      autoAlpha: 0,
      y: 12,
      duration: 0.4,
      delay: 0.2,
      ease: 'power2.out',
    })
    gsap.from('.todo-app__form', {
      autoAlpha: 0,
      y: 16,
      duration: 0.4,
      delay: 0.28,
      ease: 'power2.out',
    })
    gsap.from('.todo-app__toolbar', {
      autoAlpha: 0,
      y: 12,
      duration: 0.35,
      delay: 0.36,
      ease: 'power2.out',
    })
  })
})
</script>

<template>
  <div ref="containerRef" class="todo-app">
    <el-card class="todo-app__card" shadow="always">
      <template #header>
        <div class="todo-app__header">
          <ThemeToggle class="todo-app__theme-toggle" />
          <div class="todo-app__icon" aria-hidden="true">
            <el-icon :size="28">
              <List />
            </el-icon>
          </div>
          <h1 class="todo-app__title">待办事项</h1>
          <p class="todo-app__subtitle">记录每一件小事，轻松掌控今天</p>
        </div>
      </template>

      <div class="todo-app__body">
        <el-form class="todo-app__form" @submit.prevent="handleSubmit">
          <div ref="composerRef" class="todo-app__composer">
            <el-input
              ref="inputRef"
              v-model="inputText"
              class="todo-app__input"
              placeholder="添加新任务，按 Enter 确认"
              maxlength="200"
              clearable
              aria-label="任务内容"
              @keyup.enter="handleSubmit"
            />
            <button
              type="submit"
              class="todo-app__add-btn"
              aria-label="添加任务"
            >
              <el-icon :size="18"><Plus /></el-icon>
            </button>
          </div>

          <div class="todo-app__priority" role="group" aria-label="任务优先级">
            <button
              v-for="option in PRIORITY_OPTIONS"
              :key="option.value"
              type="button"
              class="todo-app__priority-btn"
              :class="[
                `todo-app__priority-btn--${option.value}`,
                { 'todo-app__priority-btn--active': inputPriority === option.value },
              ]"
              @click="inputPriority = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </el-form>

        <div class="todo-app__toolbar">
          <TaskFilter v-model="filter" />

          <div class="todo-app__stats" aria-live="polite">
            <div class="todo-app__stat">
              <span class="todo-app__stat-label">未完成</span>
              <el-tag ref="statsActiveRef" type="primary" effect="dark" round>
                {{ activeCount }}
              </el-tag>
            </div>
            <el-divider direction="vertical" />
            <div class="todo-app__stat">
              <span class="todo-app__stat-label">已完成</span>
              <el-tag ref="statsCompletedRef" type="success" effect="dark" round>
                {{ completedCount }}
              </el-tag>
            </div>
          </div>
        </div>

        <section class="todo-app__list-section" aria-label="任务列表">
          <div v-if="sortedTasks.length" class="todo-app__list-header">
            <div class="todo-app__list-heading">
              <span class="todo-app__list-title">任务列表</span>
              <span v-if="filteredTasks.length > 1" class="todo-app__list-hint">拖拽左侧手柄排序</span>
            </div>
            <div class="todo-app__list-actions">
              <el-button
                v-if="completedCount > 0"
                type="warning"
                plain
                size="small"
                class="todo-app__clear-completed"
                @click="handleClearCompleted"
              >
                清除已完成
              </el-button>
              <el-button
                type="danger"
                plain
                size="small"
                class="todo-app__clear-all"
                @click="handleClearAll"
              >
                全部清空
              </el-button>
            </div>
          </div>

          <draggable
            v-if="filteredTasks.length"
            v-model="draggableTasks"
            class="todo-app__list"
            tag="ul"
            item-key="id"
            handle=".task-item__drag-handle"
            :animation="180"
            ghost-class="task-item--ghost"
            chosen-class="task-item--chosen"
            drag-class="task-item--dragging"
            :disabled="filteredTasks.length < 2"
          >
            <template #item="{ element }">
              <TaskItem
                :task="element"
                @toggle="toggleTask"
                @delete="deleteTask"
                @edit="openEditDialog"
              />
            </template>
          </draggable>

          <el-empty
            v-else-if="sortedTasks.length === 0"
            ref="emptyRef"
            class="todo-app__empty"
            description="还没有任务，添加第一条吧 ✨"
          />

          <el-empty
            v-else
            class="todo-app__empty"
            description="当前筛选下没有任务"
          />
        </section>
      </div>

      <template #footer>
        <p class="todo-app__footer">数据保存在本地浏览器，刷新不会丢失</p>
      </template>
    </el-card>

    <el-dialog
      v-model="editVisible"
      title="编辑任务"
      width="420px"
      append-to-body
      destroy-on-close
      class="todo-app__edit-dialog"
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
  </div>
</template>

<style lang="scss" scoped>
.todo-app {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 1rem;
  overflow: hidden;

  &__card {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 560px;
    max-height: 100%;
    border-radius: $radius-lg;
    border: 1px solid rgba($color-primary, 0.08);
    overflow: hidden;
    background: var(--app-surface);

    :deep(.el-card__header) {
      flex-shrink: 0;
      padding: 0;
      border-bottom: 1px solid var(--app-border);
    }

    :deep(.el-card__body) {
      flex: 1;
      min-height: 0;
      padding: 1.25rem 1.5rem;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    :deep(.el-card__footer) {
      flex-shrink: 0;
      padding: 0.75rem 1.5rem;
      background: var(--app-surface-muted);
      border-top: 1px solid var(--app-border);
    }
  }

  &__header {
    position: relative;
    text-align: center;
    padding: 1.5rem 1.5rem 1.25rem;
    background: var(--app-gradient-header);
  }

  &__theme-toggle {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    margin-bottom: 0.625rem;
    color: $color-surface;
    background: var(--app-primary);
    border-radius: $radius-md;
    box-shadow: $shadow-md;
  }

  &__title {
    font-size: 1.625rem;
    font-weight: 700;
    color: var(--app-text);
    letter-spacing: -0.02em;
  }

  &__subtitle {
    margin-top: 0.3rem;
    font-size: 0.875rem;
    color: var(--app-text-muted);
  }

  &__body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__form {
    flex-shrink: 0;
    margin-bottom: 1rem;
  }

  &__composer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.375rem 0.375rem 0.125rem;
    background: var(--app-surface);
    border: 1px solid rgba($color-primary, 0.12);
    border-radius: $radius-md;
    transition: border-color $transition, box-shadow $transition;

    &:focus-within {
      border-color: rgba($color-primary, 0.35);
      box-shadow: 0 0 0 3px rgba($color-primary, 0.08);
    }
  }

  &__input {
    flex: 1;
    min-width: 0;

    :deep(.el-input__wrapper) {
      padding: 0.625rem 0.75rem;
      background: transparent;
      border: none;
      box-shadow: none !important;
    }

    :deep(.el-input__inner) {
      font-size: 0.95rem;
      color: var(--app-text);
    }

    :deep(.el-input__inner::placeholder) {
      color: #94a3b8;
    }
  }

  &__add-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    padding: 0;
    color: $color-surface;
    background: var(--app-primary);
    border: none;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: background $transition, transform $transition;

    &:hover {
      background: var(--app-primary-hover);
    }

    &:active {
      transform: scale(0.94);
    }
  }

  &__priority {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    margin-top: 0.625rem;
  }

  &__priority-btn {
    padding: 0.25rem 0.75rem;
    font-family: inherit;
    font-size: 0.75rem;
    color: var(--app-text-muted);
    background: transparent;
    border: 1px solid transparent;
    border-radius: 9999px;
    cursor: pointer;
    transition: color $transition, background $transition, border-color $transition;

    &--active {
      font-weight: 600;
    }

    &--high.todo-app__priority-btn--active {
      color: $color-priority-high;
      background: rgba($color-priority-high, 0.08);
      border-color: rgba($color-priority-high, 0.2);
    }

    &--medium.todo-app__priority-btn--active {
      color: $color-priority-medium;
      background: rgba($color-priority-medium, 0.1);
      border-color: rgba($color-priority-medium, 0.25);
    }

    &--low.todo-app__priority-btn--active {
      color: var(--app-text-muted);
      background: rgba($color-priority-low, 0.12);
      border-color: rgba($color-priority-low, 0.25);
    }

    &:hover:not(.todo-app__priority-btn--active) {
      color: var(--app-text);
      background: rgba($color-primary, 0.04);
    }
  }

  &__toolbar {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  &__stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 0.625rem 1rem;
    background: var(--app-surface-muted);
    border-radius: $radius-md;
  }

  &__stat {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__stat-label {
    font-size: 0.85rem;
    color: var(--app-text-muted);
  }

  &__list-section {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-shrink: 0;
    margin-bottom: 0.625rem;
  }

  &__list-heading {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  &__list-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--app-text);
  }

  &__list-hint {
    font-size: 0.75rem;
    color: var(--app-text-muted);
  }

  &__list-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: flex-end;
  }

  &__clear-all,
  &__clear-completed {
    border-radius: $radius-sm;
  }

  &__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: $task-list-gap;
    flex: 1;
    min-height: 0;
    max-height: calc(
      #{$task-item-min-height} * #{$task-list-visible-count} +
      #{$task-list-gap} * (#{$task-list-visible-count} - 1)
    );
    overflow-x: hidden;
    overflow-y: auto;
    padding-right: 0.25rem;
    margin-right: -0.25rem;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba($color-primary, 0.25);
      border-radius: 9999px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: rgba($color-primary, 0.4);
    }

    scrollbar-width: thin;
    scrollbar-color: rgba($color-primary, 0.25) transparent;
  }

  &__empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0;

    :deep(.el-empty__description) {
      color: var(--app-text-muted);
    }
  }

  &__footer {
    text-align: center;
    font-size: 0.75rem;
    color: var(--app-text-muted);
  }

  @media (max-width: $breakpoint-mobile) {
    padding: 0.75rem;

    &__card {
      border-radius: $radius-md;
    }

    &__header {
      padding: 1.25rem 1rem 1rem;
    }

    &__theme-toggle {
      top: 0.75rem;
      right: 0.75rem;
    }

    &__title {
      font-size: 1.375rem;
    }

    :deep(.el-card__body) {
      padding: 1rem;
    }

    &__composer {
      padding: 0.25rem 0.25rem 0.25rem 0;
    }

    &__input {
      :deep(.el-input__inner) {
        font-size: 16px;
      }
    }

    &__add-btn {
      width: 40px;
      height: 40px;
    }

    &__list-header {
      flex-direction: column;
      align-items: flex-start;
    }

    &__list-actions {
      width: 100%;
    }

    &__list {
      max-height: calc(
        #{$task-item-min-height-mobile} * #{$task-list-visible-count} +
        #{$task-list-gap} * (#{$task-list-visible-count} - 1)
      );
    }
  }
}
</style>
