<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import AppButton from '@/components/ui/Button.vue'
import AppInput from '@/components/ui/Input.vue'
import AppTable from '@/components/ui/Table.vue'
import AppModal from '@/components/ui/Modal.vue'
import AppSpinner from '@/components/ui/Spinner.vue'

const usersStore = useUsersStore()
const toast = useToast()
const confirm = useConfirm()

const activeTab = ref('all')
const isModalOpen = ref(false)
const modalMode = ref('create') // create | edit
const formData = ref({
  id: null,
  name: '',
  email: '',
  role: 'student',
  password: '',
})

const tabs = [
  { id: 'all', label: 'All Users' },
  { id: 'track_admin', label: 'Admins' },
  { id: 'instructor', label: 'Instructors' },
  { id: 'student', label: 'Students' },
]

onMounted(() => {
  usersStore.fetchAll()
})

const filteredUsers = computed(() => {
  if (activeTab.value === 'all') return usersStore.users
  return usersStore.users.filter(u => u.role === activeTab.value)
})

function openCreateModal() {
  modalMode.value = 'create'
  formData.value = { name: '', email: '', role: 'student', password: '' }
  isModalOpen.value = true
}

function openEditModal(user) {
  modalMode.value = 'edit'
  formData.value = { ...user, password: '' }
  isModalOpen.value = true
}

async function handleSubmit() {
  try {
    const payload = {
      name: formData.value.name,
      email: formData.value.email,
      role: formData.value.role,
    }
    
    if (formData.value.password) {
      payload.password = formData.value.password
    }

    if (modalMode.value === 'create') {
      await usersStore.create(payload)
      toast.success('User created successfully')
    } else {
      await usersStore.update(formData.value.id, payload)
      toast.success('User updated successfully')
    }
    isModalOpen.value = false
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to save user')
  }
}

async function handleDeactivate(id) {
  const confirmed = await confirm.confirm({
    title: 'Deactivate User?',
    message: 'Are you sure you want to deactivate this user? They will no longer be able to log in.',
    confirmText: 'Deactivate',
    variant: 'danger',
  })
  
  if (confirmed) {
    try {
      await usersStore.deactivate(id)
      toast.success('User deactivated')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to deactivate user')
    }
  }
}
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-neutral-900">User Management</h1>
      <AppButton @click="openCreateModal">Add New User</AppButton>
    </div>

    <!-- Tabs -->
    <div class="border-b border-neutral-200">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors"
          :class="[
            activeTab === tab.id
              ? 'border-secondary-500 text-secondary-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg border border-neutral-200">
      <div v-if="usersStore.loading" class="flex justify-center py-12">
        <AppSpinner />
      </div>
      <table v-else class="w-full text-left text-sm">
        <thead class="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold">
          <tr>
            <th class="px-6 py-3">Name</th>
            <th class="px-6 py-3">Email</th>
            <th class="px-6 py-3">Role</th>
            <th class="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-200">
          <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-neutral-50">
            <td class="px-6 py-4 font-medium text-neutral-900">{{ user.name }}</td>
            <td class="px-6 py-4">{{ user.email }}</td>
            <td class="px-6 py-4">
              <span class="capitalize">{{ user.role.replace('_', ' ') }}</span>
            </td>
            <td class="px-6 py-4 text-right space-x-2">
              <button @click="openEditModal(user)" class="text-secondary-600 hover:text-secondary-700 font-medium">Edit</button>
              <button @click="handleDeactivate(user.id)" class="text-red-600 hover:text-red-700 font-medium tracking-tight">Deactivate</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <AppModal
      :show="isModalOpen"
      :title="modalMode === 'create' ? 'Add New User' : 'Edit User'"
      @close="isModalOpen = false"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <AppInput
          label="Full Name"
          v-model="formData.name"
          placeholder="e.g. John Doe"
          required
        />
        <AppInput
          label="Email Address"
          type="email"
          v-model="formData.email"
          placeholder="john@example.com"
          required
        />
        
        <div class="space-y-1">
          <label class="block text-sm font-medium text-neutral-700">Role</label>
          <select
            v-model="formData.role"
            class="block w-full rounded-md border-neutral-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500 sm:text-sm"
          >
            <option value="track_admin">Track Admin</option>
            <option value="instructor">Instructor</option>
            <option value="student">Student</option>
          </select>
        </div>

        <AppInput
          v-if="modalMode === 'create'"
          label="Password"
          type="password"
          v-model="formData.password"
          placeholder="••••••••"
          required
        />

        <div class="flex justify-end gap-3 mt-6">
          <AppButton variant="secondary" @click="isModalOpen = false">Cancel</AppButton>
          <AppButton type="submit">
            {{ modalMode === 'create' ? 'Create User' : 'Save Changes' }}
          </AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>
