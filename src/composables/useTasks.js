import { storeToRefs } from 'pinia'
import { useTaskStore } from '@/stores/tasks'

export function useTasks() {
  const store = useTaskStore()

  const { tasks, sortedTasks, activeCount, completedCount } = storeToRefs(store)

  return {
    tasks,
    sortedTasks,
    activeCount,
    completedCount,
    addTask: store.addTask,
    updateTask: store.updateTask,
    toggleTask: store.toggleTask,
    deleteTask: store.deleteTask,
    clearAllTasks: store.clearAllTasks,
    clearCompleted: store.clearCompleted,
  }
}
