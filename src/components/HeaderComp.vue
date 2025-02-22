<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import type { CurrentUser } from '@/models'

// Props
defineProps({
  fromSearch: {
    type: Boolean,
    default: false,
  },
})

const isScrolled = ref(false)
const navbarOpen = ref(false)
const searchTerm = ref('')
const theme = ref('light')
const dropdownOpen = ref<boolean>(false)
const path = ref(window.location.pathname)
const themeProvider = useThemeStore()
const authProvider = useAuthStore()

const dropdown = ref<HTMLElement | null>(null)
const dropdownTarget = ref<HTMLElement | null>(null)
const currentUser = ref<CurrentUser | null>(null)

watch(
  () => authProvider.currentUser,
  (newVal) => {
    currentUser.value = newVal
  },
  { immediate: true },
)

// Sync theme with the injected themeProvider
watch(
  () => themeProvider.theme,
  (newVal) => {
    theme.value = newVal
  },
  { immediate: true },
)

const router = useRouter()
const route = useRoute()

// Scroll listener to update the header background
const onWindowScroll = () => {
  isScrolled.value = window.scrollY > 50
}

// Click-outside handler to close the dropdown if clicked outside
const handleClickOutside = (event: any) => {
  if (dropdownTarget.value?.contains(event.target)) {
    if (dropdownOpen.value) {
      return (dropdownOpen.value = false)
    }
    return (dropdownOpen.value = true)
  }
  if (dropdown.value && !dropdown.value?.contains(event.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', onWindowScroll)
  document.addEventListener('click', handleClickOutside)
  path.value = window.location.pathname
})

onUnmounted(() => {
  window.removeEventListener('scroll', onWindowScroll)
  document.removeEventListener('click', handleClickOutside)
})

const toggleNavbar = () => {
  navbarOpen.value = !navbarOpen.value
}

const toggleTheme = () => {
  const nextVal = theme.value === 'light' ? 'dark' : 'light'
  themeProvider.toggleTheme(nextVal)
}

const toggleThemeLight = () => {
  theme.value = 'light'
  themeProvider.toggleTheme(theme.value)
}

const handleSubmit = () => {
  const currentParams = { ...route.query }
  currentParams.searchTerm = searchTerm.value
  router.push({ path: '/search', query: currentParams })
}

const handleSignout = async () => {
  try {
    const headers = { 'Content-Type': 'application/json' }
    const res = await axios.post('http://localhost:3000/api/user/signout', {}, { headers })

    if (res) {
      authProvider.signOut()
      router.push('/sign-in')
    }
  } catch (error: any) {
    console.log(error.message)
  } finally {
    authProvider.signOut()
    router.push('/sign-in')
  }
}
</script>

<template>
  <div :class="fromSearch ? 'pt-20' : 'pt-40'" class="flex flex-col w-full">
    <nav
      :class="{
        'bg-[#333333]/80 backdrop-blur-sm': isScrolled,
        'bg-[#333333]': !isScrolled,
      }"
      class="py-6 fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    >
      <div class="flex justify-between items-center px-4 max-w-6xl mx-auto">
        <!-- Left side: Brand Logo -->
        <div class="flex gap-2 items-center">
          <router-link
            to="/"
            class="self-center whitespace-nowrap text-sm sm:text-xl font-semibold text-white"
          >
            <span
              class="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-zinc-500 rounded-lg text-white"
            >
              Tech
            </span>
            Blog
          </router-link>
        </div>

        <!-- Middle: Search form (visible on large screens) -->
        <form @submit.prevent="handleSubmit" class="flex-grow mx-4 md:ml-20">
          <input
            type="text"
            v-model="searchTerm"
            name="search"
            placeholder="Search..."
            class="!rounded-full shadow-none outline-none py-2 px-4"
            :style="{
              background: '#eef',
              borderRadius: '20px',
              border: 'none',
              boxShadow: 'none',
            }"
          />
        </form>

        <div class="flex gap-2 items-center">
          <!-- Theme toggle button -->
          <button
            class="w-10 h-10 rounded-full p-0 flex items-center justify-center dark:bg-black"
            @click="toggleTheme"
          >
            <template v-if="theme === 'light'">
              <!-- Light theme icon (sun) -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m8.485-8.485h-1M4.515 12.515h-1m15.364 4.95l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"
                />
              </svg>
            </template>
            <template v-else>
              <!-- Dark theme icon (moon) -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-gray-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                />
              </svg>
            </template>
          </button>

          <!-- User dropdown or Sign In -->
          <template v-if="currentUser">
            <div class="relative">
              <img
                :src="currentUser.profilePicture || 'https://placehold.co/600x400/png'"
                alt="user"
                class="rounded-full w-10 h-10 cursor-pointer"
                ref="dropdownTarget"
              />
              <div
                v-if="dropdownOpen"
                ref="dropdown"
                class="absolute right-0 mt-2 top-20 w-48 bg-white rounded-md shadow-lg z-50"
              >
                <div class="p-4 border-b text-purple-700">
                  <div class="text-sm">{{ currentUser.username }}</div>
                  <div class="text-sm font-medium truncate">{{ currentUser.email }}</div>
                </div>
                <router-link
                  v-if="currentUser.isAdmin"
                  to="/admin/dashboard"
                  @click="toggleThemeLight"
                  class="block px-4 py-2 hover:bg-gray-100 dark:text-gray-600"
                >
                  Dashboard
                </router-link>
                <div class="border-t"></div>
                <button
                  @click="handleSignout"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:text-gray-600"
                >
                  Sign out
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <router-link to="/sign-in">
              <button class="px-2 py-1 border border-transparent rounded bg-white">Sign In</button>
            </router-link>
          </template>

          <!-- Mobile navbar toggle -->
          <button class="bg-white p-2 rounded lg:hidden" @click="toggleNavbar">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile collapse menu -->
      <div v-if="navbarOpen" class="mt-4 lg:hidden">
        <router-link
          to="/"
          class="block px-4 py-2 hover:bg-black"
          :class="{ 'text-white': path === '/', 'text-gray-500': path !== '/' }"
        >
          Home
        </router-link>
        <router-link
          to="/about"
          class="block px-4 py-2 hover:bg-black"
          :class="{ 'text-white': path === '/about', 'text-gray-500': path !== '/about' }"
        >
          About
        </router-link>
        <router-link
          to="/projects"
          class="block px-4 py-2 hover:bg-black"
          :class="{
            'text-white': path === '/projects',
            'text-gray-500': path !== '/projects',
          }"
        >
          Projects
        </router-link>
      </div>
    </nav>
  </div>
</template>

<style></style>
