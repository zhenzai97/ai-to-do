import { defineStore } from 'pinia'
import { PRIORITIES, DEFAULT_PRIORITY } from '@/constants/priority'
import { loadTasks, saveTasks, generateId } from '@/utils/storage'

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: loadTasks(),
  }),

  getters: {
    sortedTasks(state) {
      return [...state.tasks].sort((a, b) => a.order - b.order)
    },

    activeCount(state) {
      return state.tasks.filter((t) => !t.completed).length
    },

    completedCount(state) {
      return state.tasks.filter((t) => t.completed).length
    },
  },

  actions: {
    addTask(text, priority = DEFAULT_PRIORITY) {
      const trimmed = text.trim()
      if (!trimmed) return false

      const nextOrder =
        this.tasks.length === 0
          ? 0
          : Math.max(...this.tasks.map((task) => task.order ?? 0)) + 1

      this.tasks.push({
        id: generateId(),
        text: trimmed,
        completed: false,
        priority: PRIORITIES[priority] ? priority : DEFAULT_PRIORITY,
        createdAt: Date.now(),
        order: nextOrder,
      })
      return true
    },

    updateTask(id, { text, priority }) {
      const task = this.tasks.find((t) => t.id === id)
      if (!task) return false

      const trimmed = text.trim()
      if (!trimmed) return false

      task.text = trimmed
      if (priority && PRIORITIES[priority]) {
        task.priority = priority
      }
      return true
    },

    toggleTask(id) {
      const task = this.tasks.find((t) => t.id === id)
      if (task) task.completed = !task.completed
    },

    deleteTask(id) {
      const removed = this.tasks.find((t) => t.id === id)
      this.tasks = this.tasks.filter((t) => t.id !== id)

      if (removed) {
        this.tasks
          .sort((a, b) => a.order - b.order)
          .forEach((task, index) => {
            task.order = index
          })
      }
    },

    reorderByVisibleIds(newVisibleIds) {
      if (!newVisibleIds.length) return

      const visibleSet = new Set(newVisibleIds)
      const currentIds = this.sortedTasks.map((task) => task.id)
      const mergedIds = []
      let visibleIndex = 0

      for (const id of currentIds) {
        if (visibleSet.has(id)) {
          mergedIds.push(newVisibleIds[visibleIndex])
          visibleIndex += 1
        } else {
          mergedIds.push(id)
        }
      }

      mergedIds.forEach((id, index) => {
        const task = this.tasks.find((item) => item.id === id)
        if (task) task.order = index
      })
    },

    clearAllTasks() {
      this.tasks = []
    },

    clearCompleted() {
      const remaining = this.tasks.filter((t) => !t.completed)
      remaining.forEach((task, index) => {
        task.order = index
      })
      this.tasks = remaining
    },
  },
})

export function setupTaskStorePersistence(store) {
  store.$subscribe(
    () => {
      saveTasks(store.tasks)
    },
    { deep: true }
  )
}
