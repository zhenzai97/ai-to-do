import { ref, computed, watch } from 'vue'

const THEME_KEY = 'ai-todo-theme'
export const THEME_LIGHT = 'light'
export const THEME_DARK = 'dark'

function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === THEME_DARK || stored === THEME_LIGHT) return stored
  } catch {
    // ignore
  }

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return THEME_DARK
  }

  return THEME_LIGHT
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export function useTheme() {
  const theme = ref(getStoredTheme())
  applyTheme(theme.value)

  function setTheme(value) {
    theme.value = value === THEME_DARK ? THEME_DARK : THEME_LIGHT
    applyTheme(theme.value)

    try {
      localStorage.setItem(THEME_KEY, theme.value)
    } catch {
      // ignore
    }
  }

  function toggleTheme() {
    setTheme(theme.value === THEME_DARK ? THEME_LIGHT : THEME_DARK)
  }

  watch(theme, applyTheme)

  const isDark = computed(() => theme.value === THEME_DARK)

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  }
}
