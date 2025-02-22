<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from '@steveyuowo/vue-hot-toast'
import { useAuthStore } from '@/stores/auth'
import { createPost, updatePost, getFeaturedPost, fetchPostByID } from '@/API/rests'

const EditorJS = (await import('@editorjs/editorjs')).default
const Header = (await import('@editorjs/header')).default
const List = (await import('@editorjs/list')).default
const Image = (await import('@editorjs/image')).default
const Quote = (await import('@editorjs/quote')).default
const CodeTool = (await import('@editorjs/code')).default
const Table = (await import('@editorjs/table')).default

import { RelatedPostTool } from '@/tools/related-post-tool.ts'

interface EditorTools {
  [key: string]: {
    class: any
    inlineToolbar?: boolean | string[]
    config?: Record<string, any>
  }
}

const authStore = useAuthStore()

// Editor instance
const editor = ref<any>(null)
// Post content fields
const today = new Date()
const title = ref('')
const subTitle = ref('')
const loading = ref(false)
const postId = ref<string | undefined>(undefined)

// Preview and Editor data
const previewContent = ref<any>(null)
const showPreview = ref(false)

// Featured image state
const featuredImage = ref<any>(null)

// Categories and Tags
const inputCategory = ref('')

const featured = ref(false)
const inputTag = ref('')
const tags = ref<string[]>([])
const status = ref('draft')

// Recent blogs
const recentBlogs = ref([
  {
    id: 1,
    title: 'First Blog Post',
    excerpt: 'This is a short excerpt.',
    tags: ['Angular', 'Tutorial'],
  },
  {
    id: 2,
    title: 'Second Blog Post',
    excerpt: 'Another excerpt goes here.',
    tags: ['Tech'],
  },
])

// Drag over state
const isDragOver = ref(false)

// Editor data
const editorData = reactive({ blocks: [] })

// Function to fetch post data for editing
async function fetchPost(postId: string) {
  try {
    const res = await fetchPostByID(postId)
    const data = res.data
    if (data && data.posts && data.posts.length > 0) {
      const post = data.posts[0]
      autoPopulateData(post.content)
      title.value = post.title
      subTitle.value = post.subtitle
      featuredImage.value = { url: post.image }
      inputCategory.value = post.category
      tags.value = post.tags ? post.tags.split(',') : []
      status.value = post.status
      loadFeatured(post._id)
    }
  } catch (error: any) {
    toast.error(error.error?.message || error.message)
  }
}

function autoPopulateData(content: string): void {
  let data
  try {
    data = JSON.parse(content)
  } catch (error) {
    console.error('Error parsing content JSON', error)
    return
  }

  // Wait 5 seconds before updating the editor
  setTimeout(() => {
    if (editor.value && typeof editor.value.destroy === 'function') {
      editor.value.destroy()
      initEditor(data)
    } else {
      // If there's no editor instance, simply initialize it
      initEditor(data)
    }
  }, 5000)
}

async function loadFeatured(id: string) {
  try {
    const res = await getFeaturedPost()
    featured.value = id === res?.data.postId
  } catch (error: any) {
    console.error(error.message)
  }
}

// Initialize EditorJS
async function initEditor(data: any) {
  const tools: EditorTools = {
    header: {
      class: Header,
      config: {
        placeholder: 'Enter a header',
        levels: [2, 3, 4],
        defaultLevel: 3,
      },
    },
    list: {
      class: List,
      inlineToolbar: true,
      config: {
        defaultStyle: 'unordered',
      },
    },
    image: {
      class: Image,
      config: {
        uploader: {
          uploadByFile: async (file: File) => {
            try {
              const imageUrl = await uploadToCloudinary(file)
              return {
                success: 1,
                file: { url: imageUrl },
              }
            } catch (error) {
              console.error('Image upload failed:', error)
              return { success: 0, error: 'Image upload failed' }
            }
          },
        },
      },
    },
    quote: { class: Quote },
    code: { class: CodeTool },
    table: { class: Table },
    relatedPost: { class: RelatedPostTool, inlineToolbar: false },
  }

  // If editor instance exists, destroy it first
  if (editor.value && typeof editor.value.destroy === 'function') {
    await editor.value.destroy()
  }
  editor.value = new EditorJS({
    holder: 'editorjs',
    placeholder: "Let's write an awesome story!",
    tools,
    data: data || { blocks: [] },
  })
}

