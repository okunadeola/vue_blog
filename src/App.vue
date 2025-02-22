<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref, watch } from 'vue'
import { Toaster } from '@steveyuowo/vue-hot-toast'
import { useThemeStore } from '@/stores/theme'
import '@steveyuowo/vue-hot-toast/vue-hot-toast.css'

const themeProvider = useThemeStore()
const theme = ref('light')

watch(
  () => themeProvider.theme,
  (newVal) => {
    theme.value = newVal
  },
  { immediate: true },
)
</script>

<template>
  <div :class="theme">
    <div
      class="bg-gray-100 text-gray-700 dark:text-gray-200 dark:bg-[rgb(16,23,42)] min-h-screen font-SourceSerifPro"
    >
      <RouterView />
      <Toaster />
    </div>
  </div>
</template>

<style></style>
