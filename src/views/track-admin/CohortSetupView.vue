<script setup>
import { ref, onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import AppIcon from '@/components/shared/AppIcon.vue'
import { useApi } from '@/composables/useApi'
import { useCohortsStore } from '@/stores/cohorts'
import CoursesSetup from '@/components/track-admin/CoursesSetup.vue'
import LabGroupsSetup from '@/components/track-admin/LabGroupsSetup.vue'
import EngagementsSetup from '@/components/track-admin/EngagementsSetup.vue'
import SessionsSetup from '@/components/track-admin/SessionsSetup.vue'

const cohortsStore = useCohortsStore()

const selectedCohortId = ref(null)
const activeTab = ref('courses') // courses, lab-groups, engagements, sessions

// List of tabs
const tabs = [
  { id: 'courses', label: 'Courses', icon: 'menu_book' },
  { id: 'lab-groups', label: 'Lab Groups', icon: 'groups' },
  { id: 'engagements', label: 'Engagements', icon: 'handshake' },
  { id: 'sessions', label: 'Sessions', icon: 'calendar_month' }
]

// API helpers
const { loading: cohortsLoading, execute: executeFetchCohorts } = useApi()

// Fetch all cohorts on mount
onMounted(async () => {
  await executeFetchCohorts(async () => {
    const list = await cohortsStore.fetchAll()
    if (list && list.length > 0) {
      selectedCohortId.value = list[0].id
    }
    return { data: list }
  })
})
</script>

<template>
  <MainLayout>
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="font-display-lg text-display-lg text-on-background">Cohort Setup</h1>
        <p class="font-body-md text-body-md text-on-surface-variant mt-2">
          Configure courses, lab groups, engagements, and sessions for your cohort.
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

    <!-- Loading state for cohorts -->
    <div v-if="cohortsLoading" class="py-12 flex justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- No cohorts fallback -->
    <div v-else-if="cohortsStore.cohorts.length === 0" class="bg-surface border border-outline-variant p-8 rounded-xl text-center text-on-surface-variant">
      <AppIcon name="group" class="text-4xl mb-2 text-secondary" />
      <p>No cohorts assigned to you yet.</p>
    </div>

    <!-- Cohort Setup Tabs -->
    <div v-else class="space-y-6">
      
      <!-- Tab Navigation -->
      <div class="border-b border-outline-variant flex gap-4 overflow-x-auto pb-px">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap"
          :class="activeTab === tab.id ? 'border-primary text-[#345968] font-bold' : 'border-transparent text-secondary hover:text-black'"
        >
          <AppIcon :name="tab.icon" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="space-y-6 pt-4">
        <CoursesSetup v-if="activeTab === 'courses' && selectedCohortId" :cohort-id="selectedCohortId" />
        
        <LabGroupsSetup v-if="activeTab === 'lab-groups' && selectedCohortId" :cohort-id="selectedCohortId" />
        
        <EngagementsSetup v-if="activeTab === 'engagements' && selectedCohortId" :cohort-id="selectedCohortId" />
        
        <SessionsSetup v-if="activeTab === 'sessions' && selectedCohortId" :cohort-id="selectedCohortId" />
      </div>

    </div>
  </MainLayout>
</template>
