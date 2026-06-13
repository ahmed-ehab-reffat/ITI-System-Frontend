<script setup>
import { ref, onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import TrackStatCard from '@/components/manager/TrackStatCard.vue'
import AtRiskList from '@/components/manager/AtRiskList.vue'
import GraderConsistencyTable from '@/components/manager/GraderConsistencyTable.vue'
import AppIcon from '@/components/shared/AppIcon.vue'
import { useApi } from '@/composables/useApi'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Analytics logic
const { loading: branchLoading, error: branchError, data: branchData, execute: executeBranch } = useApi()
const { loading: atRiskLoading, data: atRiskData, execute: executeAtRisk } = useApi()

// Bonus: cohort consistency logic (Track Admin only)
const cohortId = ref(null) // Hardcoded to first cohort if available for demo
const { loading: cohortLoading, data: cohortData, execute: executeCohort } = useApi()

onMounted(async () => {
  if (authStore.isManager) {
    await executeBranch(() => api.get('/analytics/branch'))
  }
  await executeAtRisk(() => api.get('/analytics/at-risk'))

  if (authStore.isTrackAdmin) {
    // For demo purposes, we will try to fetch cohorts and use the first one
    try {
      const response = await api.get('/cohorts')
      if (response.data?.data?.length > 0) {
        cohortId.value = response.data.data[0].id
        await executeCohort(() => api.get(`/analytics/cohorts/${cohortId.value}`))
      }
    } catch (e) {
      console.error('Failed to fetch cohorts', e)
    }
  }
})
</script>

<template>
  <MainLayout>
    <div class="mb-8">
      <h1 class="font-display-lg text-display-lg text-on-background">Manager Dashboard</h1>
      <p class="font-body-md text-body-md text-on-surface-variant mt-2">Welcome, {{ authStore.user?.name }}.</p>
    </div>

    <!-- Branch Overview -->
    <div v-if="branchLoading" class="py-12 flex justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
    
    <div v-else-if="branchError" class="bg-error-container text-on-error-container p-6 rounded-xl mb-8">
      <p>{{ branchError }}</p>
      <button @click="executeBranch(() => api.get('/analytics/branch'))" class="mt-4 px-4 py-2 bg-surface rounded">Retry</button>
    </div>

    <div v-else-if="branchData" class="mb-12">
      <h2 class="font-headline-sm text-headline-sm mb-4">Branch Overview</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TrackStatCard
          v-for="stat in branchData.track_stats"
          :key="stat.track"
          :track="stat.track"
          :cohort-count="stat.cohort_count"
          :student-count="stat.student_count"
          :avg-score="stat.avg_score"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- At-Risk Students -->
      <div>
        <h2 class="font-headline-sm text-headline-sm mb-4">At-Risk Students</h2>
        <AtRiskList :students="atRiskData || []" :loading="atRiskLoading" />
      </div>

      <!-- Grader Consistency (Bonus) -->
      <div v-if="authStore.isTrackAdmin">
        <h2 class="font-headline-sm text-headline-sm mb-4">Grader Consistency</h2>
        <div v-if="!cohortId" class="text-on-surface-variant text-sm">
          Select a cohort to view grader consistency.
        </div>
        <GraderConsistencyTable 
          v-else 
          :consistencies="cohortData?.grader_consistency || []" 
          :loading="cohortLoading" 
        />

        <!-- Early Warning Section -->
        <template v-if="cohortId && cohortData?.early_warning?.length > 0">
          <h2 class="font-headline-sm text-headline-sm mt-8 mb-4 flex items-center gap-2">
            <AppIcon name="trending_down" class="text-[#e65100]" />
            Early Warning
          </h2>
          <div class="bg-[#fff3e0] border border-[#e65100]/30 rounded-xl overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-[#ffe0b2] text-xs">
                <tr>
                  <th class="text-left p-3 font-medium text-[#5d3f1e]">Student</th>
                  <th class="text-left p-3 font-medium text-[#5d3f1e]">Email</th>
                  <th class="text-center p-3 font-medium text-[#5d3f1e]">Recent Absences</th>
                  <th class="text-center p-3 font-medium text-[#5d3f1e]">Ledger</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#e65100]/20">
                <tr v-for="student in cohortData.early_warning" :key="student.student_id" class="hover:bg-[#ffcc80]/20">
                  <td class="p-3 text-[#3e2723] font-medium">{{ student.name }}</td>
                  <td class="p-3 text-[#5d4037]">{{ student.email }}</td>
                  <td class="p-3 text-center font-bold text-[#e65100]">{{ student.recent_absences }} / 3</td>
                  <td class="p-3 text-center font-medium" :class="student.ledger_balance < 150 ? 'text-error' : 'text-on-surface'">{{ student.ledger_balance }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </div>
  </MainLayout>
</template>
