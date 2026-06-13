<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/shared/AppIcon.vue'

const props = defineProps({
  balance: {
    type: Number,
    required: true,
  },
  courseGrades: {
    type: Array,
    default: () => [],
  },
})

const isAtRisk = computed(() => {
  return balanceRisk.value || gradesRisk.value
})

const balanceRisk = computed(() => {
  return props.balance < 150
})

const gradesRisk = computed(() => {
  return props.courseGrades.some((course) => course.computed_score < 60)
})

const failingCourses = computed(() => {
  return props.courseGrades.filter((course) => course.computed_score < 60)
})
</script>

<template>
  <div v-if="isAtRisk" class="bg-error-container border border-[#ba1a1a]/20 rounded-xl p-4 md:p-6 mb-8 flex items-start gap-4">
    <div class="mt-1 flex-shrink-0">
      <AppIcon name="warning" :fill="true" class="text-on-error-container" :size="28" />
    </div>
    <div>
      <h3 class="font-headline-sm text-headline-sm text-on-error-container mb-2">Academic Warning: At Risk</h3>
      <ul class="list-disc list-inside space-y-1 font-body-sm text-body-sm text-[#ba1a1a]/90">
        <li v-if="balanceRisk">
          Attendance balance is below 150 (currently <span class="font-bold">{{ balance }}</span> points).
        </li>
        <li v-if="gradesRisk">
          Course grade is below 60 in:
          <span v-for="(course, index) in failingCourses" :key="course.course">
            <span class="font-bold">{{ course.course }} ({{ Number(course.computed_score).toFixed(2) }})</span><span v-if="index < failingCourses.length - 1">, </span>
          </span>
        </li>
      </ul>
      <p class="font-body-sm text-body-sm text-[#ba1a1a]/90 mt-3">
        Please contact your track admin or instructor immediately to discuss your progress.
      </p>
    </div>
  </div>
</template>
