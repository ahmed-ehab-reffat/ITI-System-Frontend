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
  isAtRisk: {
    type: Boolean,
    default: null,
  },
  atRiskReason: {
    type: String,
    default: null,
  },
  attendanceTrend: {
    type: Array,
    default: () => [],
  },
})

// Use server-provided flag if available, otherwise compute locally
const atRiskFlag = computed(() => {
  if (props.isAtRisk !== null) return props.isAtRisk
  return props.balance < 150 || props.courseGrades.some(c => c.computed_score < 60)
})

const balanceRisk = computed(() => props.balance < 150)

const gradesRisk = computed(() =>
  props.courseGrades.some(c => c.computed_score < 60)
)

const failingCourses = computed(() =>
  props.courseGrades.filter(c => c.computed_score < 60)
)
</script>

<template>
  <div v-if="atRiskFlag" class="bg-error-container border border-[#ba1a1a]/20 rounded-xl p-4 md:p-6 mb-8 flex items-start gap-4">
    <div class="mt-1 flex-shrink-0">
      <AppIcon name="warning" :fill="true" class="text-on-error-container" :size="28" />
    </div>
    <div>
      <h3 class="font-headline-sm text-headline-sm text-on-error-container mb-2">Academic Warning: At Risk</h3>

      <!-- If backend provides a reason string, use it -->
      <p v-if="atRiskReason" class="font-body-sm text-body-sm text-[#ba1a1a]/90 mb-2">{{ atRiskReason }}</p>

      <!-- Otherwise fall back to client-side computed details -->
      <ul v-else class="list-disc list-inside space-y-1 font-body-sm text-body-sm text-[#ba1a1a]/90">
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
