<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PostMd from '@/components/PostMd.vue'
import HeaderComp from '../components/HeaderComp.vue'
import FooterComp from '../components/FooterComp.vue'

import { getPostByQuery } from '@/API/rests'

// Sidebar filter state
const sidebarData = reactive({
  searchTerm: '',
  sort: 'desc',
  category: '',
})

const posts = ref<any[]>([])
const loading = ref(false)
const showMore = ref(false)

const route = useRoute()
const router = useRouter()

function fetchPosts() {
  loading.value = true
  // Use the query parameters from the current route.
  const currentParams = route.query
  const searchQuery = new URLSearchParams(currentParams as Record<string, string>).toString()

  getPostByQuery(searchQuery)
    .then((data: any) => {
      posts.value = data?.data.posts
      loading.value = false
      showMore.value = data?.data.posts.length === 9
    })
    .catch((err: any) => {
      console.error(err)
      loading.value = false
    })
}

// Watch for changes to the route's query parameters.
// This will update the sidebar filters and fetch posts.
watch(
  () => route.query,
  (newQuery) => {
    sidebarData.searchTerm = (newQuery.searchTerm as string) || ''
    sidebarData.sort = (newQuery.sort as string) || 'desc'
    sidebarData.category = (newQuery.category as string) || ''
    fetchPosts()
  },
  { immediate: true },
)

function handleSubmit(event: Event) {
  event.preventDefault()
  const newParams = {
    searchTerm: sidebarData.searchTerm,
    sort: sidebarData.sort,
    category: sidebarData.category,
  }

  router.push({ path: '/search', query: newParams })
}

function handleShowMore() {
  const startIndex = posts.value.length
  const currentParams = { ...route.query, startIndex: startIndex.toString() }
  const searchQuery = new URLSearchParams(currentParams as Record<string, string>).toString()

  getPostByQuery(searchQuery)
    .then((data: any) => {
      posts.value = [...posts.value, ...data?.data.posts]
      showMore.value = data?.data.posts.length === 9
    })
    .catch((err: any) => {
      console.error(err)
    })
}
</script>

<template>
  <HeaderComp :fromSearch="true" />

  <div class="flex flex-col md:flex-row">
    <!-- Sidebar / Filters -->
    <div
      class="p-7 py-10 border-b-slate-400 md:border-r-slate-600 md:min-h-screen border-gray-500 shadow-md"
    >
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-8">
        <!-- Search Term -->
        <div class="flex items-center gap-2">
          <label class="whitespace-nowrap font-semibold italic font-mono w-1/3 pr-2">
            Search Term:
          </label>
          <input
            type="text"
            id="searchTerm"
            placeholder="Search..."
            class="border rounded px-2 py-1"
            v-model="sidebarData.searchTerm"
            name="searchTerm"
          />
        </div>
        <!-- Sort -->
        <div class="flex items-center gap-2">
          <label class="font-semibold italic w-1/3 font-mono">Sort:</label>
          <select id="sort" class="border rounded px-2 py-1" v-model="sidebarData.sort" name="sort">
            <option value="desc">Latest</option>
            <option value="asc">Oldest</option>
          </select>
        </div>
        <!-- Category -->
        <div class="flex items-center gap-2">
          <label class="font-semibold italic w-1/3 font-mono">Category:</label>
          <input
            type="text"
            id="category"
            placeholder="category"
            class="border rounded px-2 py-1"
            v-model="sidebarData.category"
            name="category"
          />
        </div>
        <button
          type="submit"
          class="border rounded px-4 py-2 outline bg-gradient-to-r from-purple-500 to-pink-500 text-white font-mono"
        >
          Apply Filters
        </button>
      </form>
    </div>

    <!-- Posts Section -->
    <div class="w-full">
      <h1 class="text-xl px-10 font-semibold sm:border-b border-gray-300 p-3 mt-5">
        Posts results:
      </h1>
      <div class="p-7 flex flex-wrap gap-4">
        <p v-if="!loading && posts.length === 0" class="text-xl text-gray-500">No posts found.</p>
        <!-- Loading spinner -->
        <div v-if="loading" class="text-xl text-gray-500">
          <div class="flex items-center justify-center">
            <span class="spinner mr-3"></span>
            <span>Loading...</span>
          </div>
        </div>
        <!-- List of posts -->
        <div v-if="!loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 min-w-full">
          <div v-for="post in posts" :key="post._id" class="max-w-[400px]">
            <PostMd :post="post" />
          </div>
        </div>
        <button
          v-if="showMore"
          @click="handleShowMore"
          class="text-teal-500 text-lg hover:underline p-7 w-full"
        >
          Show More
        </button>
      </div>
    </div>
  </div>

  <FooterComp />
</template>
<style></style>
