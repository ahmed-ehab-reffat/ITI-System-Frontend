<script setup>
import AppIcon from '@/components/shared/AppIcon.vue'

defineProps({
  track: {
    type: String,
    required: true,
  },
  cohortCount: {
    type: Number,
    required: true,
  },
  studentCount: {
    type: Number,
    required: true,
  },
  avgScore: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <div class="bg-surface border border-outline-variant rounded-xl p-6 hover:border-primary transition-colors">
    <div class="flex justify-between items-start mb-4">
      <h3 class="font-headline-sm text-headline-sm text-on-surface truncate pr-2" :title="track">{{ track }}</h3>
      <AppIcon name="domain" class="text-on-surface-variant flex-shrink-0" />
    </div>
    
    <div class="space-y-3">
      <div class="flex justify-between items-center">
        <span class="font-body-sm text-body-sm text-on-surface-variant">Active Cohorts</span>
        <span class="font-label-md text-label-md text-on-surface">{{ cohortCount }}</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="font-body-sm text-body-sm text-on-surface-variant">Total Students</span>
        <span class="font-label-md text-label-md text-on-surface">{{ studentCount }}</span>
      </div>
      <div class="flex justify-between items-center pt-2 border-t border-surface-container-highest">
        <span class="font-label-md text-label-md text-on-surface">Avg Score</span>
        <span class="font-display-lg text-[24px] text-primary">{{ Number(avgScore).toFixed(1) }}</span>
      </div>
    </div>
  </div>
</template>
