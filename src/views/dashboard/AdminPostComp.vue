<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import WarningPopup from '@/components/WarningPopup.vue'
import { toast } from '@steveyuowo/vue-hot-toast'
import { useAuthStore } from '@/stores/auth'

import { getAllPosts, deletePost } from '@/API/rests'

const router = useRouter()
const authStore = useAuthStore()

// Data state
const userPosts = ref<any[]>([])
const loading = ref(false)
const filterText = ref('')
const showMore = ref(true)
const showModal = ref(false)
const postIdToDelete = ref('')

// Computed filtered posts based on filterText
const filteredPosts = computed(() => {
  if (!filterText.value) {
    return userPosts.value
  }
  const filter = filterText.value.toLowerCase()
  return userPosts.value.filter(
    (post) =>
      post.title.toLowerCase().includes(filter) || post.category.toLowerCase().includes(filter),
  )
})

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString()
}

async function fetchPosts(startIndex = 0) {
  loading.value = true
  try {
    const data = await getAllPosts(startIndex)

    if (startIndex === 0) {
      userPosts.value = data.data.posts
    } else {
      userPosts.value = [...userPosts.value, ...data.data.posts]
    }
    if (data.data.posts.length < 9) {
      showMore.value = false
    }
  } catch (err: any) {
    console.error(err.message)
  } finally {
    loading.value = false
  }
}

async function handleShowMore() {
  const startIndex = userPosts.value.length
  await fetchPosts(startIndex)
}

function confirmDelete(postId: string) {
  postIdToDelete.value = postId
  showModal.value = true
}

async function handleDeletePost() {
  showModal.value = false
  try {
    await deletePost(authStore?.currentUser!._id, postIdToDelete.value)
    userPosts.value = userPosts.value.filter((post) => post._id !== postIdToDelete.value)
    toast.success('Post deleted successfully')
  } catch (err: any) {
    console.error(err.message)
    toast.error(err.response?.data?.message || err.message)
  }
}

function editPost(post: any) {
  router.push(`/admin/create/${post._id}`)
}

onMounted(() => {
  fetchPosts(0)
})
</script>

<template>
  <div class="p-3 py-16">
    <div v-if="authStore.currentUser?.isAdmin">
      <!-- Loading Spinner -->
      <div v-if="loading" class="flex items-center justify-center">
        <div class="spinner"></div>
      </div>

      <!-- Data Table -->
      <div v-if="!loading && userPosts.length > 0">
        <!-- Filter Input -->

        <div class="md:max-w-[70vw] mx-auto">
          <input
            type="text"
            v-model="filterText"
            placeholder="Filter posts by title or category..."
            class="filter-input mb-4 p-2 border rounded max-w-72"
          />
          <DataTable
            :value="filteredPosts"
            responsiveLayout="scroll"
            class="shadow-md bg-white dark:bg-gray-800 rounded overflow-auto"
            stripedRows
            size="small"
          >
            <!-- Image Column -->
            <Column header="Image">
              <template #body="slotProps">
                <router-link :to="`/post/${slotProps.data.slug}`">
                  <img
                    :src="slotProps.data.image"
                    :alt="slotProps.data.title"
                    class="w-20 h-8 object-cover bg-gray-500 rounded-md"
                  />
                </router-link>
              </template>
            </Column>

            <!-- Title Column -->
            <Column header="Title">
              <template #body="slotProps">
                <router-link
                  :to="`/post/${slotProps.data.slug}`"
                  class="font-medium text-gray-900 dark:text-white line-clamp-2"
                >
                  {{ slotProps.data.title }}
                </router-link>
              </template>
            </Column>

            <!-- Category Column -->
            <Column header="Category" field="category" sortable></Column>

            <!-- Date Updated Column -->
            <Column header="Date Updated">
              <template #body="slotProps">
                {{ formatDate(slotProps.data.updatedAt) }}
              </template>
            </Column>

            <!-- Delete Column -->
            <Column header="Delete">
              <template #body="slotProps">
                <button
                  @click="confirmDelete(slotProps.data._id)"
                  class="text-red-500 hover:underline"
                >
                  🗑️
                </button>
              </template>
            </Column>

            <!-- Edit Column -->
            <Column header="Edit">
              <template #body="slotProps">
                <button @click="editPost(slotProps.data)" class="text-teal-500 hover:underline">
                  ✏️
                </button>
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- Show More Button -->
        <div v-if="showMore" class="mt-4">
          <button @click="handleShowMore" class="w-full text-teal-500 text-sm py-4">
            Show more
          </button>
        </div>
      </div>

      <!-- No Posts Message -->
      <div v-if="!loading && userPosts.length === 0" class="text-center text-gray-500">
        You have no posts yet!
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50"
    >
      <WarningPopup title="post" @onDelete="handleDeletePost" @onClose="showModal = false" />
    </div>
  </div>
</template>
<style></style>
