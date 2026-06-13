<script setup>
import { onMounted } from 'vue'
import { useAnalyticsStore } from '@/stores/analytics'
import StatCard from '@/components/shared/StatCard.vue'
import AppSpinner from '@/components/ui/Spinner.vue'

const analyticsStore = useAnalyticsStore()

onMounted(() => {
  analyticsStore.fetchBranch()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-neutral-900">Branch Dashboard</h1>
      <button 
        @click="analyticsStore.fetchBranch"
        class="text-sm font-medium text-secondary-600 hover:text-secondary-700"
      >
        Refresh Data
      </button>
    </div>

    <div v-if="analyticsStore.loading && !analyticsStore.branchData" class="flex justify-center py-12">
      <AppSpinner size="lg" />
    </div>

    <template v-else-if="analyticsStore.branchData">
      <!-- Stat Cards -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Students"
          :value="analyticsStore.branchData.total_students"
          icon="group"
        />
        <StatCard
          label="Active Cohorts"
          :value="analyticsStore.branchData.active_cohorts_count"
          icon="school"
        />
        <StatCard
          label="At Risk"
          :value="analyticsStore.branchData.at_risk_count"
          icon="warning"
        />
        <StatCard
          label="Instructors"
          :value="analyticsStore.branchData.instructors_count"
          icon="badge"
        />
      </div>

      <!-- Tracks Table -->
      <div class="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-neutral-200">
          <h2 class="text-lg font-semibold text-neutral-900">Track Performance</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold">
              <tr>
                <th class="px-6 py-3">Track Name</th>
                <th class="px-6 py-3">Active Cohorts</th>
                <th class="px-6 py-3">Students</th>
                <th class="px-6 py-3">Attendance Avg</th>
                <th class="px-6 py-3">At Risk</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-200">
              <tr v-for="track in analyticsStore.branchData.tracks" :key="track.id" class="hover:bg-neutral-50">
                <td class="px-6 py-4 font-medium text-neutral-900">{{ track.name }}</td>
                <td class="px-6 py-4">{{ track.cohorts_count }}</td>
                <td class="px-6 py-4">{{ track.students_count }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-16 bg-neutral-200 rounded-full h-1.5">
                      <div 
                        class="bg-green-500 h-1.5 rounded-full" 
                        :style="{ width: `${track.attendance_avg}%` }"
                      ></div>
                    </div>
                    <span>{{ track.attendance_avg }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span 
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    :class="track.at_risk_count > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'"
                  >
                    {{ track.at_risk_count }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
