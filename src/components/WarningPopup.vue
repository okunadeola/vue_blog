<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { FileWarningIcon } from 'lucide-vue-next'

defineProps({
  title: {
    type: String,
    default: '',
  },
})

const emit = defineEmits<{
  (e: 'onClose'): void
  (e: 'onDelete'): void
}>()

function close() {
  emit('onClose')
}

function handleDelete() {
  emit('onDelete')
}
</script>

<template>
  <div class="bg-white rounded-md p-6 max-w-sm mx-auto">
    <div class="text-center">
      <FileWarningIcon class="my-icon h-14 w-14 text-gray-400 mb-4 mx-auto" />
      <h3 class="mb-5 text-lg text-gray-500">Are you sure you want to delete this {{ title }}?</h3>
      <div class="flex justify-center gap-4">
        <button @click="handleDelete" class="bg-red-500 text-white px-4 py-2 rounded">
          Yes, I'm sure
        </button>
        <button @click="close" class="bg-gray-500 text-white px-4 py-2 rounded">No, cancel</button>
      </div>
    </div>
  </div>
</template>
<style></style>
