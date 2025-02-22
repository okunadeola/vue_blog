<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import WarningPopup from '@/components/WarningPopup.vue'
import { useAuthStore } from '@/stores/auth'
import { getAllComments, deleteComment } from '@/API/rests'
import { toast } from '@steveyuowo/vue-hot-toast'

const authStore = useAuthStore()
const currentUser = computed(() => authStore.currentUser)

const comments = ref<Array<any>>([])
const filterText = ref('')
const dtFilters = ref({
  global: { value: '', matchMode: 'contains' },
})
const showMore = ref(true)
const showModal = ref(false)
const commentIdToDelete = ref('')
const loading = ref(false)

function onGlobalFilter() {
  dtFilters.value.global.value = filterText.value
}

function formatDate(dateString: any) {
  return new Date(dateString).toLocaleDateString()
}

function fetchComments() {
  loading.value = true
  getAllComments(0)
    .then((data) => {
      comments.value = data.data.comments
      if (data.data.comments.length < 9) {
        showMore.value = false
      }
    })
    .catch((err) => {
      console.error(err.message)
    })
    .finally(() => {
      loading.value = false
    })
}

function handleShowMore() {
  const startIndex = comments.value.length
  getAllComments(startIndex)
    .then((data) => {
      const newComments = data.data.comments
      comments.value = [...comments.value, ...newComments]
      if (newComments.length < 9) {
        showMore.value = false
      }
    })
    .catch((err) => console.error(err.message))
}

function confirmDelete(commentId: any) {
  commentIdToDelete.value = commentId
  showModal.value = true
}

function handleDeleteComment() {
  showModal.value = false
  deleteComment(commentIdToDelete.value)
    .then(() => {
      comments.value = comments.value.filter((comment) => comment._id !== commentIdToDelete.value)
      toast.success('comment removed!')
    })
    .catch((err) => {
      console.error(err.message)
      toast.error(err.message)
    })
}

onMounted(() => {
  fetchComments()
})
</script>

<template>
  <div
    class="table-auto overflow-x-scroll p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500 py-16"
  >
    <div v-if="currentUser && currentUser.isAdmin">
      <!-- Filter Input -->
      <div class="mb-4">
        <input
          type="text"
          v-model="filterText"
          @input="onGlobalFilter"
          placeholder="Filter comments..."
          class="w-full border rounded px-3 py-2 filter-input"
        />
      </div>

      <div v-if="!loading && comments.length > 0">
        <div
          class="table-container w-[95vw] sm:w-[80vw] mx-auto shadow-md bg-white dark:bg-gray-800 rounded"
        >
          <DataTable
            :value="comments"
            :filters="dtFilters"
            stripedRows
            responsiveLayout="scroll"
            :globalFilterFields="['content', 'postId', 'userId']"
          >
            <!-- Content Column -->
            <Column header="content">
              <template #body="slotProps">
                <div class="line-clamp-2">
                  {{ slotProps.data.content }}
                </div>
              </template>
            </Column>

            <!-- Number of Likes Column -->
            <Column field="numberOfLikes" header="Number of likes" />

            <!-- Date Updated Column -->
            <Column header="Date updated">
              <template #body="slotProps">
                {{ formatDate(slotProps.data.updatedAt) }}
              </template>
            </Column>

            <!-- PostId Column -->
            <Column header="PostId">
              <template #body="slotProps">
                {{ slotProps.data.postId ? slotProps.data.postId.slice(0, 10) + '...' : '' }}
              </template>
            </Column>

            <!-- UserId Column -->
            <Column header="UserId">
              <template #body="slotProps">
                {{ slotProps.data.userId ? slotProps.data.userId.slice(0, 10) + '...' : '' }}
              </template>
            </Column>

            <!-- Delete Column -->
            <Column header="Delete">
              <template #body="slotProps">
                <span
                  @click="confirmDelete(slotProps.data._id)"
                  class="font-medium text-red-500 hover:underline cursor-pointer"
                >
                  <svg
                    class="w-5 h-5 inline text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H8V5a2 2 0 012-2z"
                    ></path>
                  </svg>
                </span>
              </template>
            </Column>
          </DataTable>
        </div>
        <!-- Show More Button -->
        <div v-if="showMore" class="mt-4">
          <button @click="handleShowMore" class="w-full text-teal-500 self-center text-sm py-7">
            Show more
          </button>
        </div>
      </div>
      <!-- No Comments / Loading State -->
      <div v-else>
        <div v-if="loading" class="flex items-center justify-center">
          <div class="spinner"></div>
        </div>
        <div v-else class="text-center text-gray-500">You have no comments yet!</div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50"
    >
      <WarningPopup title="comment" @delete="handleDeleteComment" @close="showModal = false" />
    </div>
  </div>
</template>
<style></style>
