<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCohortsStore } from '@/stores/cohorts'
import { useTracksStore } from '@/stores/tracks'
import { useUsersStore } from '@/stores/users'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import AppButton from '@/components/ui/Button.vue'
import AppInput from '@/components/ui/Input.vue'
import AppModal from '@/components/ui/Modal.vue'
import AppSpinner from '@/components/ui/Spinner.vue'
import Pagination from '@/components/ui/Pagination.vue'

const cohortsStore = useCohortsStore()
const tracksStore = useTracksStore()
const usersStore = useUsersStore()
const toast = useToast()
const confirm = useConfirm()

const isModalOpen = ref(false)
const modalMode = ref('create') // create | edit
const editingId = ref(null)

const defaultForm = () => ({
  name: '',
  track_id: '',
  track_admin_ids: [],
  starts_at: '',
  ends_at: '',
  status: 'open',
})
const formData = ref(defaultForm())

onMounted(async () => {
  await Promise.all([
    cohortsStore.fetchAll(),
    tracksStore.fetchAll(),
    usersStore.fetchAll({ role: 'track_admin' }),
  ])
})

const cohortsByTrack = computed(() => {
  const result = {}
  tracksStore.tracks.forEach(track => {
    result[track.id] = {
      name: track.name,
      cohorts: cohortsStore.cohorts.filter(c => c.track_id === track.id),
    }
  })
  return result
})

function isDeactivated(user) {
  return user.expires_at != null && new Date(user.expires_at) <= new Date()
}

const trackAdmins = computed(() =>
  usersStore.users.filter(u => u.role === 'track_admin' && !isDeactivated(u))
)

function statusColor(status) {
  if (status === 'active') return 'bg-green-100 text-green-700'
  if (status === 'closed') return 'bg-neutral-200 text-neutral-600'
  return 'bg-blue-100 text-blue-700' // open
}

function statusLabel(status) {
  return { open: 'Open', active: 'Active', closed: 'Closed' }[status] ?? status
}

function openCreateModal() {
  modalMode.value = 'create'
  editingId.value = null
  formData.value = defaultForm()
  isModalOpen.value = true
}

function openEditModal(cohort) {
  modalMode.value = 'edit'
  editingId.value = cohort.id
  formData.value = {
    name: cohort.name,
    track_id: cohort.track_id,
    track_admin_ids: (cohort.track_admins || []).map(a => a.id),
    starts_at: cohort.starts_at?.slice(0, 10) || '',
    ends_at: cohort.ends_at?.slice(0, 10) || '',
    status: cohort.status || 'open',
  }
  isModalOpen.value = true
}

async function handleSubmit() {
  try {
    if (modalMode.value === 'create') {
      await cohortsStore.create(formData.value)
      toast.success('Cohort created successfully')
    } else {
      await cohortsStore.update(editingId.value, formData.value)
      toast.success('Cohort updated successfully')
    }
    isModalOpen.value = false
  } catch (e) {
    if (e.response?.data?.errors) {
      toast.error(Object.values(e.response.data.errors).flat().join('\n'))
    } else {
      toast.error(e.response?.data?.message || 'Failed to save cohort')
    }
  }
}

async function handleDelete(cohort) {
  const confirmed = await confirm.confirm({
    title: 'Delete Cohort?',
    message: `Are you sure you want to delete "${cohort.name}"? This cannot be undone.`,
    confirmText: 'Delete',
    variant: 'danger',
  })
  if (confirmed) {
    try {
      await cohortsStore.remove(cohort.id)
      toast.success('Cohort deleted')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete cohort')
    }
  }
}