// Function to upload image to Cloudinary
async function uploadToCloudinary(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'grfua8vf') // Replace with your preset
  const res = await fetch(`https://api.cloudinary.com/v1_1/dv1cetenk/image/upload`, {
    method: 'POST',
    body: formData,
  })
  const data = await res.json()
  return data.secure_url
}

// Save post data (create or update)
async function saveData() {
  if (editor.value) {
    try {
      const savedData = await editor.value.save()
      const postData = {
        title: title.value,
        status: status.value,
        content: JSON.stringify(savedData),
        image: featuredImage.value,
        tags: tags.value.join(','),
        category: inputCategory.value,
        subtitle: subTitle.value,
        featured: featured.value,
      }
      await handleSubmit(postData)
    } catch (error) {
      console.error('Saving error:', error)
    }
  }
}

// Submit post data to API
async function handleSubmit(formData: any) {
  if (loading.value) return
  loading.value = true
  try {
    if (postId.value) {
      await updatePost(formData, postId.value, authStore.currentUser!._id)
      toast.success('Post updated successfully')
      clearData()
    } else {
      await createPost(formData)
      toast.success('Post created successfully')
      clearData()
    }
  } catch (err: any) {
    console.error(err.message)
    toast.error(err.error?.message || err.message)
  } finally {
    loading.value = false
  }
}

// Clear form data after save
function clearData() {
  title.value = ''
  status.value = 'draft'
  featuredImage.value = null
  tags.value = []
  inputCategory.value = ''
  subTitle.value = ''
  featured.value = false
  postId.value = undefined
  if (editor.value && typeof editor.value.destroy === 'function') {
    editor.value.destroy()
    initEditor({ blocks: [] })
  }
}

// Preview functionality
async function handlePreview() {
  if (editor.value) {
    previewContent.value = await editor.value.save()
    showPreview.value = true
  }
}

// Handle file input change for featured image
async function handleFeaturedImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files ? target.files[0] : null
  if (file) {
    const imageUrl = await uploadToCloudinary(file)
    featuredImage.value = { url: imageUrl, name: file.name }
  }
}

// Remove featured image
function removeFeaturedImage() {
  featuredImage.value = null
}

// Tag methods
function handleAddTag(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    if (inputTag.value && !tags.value.includes(inputTag.value)) {
      tags.value.push(inputTag.value)
      inputTag.value = ''
    }
  }
}

function removeTag(tag: string) {
  tags.value = tags.value.filter((t) => t !== tag)
}

// Toggle featured flag
function toggleFeatured() {
  featured.value = !featured.value
}

// Drag and drop handlers
function onDragOver(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = true
}

function onDragLeave(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false
  if (event.dataTransfer && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0]
    processFile(file)
    event.dataTransfer.clearData()
  }
}

async function processFile(file: File) {
  const res = await uploadToCloudinary(file)
  featuredImage.value = { url: res, name: file.name }
}

// Lifecycle hooks
onMounted(() => {
  const id = useRoute().params.id as string
  postId.value = id === '0' ? undefined : id
  initEditor(editorData)
  if (postId.value) {
    fetchPost(postId.value)
  }
})

onBeforeUnmount(() => {
  if (editor.value && typeof editor.value.destroy === 'function') {
    editor.value.destroy()
  }
})
</script>

