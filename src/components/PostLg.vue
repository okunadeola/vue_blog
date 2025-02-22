<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { CalendarDaysIcon, ClockIcon } from 'lucide-vue-next'
import type { Blog } from '@/models'

const props = defineProps<{
  post: Blog
}>()

const router = useRouter()

const viewDetail = (slug: string) => {
  router.push(`/postdetail/${slug}`)
}

const formattedDate = computed(() => {
  return props.post && props.post.createdAt
    ? dayjs(new Date(props.post.createdAt)).format('MMM d, YYYY')
    : ''
})

const readTime = computed(() => {
  return props.post && props.post.content ? Math.round(props.post.content.length / 1000) : 0
})
</script>

<template>
  <div
    class="group rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full relative min-w-[500px]"
    @click="viewDetail(post?.slug)"
  >
    <img
      :src="post?.image"
      :alt="post?.title"
      class="w-full h-64 bg-red-500 object-cover transition-transform duration-500 group-hover:scale-105"
    />
    <div
      class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"
    ></div>
    <div class="relative p-6">
      <span class="inline-block px-3 py-1 bg-blue-500 text-white rounded-full text-sm mb-3">
        {{ post?.category }}
      </span>
      <h4 class="text-xl font-semibold mb-2 line-clamp-2">
        {{ post?.title }}
      </h4>
      <p class="text-gray-600 mb-4 line-clamp-2 dark:text-gray-400">
        {{ post?.subtitle }}
      </p>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="flex items-center">
            <CalendarDaysIcon class="my-icon h-4 w-4 mr-2 text-gray-400" />
            <span class="text-sm text-gray-500">
              {{ formattedDate }}
            </span>
          </div>
          <div class="flex items-center">
            <ClockIcon class="my-icon h-4 w-4 mr-2 text-gray-400" />
            <span class="text-sm text-gray-500"> {{ readTime }} mins read </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style></style>
