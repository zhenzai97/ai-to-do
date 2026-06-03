import { normalizePriority } from '@/constants/priority'

const STORAGE_KEY = 'ai-todo-tasks'

export function normalizeTask(task) {
  if (!task || typeof task !== 'object') return null

  return {
    id: task.id,
    text: typeof task.text === 'string' ? task.text : '',
    completed: Boolean(task.completed),
    createdAt: typeof task.createdAt === 'number' ? task.createdAt : Date.now(),
    priority: normalizePriority(task.priority),
  }
}

export function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data.map(normalizeTask).filter(Boolean)
  } catch {
    return []
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (err) {
    console.warn('无法保存到 localStorage:', err)
  }
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
