<script setup>
import { ref, onMounted, watch } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import AppIcon from '@/components/shared/AppIcon.vue'
import AnnouncementCard from '@/components/track-admin/AnnouncementCard.vue'
import AnnouncementForm from '@/components/track-admin/AnnouncementForm.vue'
import { useToast } from '@/composables/useToast'
import { useApi } from '@/composables/useApi'
import { useCohortsStore } from '@/stores/cohorts'
import { useAnnouncementsStore } from '@/stores/announcements'

const cohortsStore = useCohortsStore()
const announcementsStore = useAnnouncementsStore()
const { show: showToast } = useToast()

const selectedCohortId = ref(null)

// Form states
const showForm = ref(false)
const formTitle = ref('')
const formBody = ref('')
const editingAnnouncementId = ref(null)

const { loading: cohortsLoading, execute: executeFetchCohorts } = useApi()
const { loading: announcementsLoading, execute: executeFetchAnnouncements } = useApi()
const { loading: actionLoading, execute: executeAction } = useApi()

// Load announcements when cohort changes
async function loadAnnouncements(cohortId) {
  if (!cohortId) return
  await executeFetchAnnouncements(async () => {
    const result = await announcementsStore.fetchForCohort(cohortId)
    return { data: result }
  })
}

watch(selectedCohortId, (newId) => {
  if (newId) {
    loadAnnouncements(newId)
    resetForm()
  }
})

onMounted(async () => {
  await executeFetchCohorts(async () => {
    const list = await cohortsStore.fetchAll()
    if (list && list.length > 0) {
      selectedCohortId.value = list[0].id
    }
    return { data: list }
  })
})

async function handleSaveAnnouncement({ title, body }) {
  if (!selectedCohortId.value) return
  
  await executeAction(async () => {
    const payload = { title, body }
    let result
    
    if (editingAnnouncementId.value) {
      result = await announcementsStore.update(selectedCohortId.value, editingAnnouncementId.value, payload)
      showToast('Announcement updated successfully!', 'success')
    } else {
      result = await announcementsStore.create(selectedCohortId.value, payload)
      showToast('Announcement posted successfully!', 'success')
    }
    
    resetForm()
    return { data: result }
  })
}

function startEdit(announcement) {
  editingAnnouncementId.value = announcement.id
  formTitle.value = announcement.title
  formBody.value = announcement.body
  showForm.value = true
}

async function handleDelete(announcementId) {
  if (!confirm('Are you sure you want to delete this announcement?')) return
  
  await executeAction(async () => {
    const result = await announcementsStore.destroy(selectedCohortId.value, announcementId)
    showToast('Announcement deleted successfully!', 'success')
    return { data: result }
  })
}

function resetForm() {
  formTitle.value = ''
  formBody.value = ''
  editingAnnouncementId.value = null
  showForm.value = false
}
</script>

<template>
  <MainLayout>
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="font-display-lg text-display-lg text-on-background">Cohort Announcements</h1>
        <p class="font-body-md text-body-md text-on-surface-variant mt-2">
          Post updates, resources, and notices to your cohort's announcement board.
        </p>
      </div>

      <!-- Cohort Selector -->
      <div v-if="cohortsStore.cohorts.length > 0" class="flex items-center gap-2">
        <label for="cohort-select" class="text-sm font-medium text-secondary whitespace-nowrap">Cohort:</label>
        <select
          id="cohort-select"
          v-model="selectedCohortId"
          class="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-[200px]"
        >
          <option v-for="cohort in cohortsStore.cohorts" :key="cohort.id" :value="cohort.id">
            {{ cohort.name }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="cohortsLoading" class="py-12 flex justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- No cohorts assigned -->
    <div v-else-if="cohortsStore.cohorts.length === 0" class="bg-surface border border-outline-variant p-8 rounded-xl text-center text-on-surface-variant">
      <AppIcon name="campaign" class="text-4xl mb-2 text-secondary" />
      <p>No cohorts assigned to you yet.</p>
    </div>

    <!-- Main Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Left side: Announcement Feed -->
      <div class="lg:col-span-8 space-y-6">
        <div class="flex justify-between items-center mb-2">
          <h2 class="font-headline-sm text-headline-sm">Announcement Feed</h2>
          <button 
            v-if="!showForm"
            @click="showForm = true"
            class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <AppIcon name="add" /> New Announcement
          </button>
        </div>

        <div v-if="announcementsLoading" class="py-8 flex justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="announcementsStore.announcements.length === 0" class="bg-surface border border-outline-variant rounded-xl p-8 text-center text-on-surface-variant">
          <AppIcon name="notifications_off" class="text-3xl text-secondary mb-2" />
          <p>No announcements posted yet. Start by writing one!</p>
        </div>

        <div v-else class="space-y-6">
          <AnnouncementCard 
            v-for="ann in announcementsStore.announcements" 
            :key="ann.id" 
            :announcement="ann"
            @edit="startEdit"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- Right side: New Announcement form -->
      <div v-if="showForm" class="lg:col-span-4">
        <AnnouncementForm
          :initial-title="formTitle"
          :initial-body="formBody"
          :is-editing="!!editingAnnouncementId"
          :loading="actionLoading"
          @save="handleSaveAnnouncement"
          @cancel="resetForm"
        />
      </div>

    </div>
  </MainLayout>
</template>
