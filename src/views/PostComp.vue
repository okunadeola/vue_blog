<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PostLg from '@/components/PostLg.vue'
import PostMd from '@/components/PostMd.vue'

import axios from 'axios'
import dayjs from 'dayjs'
import { FilePlus, CalendarDays, Clock, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { Blog } from '@/models'
import HeaderComp from '../components/HeaderComp.vue'
import FooterComp from '../components/FooterComp.vue'

// Reactive states
const blogList = ref<Blog[]>([])
const featuresPost = ref<Blog | null>(null)
const showNextRelatedPosts = ref(false)
const scrollAmount = 500

const scrollContainer = ref<HTMLElement | null>(null)

const router = useRouter()

// Fetch posts data
async function fetchPosts() {
  try {
    const response = await axios.get('http://localhost:3000/api/post/getposts')
    blogList.value = response.data.posts.map((item: any) => ({
      _id: item._id,
      title: item.title,
      subtitle: item.subtitle,
      tags: item.tags,
      image: item.image,
      createdAt: item.createdAt,
      status: item.status,
      content: item.content,
      category: item.category,
      slug: item.slug,
      user: item.userId,
    }))
  } catch (error) {
    console.error('Error fetching posts', error)
  }
}

async function loadFeatured() {
  try {
    const res = await axios.get('http://localhost:3000/api/featured/get')
    const featuredPostId = res.data.postId

    if (blogList.value.length === 0) {
      await fetchPosts()
    }
    const init = blogList.value.find((e) => e._id === featuredPostId)
    featuresPost.value = init || blogList.value[0] || null
  } catch (error) {
    console.error('Error loading featured post', error)
  }
}

onMounted(async () => {
  await fetchPosts()
  await loadFeatured()
})

// Scroll functions for Latest Posts
function scrollLeft() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth',
    })
  }
}

function scrollRight() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    })
  }
}

function handleNextRelatedPosts() {
  showNextRelatedPosts.value = !showNextRelatedPosts.value
}

// Navigate to post detail
function viewDetail(slug: string) {
  router.push(`/postdetail/${slug}`)
}

function formatDate(dateString: string): string {
  return dayjs(dateString).format('MMM D, YYYY')
}

function calculateReadTime(content: string): number {
  return Math.max(1, Math.floor(content.length / 1000))
}
</script>

<template>
  <div>
    <!-- Header -->
    <HeaderComp />

    <div class="flex flex-col gap-6 p-28 py-10 px-3 max-w-6xl mx-auto">
      <!-- Top icon -->
      <FilePlus />

      <div class="h-full min-h-[50vh] items-center">
        <div v-if="featuresPost">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <section class="mb-16 cursor-pointer" @click="viewDetail(featuresPost.slug)">
              <div class="relative rounded-xl overflow-hidden group">
                <img
                  :src="featuresPost.image"
                  :alt="featuresPost.title"
                  class="w-full h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-8"
                >
                  <div class="max-w-3xl">
                    <span
                      class="inline-block px-3 py-1 bg-blue-500 text-white rounded-full text-sm mb-4"
                    >
                      {{ featuresPost.category }}
                    </span>
                    <h2 class="text-4xl font-bold text-white mb-4 leading-tight">
                      {{ featuresPost.title }}
                    </h2>
                    <p class="text-gray-200 text-lg mb-4">
                      {{ featuresPost.subtitle }}
                    </p>
                    <div class="flex items-center space-x-6">
                      <div class="flex items-center text-gray-300 gap-x-1">
                        <CalendarDays class="my-icon w-5 h-5" />
                        {{ formatDate(featuresPost.createdAt) }}
                      </div>
                      <div class="flex items-center text-gray-300 gap-x-1">
                        <Clock class="my-icon w-5 h-5" />
                        {{ calculateReadTime(featuresPost.content) }} mins read
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
        <div v-else>
          <!-- Spinner -->
          <div class="flex items-center justify-center">
            <span class="spinner mr-3"></span>
            <span>Loading...</span>
          </div>
        </div>
      </div>

      <!-- Latest Posts Section -->
      <section class="mb-16">
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-2xl font-bold">Latest Posts</h3>
          <div class="flex space-x-2">
            <button
              @click="scrollLeft"
              class="p-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              <ChevronLeft class="my-icon w-5 h-5" />
            </button>
            <button
              @click="scrollRight"
              class="p-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              <ChevronRight class="my-icon w-5 h-5" />
            </button>
          </div>
        </div>
        <div class="overflow-hidden rounded-xl">
          <div class="flex transition-transform duration-500 ease-in-out">
            <div
              ref="scrollContainer"
              class="flex flex-row flex-nowrap gap-6 overflow-x-auto w-full scroll-smooth scrollbar-thumb-slate-200 scrollbar-thin"
            >
              <PostLg v-for="post in blogList" :key="post._id" :post="post" />
            </div>
          </div>
        </div>
      </section>

      <!-- More Posts Section -->
      <section class="mb-16">
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-2xl font-bold">More Posts</h3>
          <div class="flex space-x-2">
            <button
              @click="handleNextRelatedPosts"
              :class="
                showNextRelatedPosts ? 'bg-gray-200' : 'bg-[#43434a]/80 backdrop-blur-sm text-white'
              "
              class="p-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              <ChevronLeft class="my-icon w-5 h-5" />
            </button>
            <button
              @click="handleNextRelatedPosts"
              :class="
                showNextRelatedPosts ? 'bg-gray-200' : 'bg-[#43434a]/80 backdrop-blur-sm text-white'
              "
              class="p-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              <ChevronRight class="my-icon w-5 h-5" />
            </button>
          </div>
        </div>
        <div class="overflow-hidden">
          <div
            class="flex transition-transform duration-500 ease-in-out"
            :style="{
              transform: showNextRelatedPosts ? 'translateX(-50%)' : 'translateX(0)',
            }"
          >
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-full">
              <PostMd v-for="post in blogList" :key="post._id" :post="post" />
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Footer -->
    <FooterComp />
  </div>
</template>

<style></style>