<template>
  <div class="container mx-auto p-6 my-10">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Main Editor Column -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow p-6">
          <h5 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white py-1">
            Create New Blog Post
          </h5>
          <div class="space-y-4">
            <!-- Title -->
            <input
              type="text"
              class="w-full px-4 py-2 border rounded-lg"
              placeholder="Enter your blog title..."
              v-model="title"
            />
            <!-- Subtitle -->
            <input
              type="text"
              class="w-full px-4 py-2 border rounded-lg"
              placeholder="Enter subtitle..."
              v-model="subTitle"
            />
            <!-- Editor Area -->
            <div class="min-h-[500px] border rounded-lg p-4 bg-white">
              <!-- EditorJS instance container -->
              <div id="editorjs"></div>
            </div>
            <!-- Action Buttons -->
            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="px-4 py-2 border rounded bg-gray-200 text-gray-700"
                @click="handlePreview"
              >
                Preview
              </button>
              <button
                type="button"
                class="px-4 py-2 rounded bg-indigo-600 disabled:bg-indigo-400 text-white disabled:cursor-not-allowed"
                @click="saveData"
                :disabled="loading || !title || !subTitle"
              >
                <template v-if="loading">
                  <span class="spinner mr-3"></span>
                  <span>Loading...</span>
                </template>
                <template v-else>
                  <span>{{ postId ? 'Edit Post' : 'Save Post' }}</span>
                </template>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar Column -->
      <div class="space-y-4">
        <!-- Publishing Options Card -->
        <div class="bg-white rounded-lg shadow p-6">
          <h5 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
            Publishing Options
          </h5>
          <div class="space-y-4">
            <!-- Featured Image Upload -->
            <div>
              <p class="mb-2 text-sm font-medium">Featured Image</p>
              <div class="flex items-center justify-center w-full">
                <template v-if="featuredImage">
                  <div class="relative w-full">
                    <img
                      :src="featuredImage.url"
                      alt="Featured"
                      class="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      class="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white rounded text-xs"
                      @click="removeFeaturedImage"
                    >
                      Remove
                    </button>
                  </div>
                </template>
                <template v-else>
                  <label
                    class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                    :class="{ dragover: isDragOver }"
                    @dragover.prevent="onDragOver"
                    @dragleave.prevent="onDragLeave"
                    @drop.prevent="onDrop"
                  >
                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        class="w-8 h-8 mb-4 text-gray-500"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p class="mb-2 text-sm text-gray-500 text-center">
                        <span class="font-semibold">Click to upload</span> or drag and drop
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="handleFeaturedImageUpload"
                    />
                  </label>
                </template>
              </div>
            </div>

            <!-- Categories -->
            <div>
              <p class="mb-2 text-sm font-medium">Categories</p>
              <input
                type="text"
                class="w-full px-4 py-2 border rounded-lg"
                placeholder="Enter category"
                v-model="inputCategory"
              />
            </div>

            <!-- Feature Post Toggle -->
            <div
              class="border border-gray-300 p-2 rounded-md cursor-pointer"
              @click="toggleFeatured"
            >
              <p class="mb-2 text-sm font-medium">Feature Post</p>
              <div class="flex gap-x-4 items-center justify-between">
                <div class="text-gray-400 italic">set as featured post</div>
                <input type="checkbox" :checked="featured" @change="featured = !featured" />
              </div>
            </div>

            <!-- Tags -->
            <div>
              <p class="mb-2 text-sm font-medium">Tags</p>
              <input
                type="text"
                class="w-full px-4 py-2 border rounded-lg"
                placeholder="Press Enter to add tag"
                v-model="inputTag"
                @keypress="handleAddTag"
              />
              <div class="flex flex-wrap gap-2 mt-2">
                <span
                  v-for="tag in tags"
                  :key="tag"
                  class="px-3 py-1 bg-green-400 text-white rounded-full text-sm cursor-pointer"
                  @click="removeTag(tag)"
                >
                  {{ tag }} ×
                </span>
              </div>
            </div>

            <!-- Status -->
            <div>
              <p class="mb-2 text-sm font-medium">Status</p>
              <select class="w-full px-4 py-2 border rounded-lg" v-model="status">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Recent Posts Card -->
        <div class="bg-white rounded-lg shadow p-6">
          <h5 class="text-xl mb-2 font-bold tracking-tight text-gray-900 dark:text-white">
            Recent Posts
          </h5>
          <div class="space-y-4">
            <div v-for="blog in recentBlogs" :key="blog.id" class="space-y-1">
              <h6 class="font-medium text-sm hover:text-blue-600 cursor-pointer">
                {{ blog.title }}
              </h6>
              <p class="text-xs text-gray-600 dark:text-gray-400">
                {{ blog.excerpt }}
              </p>
              <div class="flex gap-2">
                <span
                  v-for="tag in blog.tags"
                  :key="tag"
                  class="px-2 py-1 bg-stone-500 text-white rounded text-xs cursor-pointer"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Panel -->
    <transition name="slide">
      <div
        v-if="showPreview"
        class="fixed right-0 top-0 h-[100vh] w-full shadow-lg z-50 overflow-y-auto"
      >
        <transition name="fade">
          <div
            v-if="showPreview"
            class="fixed inset-0 bg-black bg-opacity-50 z-40 cursor-pointer"
            @click="showPreview = false"
          ></div>
        </transition>
        <transition name="slide">
          <div
            v-if="showPreview"
            class="fixed right-0 top-0 h-[100vh] bg-white w-full md:w-[700px] shadow-lg z-50 overflow-y-auto"
          >
            <div class="bg-white p-6 rounded-lg h-[100vh] py-5 relative">
              <h2 class="text-2xl font-bold mb-4">Preview</h2>
              <div
                @click="showPreview = false"
                class="absolute top-3 right-2 rounded-full p-2 bg-red-300 w-6 h-6 hover:bg-red-400 cursor-pointer flex items-center justify-center"
              >
                x
              </div>
              <!-- Main article content -->
              <main class="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
                <h1 class="text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl">
                  {{ title }}
                </h1>
                <p class="text-sm text-gray-600 text-center mx-auto lg:text-lg dark:text-gray-400">
                  {{ subTitle }}
                </p>
                <div class="self-center mt-5">
                  <button class="bg-gray-500 rounded-full px-4 py-2 text-white text-xs">
                    {{ inputCategory }}
                  </button>
                </div>
                <img
                  :src="featuredImage?.url"
                  :alt="title"
                  class="mt-10 p-3 max-h-[600px] w-full object-cover"
                />
                <div
                  class="flex justify-between p-3 border-b border-slate-500 mx-auto w-full text-xs"
                >
                  <span>{{ today.toLocaleDateString() }}</span>
                  <span class="italic">
                    {{ (previewContent.blocks?.length / 1000).toFixed(0) }} mins read
                  </span>
                </div>
                <div class="p-3 mx-auto w-full post-content mt-10">
                  <template v-if="previewContent && previewContent.blocks">
                    <template v-for="(block, i) in previewContent.blocks" :key="i">
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
                      <template v-else-if="block.type === 'paragraph'">
                        <p class="mb-4" v-html="block.data.text"></p>
                      </template>
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
                      <template v-else-if="block.type === 'list'">
                        <template v-if="block.data.style === 'ordered'">
                          <ol class="list-decimal ml-6 mb-4">
                            <li v-for="(item, j) in block.data.items" :key="j">
                              {{ item?.content || item }}
                            </li>
                          </ol>
                        </template>
                        <template v-else>
                          <ul class="list-disc ml-6 mb-4">
                            <li v-for="(item, j) in block.data.items" :key="j">
                              {{ item?.content || item }}
                            </li>
                          </ul>
                        </template>
                      </template>
                      <template v-else-if="block.type === 'quote'">
                        <blockquote class="border-l-4 border-blue-500 pl-4 my-4">
                          <p class="italic">{{ block.data.text }}</p>
                          <cite v-if="block.data.caption" class="block mt-2 text-sm">
                            — {{ block.data.caption }}
                          </cite>
                        </blockquote>
                      </template>
                      <template v-else-if="block.type === 'code'">
                        <pre class="bg-gray-200 p-4 rounded-lg my-4 overflow-x-auto relative">
                          <div class="absolute right-4 top-4 rounded-md p-1 cursor-pointer bg-slate-500 hover:bg-gray-700 flex items-center justify-center text-white text-xs">
                            <span class="dark:text-white">Copy</span>
                          </div>
                          <code class="dark:text-gray-700">{{ block.data.code }}</code>
                        </pre>
                      </template>
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
                      <template v-else-if="block.type === 'relatedPost'">
                        <div class="related-post-display">
                          <a :href="block.data.url" target="_blank" rel="noopener noreferrer">
                            <h3>{{ block.data.title }}</h3>
                          </a>
                          <p>{{ block.data.description }}</p>
                        </div>
                      </template>
                      <template v-else>
                        <!-- Unhandled Block -->
                      </template>
                    </template>
                  </template>
                </div>
                <!-- Tags -->
                <div class="max-w-4xl">
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="tag in tags"
                      :key="tag"
                      class="bg-gray-500 rounded-full px-4 py-2 text-white text-xs"
                    >
                      {{ tag }}
                    </button>
                  </div>
                </div>
              </main>
            </div>
            <!-- <button
              class="mt-4 px-4 py-2 mb-5 bg-indigo-600 text-white rounded mx-2"
              @click="showPreview = false"
            >
              Close Preview
            </button> -->
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>
<style scoped>
.dragover {
  background-color: #f0f0f0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s ease-out;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
