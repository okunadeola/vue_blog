// useAuthStore

import type { CurrentUser } from '@/models'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('authStore', () => {
  const storedData = window.localStorage.getItem('blog_auth_vue')
  const initialData = storedData ? (JSON.parse(storedData) as CurrentUser) : null
  const currentUser = ref<CurrentUser | null>(initialData)

  function signInSuccess(payload: CurrentUser) {
    currentUser.value = payload
    window.localStorage.setItem('blog_auth_vue', JSON.stringify(payload))
  }

  function signOut() {
    currentUser.value = null
    window.localStorage.removeItem('blog_auth_vue')
  }

  return { currentUser, signInSuccess, signOut }
})
