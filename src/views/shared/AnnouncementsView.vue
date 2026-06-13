<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import AnnouncementCard from '@/components/announcements/AnnouncementCard.vue'
import AnnouncementForm from '@/components/announcements/AnnouncementForm.vue'
import { useApi } from '@/composables/useApi'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { loading, error, data: announcements, execute } = useApi()
const { loading: submitting, execute: submitApi } = useApi()
const { execute: deleteApi } = useApi()

// Cohort selection for managers/admins
const cohorts = ref([])
const selectedCohortId = ref(null)
const { execute: loadCohorts } = useApi()

const activeCohortId = computed(() => {
  return authStore.user?.cohort_id || selectedCohortId.value
})

const canCreate = computed(() => {
  return authStore.isTrackAdmin || authStore.isInstructor
})

const formRef = ref(null)

async function fetchAnnouncements() {
  if (!activeCohortId.value) return
  await execute(() => api.get(`/cohorts/${activeCohortId.value}/announcements`))
}

async function handleCreate(payload) {
  if (!activeCohortId.value) return
  try {
    await submitApi(() => api.post(`/cohorts/${activeCohortId.value}/announcements`, payload), { 
      showSuccess: true, 
      successMsg: 'Announcement posted successfully' 
    })
    formRef.value?.reset()
    fetchAnnouncements()
  } catch {
    // Error is handled by useApi and shown in toast
  }
}

async function handleDelete(id) {
  if (!confirm('Are you sure you want to delete this announcement?')) return
  
  try {
    await deleteApi(() => api.delete(`/announcements/${id}`), {
      showSuccess: true,
      successMsg: 'Announcement deleted'
    })
    fetchAnnouncements()
  } catch {
    // Error handled by useApi
  }
}

onMounted(async () => {
  if (authStore.user?.cohort_id) {
    // Student or Instructor
    fetchAnnouncements()
  } else {
    // Manager or Track Admin
    try {
      const res = await loadCohorts(() => api.get('/cohorts'))
      cohorts.value = res.data || []
      if (cohorts.value.length > 0) {
        selectedCohortId.value = cohorts.value[0].id
        fetchAnnouncements()
      }
    } catch {
      console.error('Failed to load cohorts')
    }
  }
})

watch(selectedCohortId, () => {
  if (selectedCohortId.value) {
    fetchAnnouncements()
  }
})
</script>

<template>
  <MainLayout>
    <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="font-display-lg text-display-lg text-on-background">Announcements</h1>
        <p class="font-body-md text-body-md text-on-surface-variant mt-2">Latest updates and news for your cohort.</p>
      </div>
      
      <!-- Cohort Selector for Admins -->
      <div v-if="!authStore.user?.cohort_id && cohorts.length > 0" class="w-full md:w-64">
        <label class="block text-xs text-on-surface-variant mb-1">Select Cohort</label>
        <select 
          v-model="selectedCohortId"
          class="w-full px-3 py-2 bg-surface border border-outline-variant rounded-input text-sm focus:outline-none focus:border-primary"
        >
          <option v-for="c in cohorts" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
    </div>

    <!-- Create Form -->
    <AnnouncementForm 
      v-if="canCreate && activeCohortId" 
      ref="formRef"
      :loading="submitting" 
      @submit="handleCreate" 
    />

    <!-- List -->
    <div v-if="loading && !announcements" class="py-12 flex justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
    
    <div v-else-if="error" class="bg-error-container text-on-error-container p-6 rounded-xl border border-error-container">
      <p>{{ error }}</p>
      <button @click="fetchAnnouncements" class="mt-4 px-4 py-2 bg-surface rounded">Retry</button>
    </div>
    
    <div v-else-if="!activeCohortId" class="bg-surface border border-outline-variant p-8 rounded-xl text-center text-on-surface-variant">
      Please select a cohort to view announcements.
    </div>
    
    <div v-else-if="!announcements || announcements.length === 0" class="bg-surface border border-outline-variant p-12 rounded-xl text-center flex flex-col items-center">
      <AppIcon name="campaign" :size="48" class="text-surface-container-high mb-4" />
      <h3 class="text-on-surface font-medium text-lg mb-1">No announcements yet</h3>
      <p class="text-on-surface-variant">There are currently no announcements for this cohort.</p>
    </div>
    
    <div v-else class="space-y-4">
      <AnnouncementCard 
        v-for="ann in announcements" 
        :key="ann.id"
        :announcement="ann"
        @delete="handleDelete"
      />
    </div>
  </MainLayout>
</template>
