<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPostComments, createComment, likeComment, deleteComment } from '@/API/rests'
import { useAuthStore } from '@/stores/auth'
import type { CurrentUser } from '@/models'
import { toast } from '@steveyuowo/vue-hot-toast'
import WarningPopup from '@/components/WarningPopup.vue'
import CommentCard from '@/components/CommentCard.vue'

const props = defineProps<{
  postId: string | null
}>()

const comment = ref('')
const comments = ref<any[]>([])
const showModal = ref(false)
const commentToDelete = ref<string | null>(null)
const currentUser = ref<CurrentUser | null>(null)
const authStore = useAuthStore()

const router = useRouter()

async function fetchComments() {
  try {
    const response = await getPostComments(props.postId)
    comments.value = response.data
  } catch (error) {
    console.error(error)
  }
}

async function handleSubmit() {
  if (comment.value.length > 200) return

  const payload = {
    content: comment.value,
    postId: props.postId,
    userId: currentUser.value?._id,
  }
  try {
    const response = await createComment(payload)
    comment.value = ''
    comments.value = [response.data, ...comments.value]
  } catch (error: any) {
    toast.error(error.message)
  }
}

async function handleLike(commentId: string) {
  if (!currentUser.value) {
    router.push('/sign-in')
    return
  }
  try {
    const response = await likeComment(commentId)
    comments.value = comments.value.map((c) =>
      c._id === commentId
        ? { ...c, likes: response.data.likes, numberOfLikes: response.data.likes.length }
        : c,
    )
  } catch (error: any) {
    console.error(error?.response?.data?.message || error.message)
    toast.error(error?.response?.data?.message || error.message)
  }
}

function handleEdit({
  comment: origComment,
  editedContent,
}: {
  comment: any
  editedContent: string
}) {
  comments.value = comments.value.map((c) =>
    c._id === origComment._id ? { ...c, content: editedContent } : c,
  )
}

function openDeleteModal(commentId: string) {
  showModal.value = true
  commentToDelete.value = commentId
}

async function handleDelete(commentId: string) {
  showModal.value = false
  if (!currentUser.value) {
    router.push('/sign-in')
    return
  }
  try {
    await deleteComment(commentId)
    comments.value = comments.value.filter((c) => c._id !== commentId)
  } catch (error: any) {
    console.error(error.message)
  }
}

onMounted(() => {
  currentUser.value = authStore.currentUser
  fetchComments()
})
</script>

<template>
  <div class="max-w-4xl mx-auto w-full p-8">
    <!-- User Info / Sign In Prompt -->
    <div v-if="currentUser" class="flex items-center gap-1 my-5 text-gray-500 text-sm">
      <p>Signed in as:</p>
      <img
        class="h-5 w-5 object-cover rounded-full"
        :src="currentUser.profilePicture || 'https://placehold.co/600x400/png'"
        alt="User"
      />
      <router-link to="/dashboard?tab=profile" class="text-xs text-cyan-600 hover:underline">
        {{ currentUser.username }}
      </router-link>
    </div>
    <template v-else>
      <div class="text-sm text-teal-500 my-5 flex gap-1">
        You must be signed in to comment.
        <router-link to="/sign-in" class="text-blue-500 hover:underline">Sign In</router-link>
      </div>
    </template>

    <!-- Comment Form -->
    <div v-if="currentUser">
      <form
        @submit.prevent="handleSubmit"
        class="border border-gray-200 dark:border-gray-500 rounded-md p-3"
      >
        <textarea
          placeholder="Add a comment..."
          rows="3"
          maxlength="200"
          v-model="comment"
          class="border border-gray-100 w-full p-2 rounded-md dark:border-gray-500"
        ></textarea>
        <div class="flex justify-between items-center mt-5">
          <p class="text-gray-500 text-xs dark:text-gray-400">
            {{ 200 - comment.length }} characters remaining
          </p>
          <button
            :disabled="!comment"
            type="submit"
            class="outline border disabled:bg-gray-600 disabled:cursor-not-allowed rounded px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white"
          >
            Submit
          </button>
        </div>
      </form>
    </div>

    <!-- Comments List -->
    <div v-if="comments.length === 0">
      <p class="text-sm my-5">No comments yet!</p>
    </div>
    <div v-else>
      <div class="text-sm my-5 flex items-center gap-1">
        <p>Comments</p>
        <div class="border border-gray-400 px-1 py-0.5 rounded-sm">
          <p>{{ comments.length }}</p>
        </div>
      </div>
      <!-- Loop over comments -->
      <div v-for="c in comments" :key="c._id">
        <CommentCard
          :comment="c"
          @edit="handleEdit"
          @delete="openDeleteModal"
          @like="handleLike"
          :currentUser="currentUser"
        />
      </div>
    </div>

    <!-- Modal: Delete Confirmation -->
    <div
      v-if="showModal"
      class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50"
    >
      <WarningPopup
        title="comment"
        @onDelete="handleDelete(commentToDelete!)"
        @onClose="showModal = false"
      />
    </div>
  </div>
</template>
<style></style>
