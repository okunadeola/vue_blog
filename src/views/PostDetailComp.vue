<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import FooterComp from '@/components/FooterComp.vue'
import HeaderComp from '@/components/HeaderComp.vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { CheckCircleIcon } from 'lucide-vue-next'
import { getPostBySlug, getRecentPost } from '@/API/rests'
import type { Blog } from '@/models'
import CoomentComp from '@/components/CoomentComp.vue'

// Reactive state
const post = ref<Blog | null>(null)
const recentPosts = ref<Array<Blog>>([])
const blocks = ref<any>(null)
const isCopying = ref(false)
const author = ref({
  bio: 'This is a short author bio that gives some background information.',
})

const route = useRoute()
const slug = route.params.slug as string

function formatDate(dateStr: any, formatStr: any) {
  return dayjs(new Date(dateStr)).format(formatStr)
}

async function fetchPost() {
  try {
    const data = await getPostBySlug(slug)

    const dt = data.posts.map((item: any) => ({
      title: item.title,
      subtitle: item.subtitle,
      tags: item.tags,
      image: item.image,
      createdAt: item.createdAt,
      status: item.status,
      content: item.content,
      category: item.category,
      slug: item.slug,
      _id: item._id,
      user: item.userId,
    }))
    post.value = dt[0]
    if (post.value && post.value.content) {
      blocks.value = JSON.parse(post.value.content)
    }
  } catch (error) {
    console.error('Error fetching post:', error)
  }
}

async function fetchRecentPosts() {
  try {
    const data = await getRecentPost()
    const dt = data.posts.map((item: any) => ({
      title: item.title,
      subtitle: item.subtitle,
      tags: item.tags,
      image: item.image,
      createdAt: item.createdAt,
      status: item.status,
      content: item.content,
      category: item.category,
      slug: item.slug,
      _id: item._id,
      user: item.userId,
    }))
    recentPosts.value = dt
  } catch (error) {
    console.error('Error fetching recent posts:', error)
  }
}

