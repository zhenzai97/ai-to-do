import { ref, computed } from 'vue'

export const FILTER_ALL = 'all'
export const FILTER_ACTIVE = 'active'
export const FILTER_COMPLETED = 'completed'

export const FILTER_OPTIONS = [
  { value: FILTER_ALL, label: '全部' },
  { value: FILTER_ACTIVE, label: '进行中' },
  { value: FILTER_COMPLETED, label: '已完成' },
]

export function useFilter(getSortedTasks) {
  const filter = ref(FILTER_ALL)

  const filteredTasks = computed(() => {
    const tasks = getSortedTasks()

    if (filter.value === FILTER_ACTIVE) {
      return tasks.filter((t) => !t.completed)
    }

    if (filter.value === FILTER_COMPLETED) {
      return tasks.filter((t) => t.completed)
    }

    return tasks
  })

  function setFilter(value) {
    filter.value = value
  }

  return {
    filter,
    filteredTasks,
    setFilter,
    FILTER_ALL,
    FILTER_ACTIVE,
    FILTER_COMPLETED,
    FILTER_OPTIONS,
  }
}
