<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCohortsStore } from '@/stores/cohorts'
import { useTracksStore } from '@/stores/tracks'
import { useUsersStore } from '@/stores/users'
import { useToast } from '@/composables/useToast'
import AppButton from '@/components/ui/Button.vue'
import AppInput from '@/components/ui/Input.vue'
import AppModal from '@/components/ui/Modal.vue'
import AppSpinner from '@/components/ui/Spinner.vue'
import AppBadge from '@/components/ui/Badge.vue'

const cohortsStore = useCohortsStore()
const tracksStore = useTracksStore()
const usersStore = useUsersStore()
const toast = useToast()

const isModalOpen = ref(false)
const formData = ref({
  name: '',
  track_id: '',
  track_admin_id: '',
})

onMounted(async () => {
  await Promise.all([
    cohortsStore.fetchAll(),
    tracksStore.fetchAll(),
    usersStore.fetchAll({ role: 'track_admin' })
  ])
})

const cohortsByTrack = computed(() => {
  const result = {}
  tracksStore.tracks.forEach(track => {
    result[track.id] = {
      name: track.name,
      cohorts: cohortsStore.cohorts.filter(c => c.track_id === track.id)
    }
  })
  return result
})

const trackAdmins = computed(() => {
  return usersStore.users.filter(u => u.role === 'track_admin')
})

function openCreateModal() {
  formData.value = { name: '', track_id: '', track_admin_id: '' }
  isModalOpen.value = true
}

async function handleSubmit() {
  try {
    await cohortsStore.create(formData.value)
    toast.success('Cohort created successfully')
    isModalOpen.value = false
  } catch (e) {
    toast.error('Failed to create cohort')
  }
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
            class="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm hover:border-secondary-300 transition-colors cursor-pointer"
          >
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-bold text-neutral-900">{{ cohort.name }}</h3>
              <AppBadge :status="cohort.is_active ? 'present' : 'absent'" :label="cohort.is_active ? 'Active' : 'Finished'" />
            </div>
            
            <div class="space-y-2 text-sm text-neutral-600">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">badge</span>
                <span>Admin: {{ cohort.track_admin?.name || 'Unassigned' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">group</span>
                <span>{{ cohort.students_count || 0 }} Students</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-sm text-neutral-400 italic px-4">
          No cohorts yet in this track.
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <AppModal
      :show="isModalOpen"
      title="Create New Cohort"
      @close="isModalOpen = false"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <AppInput
          label="Cohort Name"
          v-model="formData.name"
          placeholder="e.g. Intake 44 - PHP"
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
          <label class="block text-sm font-medium text-neutral-700">Assign Track Admin</label>
          <select
            v-model="formData.track_admin_id"
            required
            class="block w-full rounded-md border-neutral-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500 sm:text-sm"
          >
            <option value="" disabled>Select an admin</option>
            <option v-for="admin in trackAdmins" :key="admin.id" :value="admin.id">
              {{ admin.name }}
            </option>
          </select>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <AppButton variant="secondary" @click="isModalOpen = false">Cancel</AppButton>
          <AppButton type="submit" :loading="cohortsStore.loading">Create Cohort</AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>