async function copyToClipboard(text: any) {
  try {
    await navigator.clipboard.writeText(text)
    isCopying.value = true
    setTimeout(() => {
      isCopying.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy text:', err)
  }
}

onMounted(() => {
  fetchPost()
  fetchRecentPosts()
})
</script>

<template>
  <HeaderComp />

  <div v-if="post">
    <main class="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
      <!-- Title & Subtitle -->
      <h1 class="text-3xl mt-10 p-3 text-center max-w-2xl mx-auto lg:text-4xl font-serif">
        {{ post.title }}
      </h1>
      <p class="text-sm text-gray-600 text-center mx-auto lg:text-lg dark:text-gray-400">
        {{ post.subtitle }}
      </p>

      <!-- Category Button -->
      <router-link
        :to="{ path: '/search', query: { category: post.category } }"
        class="self-center mt-5"
      >
        <button class="bg-gray-500 rounded-full px-4 py-2 text-white text-xs">
          {{ post.category }}
        </button>
      </router-link>

      <!-- Article Image -->
      <img
        :src="post.image"
        :alt="post.title"
        class="mt-10 p-3 max-h-[600px] w-full object-cover"
      />

      <div class="flex justify-between p-3 border-b border-slate-500 mx-auto w-full text-xs">
        <span>{{ formatDate(post.createdAt, 'MMM D, YYYY') }}</span>
        <span class="italic"> {{ (post.content.length / 1000).toFixed(0) }} mins read </span>
      </div>

      <!-- Article Content (Blocks) -->
      <div class="p-3 mx-auto w-full post-content mt-10">
        <template v-if="blocks && blocks.blocks">
          <template v-for="(block, i) in blocks.blocks" :key="i">
            <!-- Header Block -->
            <template v-if="block.type === 'header'">
              <template v-if="block.data.level === 1">
                <h1 class="text-2xl font-bold mb-4" v-html="block.data.text"></h1>
              </template>
              <template v-else-if="block.data.level === 2">
                <h2 class="text-2xl font-bold mb-4" v-html="block.data.text"></h2>
              </template>
              <template v-else-if="block.data.level === 3">
                <h3 class="text-2xl font-bold mb-4" v-html="block.data.text"></h3>
              </template>
              <template v-else-if="block.data.level === 4">
                <h4 class="text-2xl font-bold mb-4" v-html="block.data.text"></h4>
              </template>
              <template v-else-if="block.data.level === 5">
                <h5 class="text-2xl font-bold mb-4" v-html="block.data.text"></h5>
              </template>
              <template v-else-if="block.data.level === 6">
                <h6 class="text-2xl font-bold mb-4" v-html="block.data.text"></h6>
              </template>
              <template v-else>
                <h2 class="text-2xl font-bold mb-4" v-html="block.data.text"></h2>
              </template>
            </template>

            <!-- Paragraph Block -->
            <template v-else-if="block.type === 'paragraph'">
              <p class="mb-4" v-html="block.data.text"></p>
            </template>

            <!-- Image Block -->
            <template v-else-if="block.type === 'image'">
              <figure class="my-8">
                <img
                  :src="block.data.file.url"
                  :alt="block.data.caption || ''"
                  class="rounded-lg max-h-[30rem] object-contain"
                />
                <figcaption v-if="block.data.caption" class="text-gray-500 mt-2">
                  {{ block.data.caption }}
                </figcaption>
              </figure>
            </template>

            <!-- List Block -->
            <template v-else-if="block.type === 'list'">
              <template v-if="block.data.style === 'ordered'">
                <ol class="list-decimal ml-6 mb-4">
                  <li v-for="(item, j) in block.data.items" :key="j">
                    <span v-html="item?.content || item"></span>
                  </li>
                </ol>
              </template>
              <template v-else>
                <ul class="list-disc ml-6 mb-4">
                  <li v-for="(item, j) in block.data.items" :key="j">
                    <span v-html="item?.content || item"></span>
                  </li>
                </ul>
              </template>
            </template>

            <!-- Quote Block -->
            <template v-else-if="block.type === 'quote'">
              <blockquote class="border-l-4 border-blue-500 pl-4 my-4">
                <p class="italic">{{ block.data.text }}</p>
                <cite v-if="block.data.caption" class="block mt-2 text-sm">
                  — {{ block.data.caption }}
                </cite>
              </blockquote>
            </template>

            <!-- Code Block -->
            <template v-else-if="block.type === 'code'">
              <pre class="bg-gray-200 p-4 rounded-lg my-4 overflow-x-auto relative">
                <div
                  class="absolute right-4 top-4 rounded-md p-1 cursor-pointer bg-slate-500 hover:bg-gray-700 flex items-center justify-center text-white text-xs"
                  @click="copyToClipboard(block.data.code)"
                >
                  <span v-if="!isCopying" class="dark:text-white">Copy</span>
                  <template v-else>
                    <CheckCircleIcon class="my-icon w-5 h-5" />
                  </template>
                </div>
                <code class="dark:text-gray-700">{{ block.data.code }}</code>
              </pre>
            </template>

            <!-- Table Block -->
            <template v-else-if="block.type === 'table'">
              <div class="overflow-x-auto my-4">
                <table class="min-w-full border border-gray-200">
                  <tbody>
                    <tr v-for="(row, rowIndex) in block.data.content" :key="rowIndex">
                      <td
                        v-for="(cell, cellIndex) in row"
                        :key="cellIndex"
                        class="border border-gray-200 p-2"
                      >
                        {{ cell }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>

            <!-- Link Block -->
            <template v-else-if="block.type === 'link'">
              <a
                :href="block.data.link"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:underline"
              >
                {{ block.data.text }}
              </a>
            </template>

            <!-- Related Post Block -->
            <template v-else-if="block.type === 'relatedPost'">
              <div class="related-post-display">
                <a :href="block.data.url" target="_blank" rel="noopener noreferrer">
                  <h3>{{ block.data.title }}</h3>
                </a>
                <p>{{ block.data.description }}</p>
              </div>
            </template>

            <!-- Default: Unhandled Block -->
            <template v-else> </template>
          </template>
        </template>
      </div>

      <!-- Tags -->
      <div class="max-w-4xl">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(tag, index) in post.tags.split(',')"
            :key="index"
            class="bg-gray-500 rounded-full px-4 py-2 text-white text-xs"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- Author Bio -->
      <div class="max-w-4xl mx-auto mt-12 bg-gray-50 rounded-xl p-8">
        <div class="flex items-start space-x-6">
          <img
            :src="post.user.profilePicture || 'https://placehold.co/600x400/png'"
            :alt="post.user.username"
            class="w-16 h-16 rounded-full"
          />
          <div>
            <h3 class="text-xl font-semibold mb-2 dark:text-gray-700">
              {{ post.user.username }}
            </h3>
            <p class="text-gray-600 mb-4">{{ author.bio }}</p>
            <button
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Follow
            </button>
          </div>
        </div>
      </div>

      <!-- Comment Section -->
      <CoomentComp :postId="post._id" />

      <!-- Related Posts Section -->
      <section class="max-w-4xl mx-auto mt-16">
        <h2 class="text-2xl font-bold mb-8">Related Articles</h2>
        <div class="grid md:grid-cols-2 gap-8">
          <div
            v-for="(relatedPost, index) in recentPosts"
            :key="index"
            class="group cursor-pointer max-w-[400px]"
          >
            <div class="relative overflow-hidden rounded-xl mb-4">
              <img
                :src="relatedPost.image"
                :alt="relatedPost.title"
                class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <h3
              class="text-xl font-semibold mb-2 group-hover:text-blue-500 transition-colors line-clamp-2"
            >
              {{ relatedPost.title }}
            </h3>
            <div class="flex items-center text-gray-500 text-sm">
              <span class="mx-2">•</span>
              <span>{{ formatDate(relatedPost.createdAt, 'MMM D, YYYY') }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Back to Articles Button -->
      <router-link
        to="/"
        class="flex items-center space-x-2 mt-5 text-gray-600 hover:text-gray-900 transition-colors max-w-4xl cursor-pointer hover:bg-white p-1 rounded w-max dark:text-gray-400"
      >
        <span class="h-5 w-5">&larr;</span>
        <span>Back to Articles</span>
      </router-link>
    </main>
  </div>
  <div v-else>
    <div class="flex items-center justify-center min-h-screen">
      <span class="spinner mr-3"></span>
      <span>Loading...</span>
    </div>
  </div>

  <FooterComp />
</template>

<style></style>
