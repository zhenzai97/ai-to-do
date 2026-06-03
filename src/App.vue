<script setup>
import { provide } from 'vue'
import { useTheme } from '@/composables/useTheme'
import TodoApp from '@/components/TodoApp.vue'

const theme = useTheme()
provide('theme', theme)
</script>

<template>
  <TodoApp />
</template>
