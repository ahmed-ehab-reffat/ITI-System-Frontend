<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import StatCard from '@/components/shared/StatCard.vue'
import AppIcon from '@/components/shared/AppIcon.vue'
import { useApi } from '@/composables/useApi'
import { useCohortsStore } from '@/stores/cohorts'
import { useAnalyticsStore } from '@/stores/analytics'
import GradeDistribution from '@/components/track-admin/GradeDistribution.vue'
import GraderConsistency from '@/components/track-admin/GraderConsistency.vue'
import AtRiskStudents from '@/components/track-admin/AtRiskStudents.vue'
import api from '@/api/axios'

const cohortsStore = useCohortsStore()
const analyticsStore = useAnalyticsStore()

const selectedCohortId = ref(null)
const pendingExcusesCount = ref(0)
const totalStudentsCount = ref(0)

const { execute: executeFetchExcuses } = useApi()
const { execute: executeFetchStudents } = useApi()

// Grade distribution helper
const gradeDistribution = computed(() => {
  return (
    analyticsStore.cohortData?.grade_distribution || {
      above_90: 0,
      '70_to_90': 0,
      '60_to_70': 0,
      below_60: 0,
    }
  )
})

// Grader consistency list helper
const graderConsistency = computed(() => {
  return analyticsStore.cohortData?.lab_group_consistency || []
})

// At-risk students helper
const atRiskList = computed(() => {
  return analyticsStore.cohortData?.at_risk_students || []
})

// Submission status helper
const submissionStatus = computed(() => {
  return (
    analyticsStore.cohortData?.submission_status || {
      submitted: 0,
      missing: 0,
      late: 0,
    }
  )
})

async function loadCohortData(cohortId) {
  if (!cohortId) return

  await analyticsStore.fetchCohort(cohortId)

  // Also fetch excuse requests to count pending
  await executeFetchExcuses(async () => {
    const response = await api.get('/excuse-requests', { params: { status: 'requested' } })
    // Count pending excuses for this cohort (if student has cohort info, otherwise count all)
    const pending = response.data?.data || []
    pendingExcusesCount.value = pending.filter(
      (ex) => !ex.student || ex.student.cohort_id === cohortId,
    ).length
    return response
  })

  // Fetch students for count
  await executeFetchStudents(async () => {
    const response = await api.get('/users', { params: { role: 'student' } })
    const allStudents = response.data?.data || []
    totalStudentsCount.value = allStudents.length // Fallback to all if cohort filtering isn't nested
    return response
  })
}

watch(selectedCohortId, (newId) => {
  if (newId) {
    loadCohortData(newId)
  }
})

onMounted(async () => {
  const list = await cohortsStore.fetchAll()
  if (list && list.length > 0) {
    selectedCohortId.value = list[0].id
  }
})
</script>

<template>
  <MainLayout>
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="font-display-lg text-display-lg text-on-background">Track Admin Dashboard</h1>
        <p class="font-body-md text-body-md text-on-surface-variant mt-2">
          Monitor your cohort's attendance, grades, and consistency.
        </p>
      </div>

      <!-- Cohort Selector -->
      <div v-if="cohortsStore.cohorts.length > 0" class="flex items-center gap-2">
        <label for="cohort-select" class="text-sm font-medium text-secondary whitespace-nowrap"
          >Active Cohort:</label
        >
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
    <div v-if="cohortsStore.loading" class="py-12 flex justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- No cohorts fallback -->
    <div
      v-else-if="cohortsStore.cohorts.length === 0"
      class="bg-surface border border-outline-variant p-8 rounded-xl text-center text-on-surface-variant"
    >
      <AppIcon name="group" class="text-4xl mb-2 text-secondary" />
      <p>No cohorts assigned to you yet.</p>
    </div>

    <!-- Main Dashboard Grid -->
    <div v-else class="space-y-8">
      <!-- Stats Summary row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Students" :value="totalStudentsCount" icon="group" />
        <StatCard
          label="At-Risk Students"
          :value="atRiskList.length"
          :badge="atRiskList.length > 0 ? 'Action Needed' : 'Healthy'"
          :badge-variant="atRiskList.length > 0 ? 'error' : 'success'"
          icon="warning"
        />
        <StatCard
          label="Pending Excuses"
          :value="pendingExcusesCount"
          :badge="pendingExcusesCount > 0 ? 'Review' : null"
          badge-variant="warning"
          icon="description"
        />
        <StatCard
          label="Missing Submissions"
          :value="submissionStatus.missing"
          :badge="submissionStatus.missing > 0 ? 'Late Work' : null"
          badge-variant="neutral"
          icon="assignment_late"
        />
      </div>

      <!-- Loading state for cohort specific data -->
      <div v-if="analyticsStore.loading" class="py-12 flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left Column: Grade Distribution & Submissions -->
        <div class="space-y-8">
          <GradeDistribution :grade-distribution="gradeDistribution" />

          <!-- Submission Status Card -->
          <div class="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
            <h3
              class="font-headline-sm text-headline-sm text-on-surface mb-6 flex items-center gap-2"
            >
              <AppIcon name="assignment" class="text-primary-dark" /> Submissions Tracker
            </h3>

            <div class="grid grid-cols-3 gap-4 text-center">
              <div class="p-4 bg-surface-container rounded-xl">
                <div class="text-2xl font-bold text-[#345968]">
                  {{ submissionStatus.submitted }}
                </div>
                <div class="text-xs text-on-surface-variant uppercase mt-1">Submitted</div>
              </div>
              <div class="p-4 bg-[#ffdad6] rounded-xl">
                <div class="text-2xl font-bold text-on-error-container">
                  {{ submissionStatus.missing }}
                </div>
                <div class="text-xs text-on-error-container uppercase mt-1">Missing</div>
              </div>
              <div class="p-4 bg-[#f0bc98]/30 rounded-xl">
                <div class="text-2xl font-bold text-[#724c30]">{{ submissionStatus.late }}</div>
                <div class="text-xs text-on-surface-variant uppercase mt-1">Late</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: At-Risk Students & Grader Consistency -->
        <div class="space-y-8">
          <AtRiskStudents :at-risk-list="atRiskList" />

          <GraderConsistency :grader-consistency="graderConsistency" />
        </div>
      </div>
    </div>
  </MainLayout>
</template>
