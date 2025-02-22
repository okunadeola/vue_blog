<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'

import { getUsers, getPosts, getComments } from '@/API/rests'

const users = ref<any[]>([])
const comments = ref<any[]>([])
const posts = ref<any[]>([])

const totalUsers = ref(0)
const totalPosts = ref(0)
const totalComments = ref(0)
const lastMonthUsers = ref(0)
const lastMonthPosts = ref(0)
const lastMonthComments = ref(0)

async function fetchUsers() {
  try {
    const data = await getUsers()
    users.value = data.data.users
    totalUsers.value = data.data.totalUsers
    lastMonthUsers.value = data.data.lastMonthUsers
  } catch (err: any) {
    console.error(err.message)
  }
}

async function fetchPosts() {
  try {
    const data = await getPosts()
    posts.value = data.data.posts
    totalPosts.value = data.data.totalPosts
    lastMonthPosts.value = data.data.lastMonthPosts
  } catch (err: any) {
    console.error(err.message)
  }
}

async function fetchComments() {
  try {
    const data = await getComments()
    comments.value = data.data.comments
    totalComments.value = data.data.totalComments
    lastMonthComments.value = data.data.lastMonthComments
  } catch (err: any) {
    console.error(err.message)
  }
}

onMounted(() => {
  fetchUsers()
  fetchPosts()
  fetchComments()
})
</script>

<template>
  <div class="flex flex-col w-full py-10 px-4">
    <!-- Metrics Cards -->
    <div class="flex flex-wrap gap-5 mb-10 items-center">
      <!-- Total Users Card -->
      <div
        class="flex flex-col p-3 bg-white dark:bg-slate-800 gap-4 w-full sm:w-[30%] rounded-sm shadow-sm"
      >
        <div class="flex justify-between">
          <div>
            <h3 class="text-gray-500 text-md uppercase">Total Users</h3>
            <p class="text-2xl">{{ totalUsers }}</p>
          </div>
          <span class="bg-teal-200 text-white rounded-full text-5xl p-3 shadow-sm">👥</span>
        </div>
        <div class="flex gap-2 text-sm">
          <span class="text-green-500 flex items-center">
            <span class="text-lg">↑</span> {{ lastMonthUsers }}
          </span>
          <div class="text-gray-500">Last month</div>
        </div>
      </div>

      <!-- Total Comments Card -->
      <div
        class="flex flex-col p-3 bg-white dark:bg-slate-800 gap-4 w-full sm:w-[30%] rounded-md shadow-sm"
      >
        <div class="flex justify-between">
          <div>
            <h3 class="text-gray-500 text-md uppercase">Total Comments</h3>
            <p class="text-2xl">{{ totalComments }}</p>
          </div>
          <span class="bg-indigo-200 text-white rounded-full text-5xl p-3 shadow-sm">💬</span>
        </div>
        <div class="flex gap-2 text-sm">
          <span class="text-green-500 flex items-center">
            <span class="text-lg">↑</span> {{ lastMonthComments }}
          </span>
          <div class="text-gray-500">Last month</div>
        </div>
      </div>

      <!-- Total Posts Card -->
      <div
        class="flex flex-col p-3 bg-white dark:bg-slate-800 gap-4 w-full sm:w-[30%] rounded-md shadow-sm"
      >
        <div class="flex justify-between">
          <div>
            <h3 class="text-gray-500 text-md uppercase">Total Posts</h3>
            <p class="text-2xl">{{ totalPosts }}</p>
          </div>
          <span class="bg-lime-200 text-white rounded-full text-5xl p-3 shadow-sm">📄</span>
        </div>
        <div class="flex gap-2 text-sm">
          <span class="text-green-500 flex items-center">
            <span class="text-lg">↑</span> {{ lastMonthPosts }}
          </span>
          <div class="text-gray-500">Last month</div>
        </div>
      </div>
    </div>

    <!-- Recent Users and Recent Comments -->
    <div class="grid lg:grid-cols-2 gap-4 py-3">
      <!-- Recent Users -->
      <div class="flex flex-col w-full shadow-sm p-2 rounded-md bg-white dark:bg-gray-800">
        <div class="flex justify-between p-3 text-sm font-semibold">
          <h1 class="text-center p-2">Recent Users</h1>
          <router-link
            to="/admin/users"
            class="px-4 py-2 border border-transparent rounded hover:underline text-purple-900"
          >
            See all
          </router-link>
        </div>
        <table class="min-w-full">
          <thead class="bg-gray-100 font-sans uppercase text-md">
            <tr class="border-b">
              <th class="py-2 px-3 text-left">User image</th>
              <th class="py-2 px-3 text-left">Username</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr v-for="user in users" :key="user._id" class="border-b dark:border-gray-700">
              <td class="py-2 px-3">
                <img
                  :src="user.profilePicture"
                  alt="user"
                  class="w-10 h-10 rounded-full bg-gray-500"
                />
              </td>
              <td class="py-2 px-3">{{ user.username }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Recent Comments -->
      <div class="flex flex-col w-full shadow-sm p-2 rounded-md bg-white dark:bg-gray-800">
        <div class="flex justify-between p-3 text-sm font-semibold">
          <h1 class="text-center p-2">Recent Comments</h1>
          <router-link
            to="/admin/comments"
            class="px-4 py-2 border border-transparent rounded hover:underline text-purple-900"
          >
            See all
          </router-link>
        </div>
        <table class="min-w-full">
          <thead class="bg-gray-100 font-sans uppercase text-md">
            <tr class="border-b">
              <th class="py-2 px-3 text-left line-clamp-1">Comment content</th>
              <th class="py-2 px-3 text-left">Likes</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr
              v-for="comment in comments"
              :key="comment._id"
              class="border-b dark:border-gray-700"
            >
              <td class="py-2 px-3 w-96">
                <p class="line-clamp-2">{{ comment.content }}</p>
              </td>
              <td class="py-2 px-3">{{ comment.numberOfLikes }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent Posts Section -->
    <div class="flex flex-col my-10 w-full shadow-sm p-2 rounded-md bg-white dark:bg-gray-800">
      <div class="flex justify-between p-3 text-sm font-semibold">
        <h1 class="text-center p-2">Recent Posts</h1>
        <router-link
          to="/admin/posts"
          class="px-4 py-2 border border-transparent rounded hover:underline text-purple-900"
        >
          See all
        </router-link>
      </div>
      <table class="min-w-full">
        <thead class="bg-gray-100 font-sans uppercase text-md">
          <tr class="border-b">
            <th class="py-2 px-3 text-left">Image</th>
            <th class="py-2 px-3 text-left">Title</th>
            <th class="py-2 px-3 text-left">Category</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <tr v-for="post in posts" :key="post._id" class="border-b dark:border-gray-700">
            <td class="py-2 px-3">
              <img :src="post.image" alt="post" class="w-14 h-10 rounded-md bg-gray-500" />
            </td>
            <td class="py-2 px-3 line-clamp-2">{{ post.title }}</td>
            <td class="py-2 px-3">
              <span class="inline-block px-3 py-1 bg-blue-400 text-white rounded-full text-sm">
                {{ post.category }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<style></style>
