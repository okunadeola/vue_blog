<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { API } from '@/API/restServices'
import { LogOutIcon, MessageSquareTextIcon, HomeIcon, FileIcon, UserIcon } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const isSidebarOpen = ref(false)
const router = useRouter()
const authStore = useAuthStore()

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function toCreatePost() {
  router.push('/admin/create/0')
}

function signOut() {
  API.post(
    'http://localhost:3000/api/user/signout',
    {},
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
    .then(() => {
      authStore.signOut()
      localStorage.removeItem('blog_auth_token_vue')
      router.push('/sign-in')
    })
    .catch((err) => {
      console.error(err.message)
    })
}
</script>

<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <div
      :class="{
        'translate-x-0': isSidebarOpen,
        '-translate-x-full': !isSidebarOpen,
      }"
      class="bg-[#222124] text-white w-64 p-4 fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-20 lg:translate-x-0 lg:static h-screen flex flex-col"
    >
      <div class="flex flex-col">
        <div
          class="h-20 w-full p-10 flex items-center justify-center border-b border-[#2c2c2e] mx-auto mb-4"
        >
          <router-link
            to="/"
            class="self-center whitespace-nowrap text-sm sm:text-lg font-semibold dark:text-white"
          >
            <span
              class="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-zinc-500 rounded-lg text-white"
            >
              Tech
            </span>
            Blog
          </router-link>
        </div>

        <nav class="my-auto">
          <ul class="space-y-4">
            <li class="mb-4 rounded-md">
              <router-link
                to="/admin/dashboard"
                class="block py-2 px-4 hover:bg-gray-700 rounded cursor-pointer text-[#69696b]"
                active-class="bg-[#333235] active-link"
                exact
              >
                <div class="flex gap-5 items-center">
                  <HomeIcon class="my-icon h-4 w-4 text-[#959497]" />
                  <span>Dashboard</span>
                </div>
              </router-link>
            </li>
            <li class="mb-4 rounded-md">
              <router-link
                to="/admin/posts"
                class="block py-2 px-4 hover:bg-gray-700 rounded cursor-pointer text-[#69696b]"
                active-class="bg-[#333235] active-link"
                exact
              >
                <div class="flex gap-5 items-center">
                  <FileIcon class="my-icon h-4 w-4 text-[#959497]" />
                  <span>Posts</span>
                </div>
              </router-link>
            </li>
            <li class="mb-4 rounded-md">
              <router-link
                to="/admin/users"
                class="block py-2 px-4 hover:bg-gray-700 rounded cursor-pointer text-[#69696b]"
                active-class="bg-[#333235] active-link"
                exact
              >
                <div class="flex gap-5 items-center">
                  <UserIcon class="my-icon h-4 w-4 text-[#959497]" />
                  <span>Users</span>
                </div>
              </router-link>
            </li>
            <li class="mb-4 rounded-md">
              <router-link
                to="/admin/comments"
                class="block py-2 px-4 hover:bg-gray-700 rounded cursor-pointer text-[#69696b]"
                active-class="bg-[#333235] active-link"
                exact
              >
                <div class="flex gap-5 items-center">
                  <MessageSquareTextIcon class="my-icon h-4 w-4 text-[#959497]" />
                  <span>Comments</span>
                </div>
              </router-link>
            </li>
          </ul>
        </nav>
      </div>

      <div
        class="mt-auto h-20 w-full p-10 flex items-center justify-center border-y border-[#2c2c2e] mx-auto mb-4 cursor-pointer"
      >
        <div class="self-center whitespace-nowrap text-sm sm:text-md font-semibold dark:text-white">
          <div
            class="px-2 flex gap-2 items-center py-1 bg-gradient-to-r from-zinc-300 via-zinc-500 to-zinc-500 rounded-lg text-white hover:bg-gradient-to-l"
            @click="signOut"
          >
            <LogOutIcon class="my-icon h-4 w-4 text-black" />
            Sign Out
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay for small screens -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden cursor-pointer"
      @click="toggleSidebar"
    ></div>

    <!-- Main Content Area -->
    <div class="flex-1 ml-0 flex flex-col">
      <!-- Navbar -->
      <div class="bg-white border-b p-4 flex justify-between items-center">
        <!-- Sidebar Toggle (visible on small screens) -->
        <button class="lg:hidden text-gray-700" @click="toggleSidebar">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h1 class="text-xl font-semibold">Admin Dashboard</h1>
        <button class="ring-1 text-gray-900 px-4 py-2 rounded cursor-pointer" @click="toCreatePost">
          Create Post
        </button>
      </div>
      <!-- Content Section -->
      <div class="p-6 flex-1 overflow-auto bg-[#f5f5f5]">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
<style></style>
