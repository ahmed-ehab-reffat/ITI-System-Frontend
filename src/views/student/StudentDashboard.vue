<script setup>
import { onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import AtRiskBanner from '@/components/student/AtRiskBanner.vue'
import CourseGradeCard from '@/components/student/CourseGradeCard.vue'
import StatCard from '@/components/shared/StatCard.vue'
import { useApi } from '@/composables/useApi'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { loading, error, data: analytics, execute } = useApi()

onMounted(async () => {
  await execute(() => api.get('/analytics/student'))
})
</script>

<template>
  <MainLayout>
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
      <div>
        <h1 class="font-display-lg text-display-lg text-on-background">Student Dashboard</h1>
        <p class="font-body-md text-body-md text-on-surface-variant mt-2">Welcome back, {{ authStore.user?.name }}. Here is your academic progress.</p>
      </div>
    </div>

    <div v-if="loading" class="py-12 flex justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="bg-error-container text-on-error-container p-6 rounded-xl border border-error-container">
      <h3 class="font-headline-sm mb-2">Error loading analytics</h3>
      <p>{{ error }}</p>
      <button @click="execute(() => api.get('/analytics/student'))" class="mt-4 px-4 py-2 bg-surface rounded text-on-surface">Retry</button>
    </div>

    <div v-else-if="analytics">
      <AtRiskBanner 
        :balance="analytics.attendance_balance" 
        :course-grades="analytics.course_grades" 
      />

      <div class="mb-8">
        <h2 class="font-headline-sm text-headline-sm text-on-background mb-4">Overview</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="Attendance Balance" 
            :value="analytics.attendance_balance"
            icon="fact_check"
          />
        </div>
      </div>

      <div>
        <h2 class="font-headline-sm text-headline-sm text-on-background mb-4">Course Grades</h2>
        
        <div v-if="!analytics.course_grades || analytics.course_grades.length === 0" class="bg-surface border border-outline-variant rounded-xl p-8 text-center text-on-surface-variant">
          No course grades available yet.
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CourseGradeCard 
            v-for="grade in analytics.course_grades" 
            :key="grade.course"
            :course="grade.course"
            :score="grade.computed_score"
          />
        </div>
      </div>
    </div>
  </MainLayout>
</template>
