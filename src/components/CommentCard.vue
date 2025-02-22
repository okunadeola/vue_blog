<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { toast } from '@steveyuowo/vue-hot-toast'
import moment from 'moment'
import type { CurrentUser } from '@/models'
import { API } from '@/API/restServices'

// Define component props.
const props = defineProps<{
  comment: any
  currentUser: CurrentUser | null
}>()

// Define emitted events.
const emit = defineEmits<{
  (e: 'like', commentId: string): void
  (e: 'edit', payload: { comment: any; editedContent: string }): void
  (e: 'delete', commentId: string): void
}>()

const user = ref<any>({})
const isEditing = ref(false)
const editedContent = ref('')

async function fetchUser() {
  try {
    const response = await API.get(`/user/${props.comment.userId}`)
    user.value = response.data
  } catch (error: any) {
    console.error(error.message)
  }
}

onMounted(() => {
  if (props.comment) {
    fetchUser()
    editedContent.value = props.comment.content
  }
})

watch(
  () => props.comment,
  (newComment) => {
    if (newComment) {
      fetchUser()
      editedContent.value = newComment.content
    }
  },
  { immediate: true },
)

function handleEdit() {
  isEditing.value = true
  editedContent.value = props.comment.content
}

async function handleSave() {
  try {
    await API.put(`/comment/editComment/${props.comment._id}`, {
      content: editedContent.value,
    })
    isEditing.value = false
    emit('edit', { comment: props.comment, editedContent: editedContent.value })
    toast.success('comment edited!')
  } catch (error: any) {
    console.error(error.message)
    toast.error(error.message)
  }
}

// Emit a "like" event.
function onLike() {
  emit('like', props.comment._id)
}

// Emit a "delete" event.
function onDelete() {
  emit('delete', props.comment._id)
}

function getRelativeTime(date: string): string {
  return moment(date).fromNow()
}
</script>

<template>
  <div class="flex p-4 border-b dark:border-gray-600 text-sm">
    <!-- User avatar -->
    <div class="flex-shrink-0 mr-3">
      <img
        class="w-10 h-10 rounded-full bg-gray-200"
        :src="user.profilePicture"
        :alt="user.username"
      />
    </div>
    <!-- Comment Content -->
    <div class="flex-1">
      <div class="flex items-center mb-1">
        <span class="font-bold mr-1 text-xs truncate">
          {{ user ? '@' + user.username : 'anonymous user' }}
        </span>
        <span class="text-gray-500 text-xs">
          {{ getRelativeTime(comment.createdAt) }}
        </span>
      </div>

      <!-- Editing Mode -->
      <div v-if="isEditing">
        <textarea class="mb-2 w-full border rounded p-2" v-model="editedContent"></textarea>
        <div class="flex justify-end gap-2 text-xs">
          <button
            type="button"
            @click="handleSave"
            :disabled="!editedContent"
            class="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded"
          >
            Save
          </button>
          <button type="button" @click="isEditing = false" class="px-4 py-2 border rounded">
            Cancel
          </button>
        </div>
      </div>

      <!-- Display Mode -->
      <div v-else>
        <p class="text-gray-500 pb-2 dark:text-gray-300">{{ comment.content }}</p>
        <div class="flex items-center pt-2 text-xs border-t dark:border-gray-700 max-w-fit gap-2">
          <button
            type="button"
            @click="onLike"
            class="flex items-center text-gray-400 hover:text-blue-500"
            :class="{
              'text-blue-500': currentUser && comment.likes.includes(currentUser._id),
            }"
          >
            👍
          </button>
          <p class="text-gray-400">
            {{
              comment.numberOfLikes > 0
                ? comment.numberOfLikes + ' ' + (comment.numberOfLikes === 1 ? 'like' : 'likes')
                : ''
            }}
          </p>
          <template
            v-if="currentUser && (currentUser._id === comment.userId || currentUser.isAdmin)"
          >
            <button type="button" @click="handleEdit" class="text-gray-400 hover:text-blue-500">
              Edit
            </button>
            <button type="button" @click="onDelete" class="text-gray-400 hover:text-red-500">
              Delete
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<style></style>
