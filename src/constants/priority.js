export const PRIORITIES = {
  high: { label: '高', tagType: 'danger', weight: 3 },
  medium: { label: '中', tagType: 'warning', weight: 2 },
  low: { label: '低', tagType: 'info', weight: 1 },
}

export const PRIORITY_OPTIONS = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
]

export const DEFAULT_PRIORITY = 'medium'

export function normalizePriority(priority) {
  return Object.hasOwn(PRIORITIES, priority) ? priority : DEFAULT_PRIORITY
}

export function getPriorityConfig(priority) {
  return PRIORITIES[normalizePriority(priority)]
}
