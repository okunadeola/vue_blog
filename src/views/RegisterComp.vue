<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { toast } from '@steveyuowo/vue-hot-toast'
import type { CurrentUser } from '@/models'
import { baseURL } from '@/API/restServices'

const formData = reactive({
  email: '',
  username: '',
  password: '',
})

const loading = ref(false)
const errorMessage = ref<string | null>(null)

const router = useRouter()
const authStore = useAuthStore()

function showSuccess() {
  toast.success('Hello world!')
}

async function handleSubmit() {
  if (!formData.email || !formData.password || !formData.username) {
    errorMessage.value = 'Please fill all the fields'
    return
  }
  loading.value = true
  errorMessage.value = null

  try {
    const response = await axios.post(`${baseURL}/auth/signup`, formData)
    const data = response.data

    if (data.success === false) {
      errorMessage.value = data.message
    } else {
      const currentUser: CurrentUser = {
        email: data.email,
        isAdmin: data.isAdmin,
        profilePicture: data.profilePicture,
        username: data.username,
        _id: data._id,
        createdAt: data.createdAt,
      }

      authStore.signInSuccess(currentUser)
      toast.success('sign up is successful!', { duration: 10000 })

      localStorage.setItem('blog_auth_token_vue', data.access_token)
      router.push('/sign-in')
    }
  } catch (err: any) {
    errorMessage.value = err.message
    toast.error(err.response?.data?.message || err.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center flex-col gap-5 justify-center bg-gray-100 text-gray-700 dark:text-gray-200 dark:bg-[rgb(16,23,42)]"
  >
    <div
      @click="showSuccess"
      class="self-center whitespace-nowrap text-sm sm:text-xl font-semibold cursor-pointer"
    >
      <span
        class="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-zinc-500 rounded-lg text-white"
      >
        Tech
      </span>
      Blog
    </div>

    <!-- Sign In form container -->
    <div class="w-full max-w-md bg-white p-8 rounded-lg shadow-lg font-mono">
      <h2 class="text-xl font-mono font-bold text-center mb-6">Sign Up</h2>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700"> Username </label>
          <input
            type="username"
            id="username"
            required
            placeholder="Username"
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            v-model="formData.username"
          />
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700"> Email address </label>
          <input
            type="email"
            id="email"
            required
            placeholder="name@company.com"
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            v-model="formData.email"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700"> Password </label>
          <input
            type="password"
            id="password"
            required
            placeholder="**********"
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            v-model="formData.password"
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          <template v-if="loading">
            <span class="spinner mr-3"></span>
            <span>Loading...</span>
          </template>
          <template v-else> Sign Up </template>
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm">
          Already have an account?
          <router-link to="/sign-in" class="font-medium text-indigo-600 hover:text-indigo-500">
            Sign In
          </router-link>
        </p>
      </div>

      <div
        v-if="errorMessage"
        class="mt-4 p-3 bg-red-100 border border-red-300 text-red-500 text-sm text-center"
      >
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<style></style>
