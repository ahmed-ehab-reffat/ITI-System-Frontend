<script setup>
import { onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import EngagementCard from '@/components/instructor/EngagementCard.vue'
import { useApi } from '@/composables/useApi'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { loading, error, data: analytics, execute } = useApi()

onMounted(async () => {
  await execute(() => api.get('/analytics/instructor'))
})
</script>

<template>
  <MainLayout>
    <div class="mb-8">
      <h1 class="font-display-lg text-display-lg text-on-background">Instructor Dashboard</h1>
      <p class="font-body-md text-body-md text-on-surface-variant mt-2">Welcome, {{ authStore.user?.name }}. Manage your active engagements below.</p>
    </div>

    <div v-if="loading" class="py-12 flex justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
    
    <div v-else-if="error" class="bg-error-container text-on-error-container p-6 rounded-xl mb-8">
      <p>{{ error }}</p>
      <button @click="execute(() => api.get('/analytics/instructor'))" class="mt-4 px-4 py-2 bg-surface rounded">Retry</button>
    </div>

    <div v-else-if="analytics">
      <h2 class="font-headline-sm text-headline-sm mb-4">Active Engagements</h2>
      
      <div v-if="!analytics || analytics.length === 0" class="bg-surface border border-outline-variant p-8 rounded-xl text-center text-on-surface-variant">
        You have no active engagements.
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <EngagementCard
          v-for="eng in analytics"
          :key="eng.engagement_id"
          :engagement="eng"
        />
      </div>
    </div>
  </MainLayout>
</template>
