import { defineStore } from 'pinia'
import { PRIORITIES, DEFAULT_PRIORITY } from '@/constants/priority'
import { loadTasks, saveTasks, generateId } from '@/utils/storage'

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: loadTasks(),
  }),

  getters: {
    sortedTasks(state) {
      return [...state.tasks].sort((a, b) => {
        const weightDiff =
          (PRIORITIES[b.priority]?.weight ?? 2) - (PRIORITIES[a.priority]?.weight ?? 2)
        if (weightDiff !== 0) return weightDiff
        return b.createdAt - a.createdAt
      })
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

      this.tasks.push({
        id: generateId(),
        text: trimmed,
        completed: false,
        priority: PRIORITIES[priority] ? priority : DEFAULT_PRIORITY,
        createdAt: Date.now(),
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
      this.tasks = this.tasks.filter((t) => t.id !== id)
    },

    clearAllTasks() {
      this.tasks = []
    },

    clearCompleted() {
      this.tasks = this.tasks.filter((t) => !t.completed)
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
