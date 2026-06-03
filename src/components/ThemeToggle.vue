<script setup>
import { inject, computed } from 'vue'
import { Moon, Sunny } from '@element-plus/icons-vue'

const themeContext = inject('theme')
const isDark = computed(() => themeContext?.isDark?.value ?? false)

function toggleTheme() {
  themeContext?.toggleTheme()
}
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="isDark ? '切换浅色模式' : '切换深色模式'"
    @click="toggleTheme"
  >
    <el-icon :size="18">
      <Sunny v-if="isDark" />
      <Moon v-else />
    </el-icon>
  </button>
</template>

<style lang="scss" scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: var(--app-text-muted);
  background: var(--app-surface-muted);
  border: 1px solid var(--app-border);
  border-radius: $radius-sm;
  cursor: pointer;
  transition: color $transition, background $transition, border-color $transition;

  &:hover {
    color: var(--app-primary);
    border-color: rgba($color-primary, 0.25);
  }
}
</style>
