<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import AnnouncementCard from '@/components/announcements/AnnouncementCard.vue'
import AnnouncementForm from '@/components/announcements/AnnouncementForm.vue'
import { useApi } from '@/composables/useApi'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { useAnnouncementsStore } from '@/stores/announcements'
import { useToast } from '@/composables/useToast'

const authStore = useAuthStore()
const announcementsStore = useAnnouncementsStore()
const { show } = useToast()

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
const submitting = ref(false)

async function fetchAnnouncements() {
  if (!activeCohortId.value) return
  await announcementsStore.fetchForCohort(activeCohortId.value)
}

async function handleCreate(payload) {
  if (!activeCohortId.value) return
  submitting.value = true
  try {
    await announcementsStore.create(activeCohortId.value, payload)
    show('Announcement posted successfully', 'success')
    formRef.value?.reset()
  } catch (err) {
    show(err.response?.data?.message || 'Failed to post announcement', 'error')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('Are you sure you want to delete this announcement?')) return
  try {
    await announcementsStore.destroy(id)
    show('Announcement deleted', 'success')
  } catch (err) {
    show(err.response?.data?.message || 'Failed to delete announcement', 'error')
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
      // res is already response.data — handle both plain array and wrapped { data: [...] }
      cohorts.value = Array.isArray(res) ? res : (res?.data ?? [])
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
    <div v-if="announcementsStore.loading && !announcementsStore.announcements.length" class="py-12 flex justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
    
    <div v-else-if="!activeCohortId" class="bg-surface border border-outline-variant p-8 rounded-xl text-center text-on-surface-variant">
      Please select a cohort to view announcements.
    </div>
    
    <div v-else-if="!announcementsStore.announcements || announcementsStore.announcements.length === 0" class="bg-surface border border-outline-variant p-12 rounded-xl text-center flex flex-col items-center">
      <AppIcon name="campaign" :size="48" class="text-surface-container-high mb-4" />
      <h3 class="text-on-surface font-medium text-lg mb-1">No announcements yet</h3>
      <p class="text-on-surface-variant">There are currently no announcements for this cohort.</p>
    </div>
    
    <div v-else class="space-y-4">
      <AnnouncementCard 
        v-for="ann in announcementsStore.announcements" 
        :key="ann.id"
        :announcement="ann"
        @delete="handleDelete"
      />
    </div>
  </MainLayout>
</template>
