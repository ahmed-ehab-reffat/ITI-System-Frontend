<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/shared/AppIcon.vue'

const props = defineProps({
  gradeDistribution: {
    type: Object,
    required: true,
    default: () => ({
      above_90: 0,
      '70_to_90': 0,
      '60_to_70': 0,
      below_60: 0
    })
  }
})

const totalGrades = computed(() => {
  return Object.values(props.gradeDistribution).reduce((sum, val) => sum + Number(val), 0)
})
</script>

<template>
  <div class="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
    <h3 class="font-headline-sm text-headline-sm text-on-surface mb-6 flex items-center gap-2">
      <AppIcon name="bar_chart" class="text-primary-dark" /> Grade Distribution
    </h3>
    
    <div v-if="totalGrades === 0" class="py-12 text-center text-on-surface-variant text-sm">
      No grades recorded for this cohort.
    </div>
    
    <div v-else class="space-y-4">
      <div v-for="(count, label) in gradeDistribution" :key="label" class="flex items-center">
        <span class="w-24 text-sm text-on-surface-variant font-medium capitalize">
          {{ label.replace('_', ' ') }}
        </span>
        <div class="flex-1 bg-surface-container rounded-full h-4 overflow-hidden relative mx-4">
          <div 
            class="bg-[#A9CFE0] h-full rounded-full transition-all duration-500" 
            :style="{ width: `${(count / totalGrades) * 100}%` }"
          ></div>
        </div>
        <span class="w-12 text-right text-sm font-semibold text-on-surface">{{ count }}</span>
      </div>
      <div class="pt-4 border-t border-outline-variant text-xs text-on-surface-variant flex justify-between">
        <span>Total Graded Elements</span>
        <span>{{ totalGrades }}</span>
      </div>
    </div>
  </div>
</template>
