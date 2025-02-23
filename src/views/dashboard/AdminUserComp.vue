<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import WarningPopup from '@/components/WarningPopup.vue'
import { useAuthStore } from '@/stores/auth'
import { getAllUsers, deleteUser } from '@/API/rests'
import { toast } from '@steveyuowo/vue-hot-toast'
import { Tag } from 'primevue'

const authStore = useAuthStore()
const currentUser = computed(() => authStore.currentUser)

const users = ref<any[]>([])
const filterText = ref('')
const dtFilters = ref({
  global: { value: '', matchMode: 'contains' },
})
const showMore = ref(true)
const showModal = ref(false)
const userIdToDelete = ref('')
const loading = ref(false)

function formatDate(dateString: any) {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

function onGlobalFilter() {
  dtFilters.value.global.value = filterText.value
}

// Fetch users from the API
function fetchUsers() {
  loading.value = true
  getAllUsers(0)
    .then((data: any) => {
      users.value = data.data.users
      if (data.data.users.length < 9) {
        showMore.value = false
      }
    })
    .catch((err: any) => {
      console.error(err.message)
      toast.error(err.message)
    })
    .finally(() => {
      loading.value = false
    })
}

// Load more users when "Show more" is clicked
function handleShowMore() {
  const startIndex = users.value.length

  getAllUsers(startIndex)
    .then((data: any) => {
      const newUsers = data.data.users
      users.value = [...users.value, ...newUsers]
      if (newUsers.length < 9) {
        showMore.value = false
      }
    })
    .catch((err: any) => console.error(err.message))
}

// Confirm deletion by showing the modal
function confirmDelete(userId: any) {
  userIdToDelete.value = userId
  showModal.value = true
}

// Delete the selected user
function handleDeleteUser() {
  showModal.value = false
  deleteUser(userIdToDelete.value)
    .then(() => {
      users.value = users.value.filter((usr) => usr._id !== userIdToDelete.value)
      toast.success('User deleted!')
    })
    .catch((err: any) => {
      console.error(err.message)
      toast.error(err.message)
    })
}

const getSeverity = (status: any) => {
  switch (status) {
    case 'admin':
      return 'warn'
    case 'user':
      return 'info'
    case 'other':
      return undefined
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="p-3 py-16">
    <div v-if="currentUser?.isAdmin">
      <!-- Loading Spinner -->
      <div v-if="loading" class="flex items-center justify-center">
        <div class="spinner"></div>
      </div>

      <!-- Data Table -->
      <div v-if="!loading && users.length > 0">
        <!-- Filter Input -->
        <input
          type="text"
          v-model="filterText"
          @input="onGlobalFilter"
          placeholder="Filter record..."
          class="filter-input mb-4 p-2 border rounded"
        />

        <DataTable
          :value="users"
          paginator
          :rows="9"
          stripedRows
          :globalFilterFields="['username', 'email']"
          :filters="dtFilters"
          class="table-auto max-w-full mx-auto shadow-md bg-white dark:bg-gray-800 rounded overflow-auto"
        >
          <!-- Image Column -->
          <Column header="Image">
            <template #body="slotProps">
              <img
                :src="slotProps.data.image || 'https://placehold.co/600x400/png'"
                alt="user"
                class="rounded-full w-10 h-10 cursor-pointer"
              />
            </template>
          </Column>

          <!-- Username Column -->
          <Column field="username" header="Username" />

          <!-- Email Column -->
          <Column field="email" header="Email" />

          <!-- Date Created Column -->
          <Column header="Date created">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.createdAt) }}
            </template>
          </Column>

          <!-- Admin Column -->
          <Column header="Role" style="text-align: start">
            <template #body="slotProps">
              <div>
                <Tag
                  :value="slotProps.data.isAdmin ? 'Admin' : 'User'"
                  :severity="getSeverity(slotProps.data.isAdmin ? 'admin' : 'user')"
                />
              </div>
            </template>
          </Column>

          <!-- Action Column -->
          <Column header="Action">
            <template #body="slotProps">
              <button
                @click="confirmDelete(slotProps.data._id)"
                class="text-red-500 hover:underline"
                v-if="!slotProps.data.isAdmin"
              >
                🗑️
              </button>
            </template>
          </Column>
        </DataTable>

        <!-- Show More Button -->
        <div v-if="showMore" class="mt-4">
          <button @click="handleShowMore" class="w-full text-teal-500 text-sm py-4">
            Show more
          </button>
        </div>
      </div>

      <!-- No Users Message -->
      <div v-if="!loading && users.length === 0" class="text-center text-gray-500">
        You have no posts yet!
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50"
    >
      <WarningPopup title="user" @onDelete="handleDeleteUser" @onClose="showModal = false" />
    </div>
  </div>
</template>
<style></style>
