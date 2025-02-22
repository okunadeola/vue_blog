import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref('light')

  function toggleTheme(state: string) {
    theme.value = state
  }

  return { theme, toggleTheme }
})