async function changePage(page) {
  await cohortsStore.fetchAll({ page })
}
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-neutral-900">Cohorts Management</h1>
      <AppButton @click="openCreateModal">Create New Cohort</AppButton>
    </div>

    <div v-if="cohortsStore.loading && !cohortsStore.cohorts.length" class="flex justify-center py-12">
      <AppSpinner size="lg" />
    </div>

    <div v-else class="space-y-8">
      <div v-for="(track, trackId) in cohortsByTrack" :key="trackId" class="space-y-4">
        <h2 class="text-lg font-semibold text-neutral-700 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-secondary-500"></span>
          {{ track.name }}
        </h2>
        
        <div v-if="track.cohorts.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div 
            v-for="cohort in track.cohorts" 
            :key="cohort.id"
            class="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm hover:border-secondary-300 transition-colors"
          >
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-bold text-neutral-900">{{ cohort.name }}</h3>
              <span class="px-2 py-0.5 text-xs font-semibold rounded-full" :class="statusColor(cohort.status)">
                {{ statusLabel(cohort.status) }}
              </span>
            </div>
            
            <div class="space-y-1.5 text-sm text-neutral-600 mb-3">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">badge</span>
                <span v-if="cohort.track_admins?.length">
                  {{ cohort.track_admins.map(a => a.name).join(', ') }}
                </span>
                <span v-else class="italic text-neutral-400">Unassigned</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">calendar_month</span>
                <span>{{ cohort.starts_at }} → {{ cohort.ends_at }}</span>
              </div>
            </div>

            <div class="flex gap-2 pt-2 border-t border-neutral-100">
              <button
                @click="openEditModal(cohort)"
                class="flex-1 text-xs font-medium text-secondary-600 hover:text-secondary-700 py-1 text-center rounded hover:bg-secondary-50 transition-colors"
              >
                Edit
              </button>
              <button
                @click="handleDelete(cohort)"
                class="flex-1 text-xs font-medium text-red-600 hover:text-red-700 py-1 text-center rounded hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        <div v-else class="text-sm text-neutral-400 italic px-4">
          No cohorts yet in this track.
        </div>
      </div>
    </div>

    <Pagination
      v-if="cohortsStore.pagination.lastPage > 1"
      :current-page="cohortsStore.pagination.currentPage"
      :last-page="cohortsStore.pagination.lastPage"
      :total="cohortsStore.pagination.total"
      :from="cohortsStore.pagination.from"
      :to="cohortsStore.pagination.to"
      :loading="cohortsStore.loading"
      @change-page="changePage"
    />

    <!-- Create / Edit Modal -->
    <AppModal
      :show="isModalOpen"
      :title="modalMode === 'create' ? 'Create New Cohort' : 'Edit Cohort'"
      @close="isModalOpen = false"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <AppInput
          label="Cohort Name"
          v-model="formData.name"
          placeholder="e.g. Intake 46 - PHP"
          required
        />

        <div class="space-y-1">
          <label class="block text-sm font-medium text-neutral-700">Track</label>
          <select
            v-model="formData.track_id"
            required
            class="block w-full rounded-md border-neutral-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500 sm:text-sm"
          >
            <option value="" disabled>Select a track</option>
            <option v-for="track in tracksStore.tracks" :key="track.id" :value="track.id">
              {{ track.name }}
            </option>
          </select>
        </div>

        <div class="space-y-1">
          <label class="block text-sm font-medium text-neutral-700">Status</label>
          <select
            v-model="formData.status"
            class="block w-full rounded-md border-neutral-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500 sm:text-sm"
          >
            <option value="open">Open</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div class="space-y-1">
          <label class="block text-sm font-medium text-neutral-700">Assign Track Admins</label>
          <select
            v-model="formData.track_admin_ids"
            multiple
            class="block w-full rounded-md border-neutral-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500 sm:text-sm min-h-[80px]"
          >
            <option v-for="admin in trackAdmins" :key="admin.id" :value="admin.id">
              {{ admin.name }}
            </option>
          </select>
          <p class="text-xs text-neutral-500">Hold Ctrl/Cmd to select multiple</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <AppInput
            label="Start Date"
            type="date"
            v-model="formData.starts_at"
            required
          />
          <AppInput
            label="End Date"
            type="date"
            v-model="formData.ends_at"
            required
          />
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <AppButton variant="secondary" @click="isModalOpen = false">Cancel</AppButton>
          <AppButton type="submit" :loading="cohortsStore.loading">
            {{ modalMode === 'create' ? 'Create Cohort' : 'Save Changes' }}
          </AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>
