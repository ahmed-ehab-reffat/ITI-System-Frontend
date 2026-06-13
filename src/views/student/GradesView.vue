<script setup>
import { computed, onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { useGradesStore } from '@/stores/grades'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const gradesStore = useGradesStore()
const authStore = useAuthStore()
const toast = useToast()

const summary = computed(() => gradesStore.summary)

const ledgerTotal = computed(() => {
  if (!summary.value?.ledgers) return 0
  return summary.value.ledgers.reduce(
    (sum, l) => sum + Number(l.balance),
    0
  )
})

onMounted(async () => {
  const studentId = authStore.user?.id
  if (!studentId) return

  try {
    await gradesStore.fetchSummary(studentId)
  } catch {
    toast.error('Could not load your grades.')
  }
})

function formatScore(value) {
  if (value === null || value === undefined) return '—'
  return Number(value).toFixed(2)
}
</script>

<template>
  <MainLayout>
    <div class="mb-8">
      <h1 class="font-display-lg text-display-lg text-on-background">My Grades</h1>
      <p class="font-body-md text-body-md text-on-surface-variant mt-2">
        Your personal grade summary — no class averages or peer data shown.
      </p>
    </div>

    <div v-if="gradesStore.loading" class="py-12 flex justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>

    <div v-else-if="summary" class="space-y-8">
      <!-- Ledger balance line item -->
      <div class="bg-surface border border-outline-variant rounded-xl p-6">
        <h2 class="font-headline-sm text-headline-sm text-on-background mb-4">
          Attendance Ledger
        </h2>
        <div class="space-y-2">
          <div
            v-for="ledger in summary.ledgers"
            :key="ledger.cohort_id"
            class="flex justify-between items-center text-sm py-2 border-b border-outline-variant last:border-0"
          >
            <span class="text-on-surface-variant">
              {{ ledger.cohort_name || 'Cohort' }}
            </span>
            <span
              class="font-semibold"
              :class="ledger.balance < 150 ? 'text-on-error-container' : 'text-primary'"
            >
              {{ formatScore(ledger.balance) }} pts
            </span>
          </div>
          <div class="flex justify-between items-center pt-2 font-semibold">
            <span>Ledger Total</span>
            <span>{{ formatScore(ledgerTotal) }} pts</span>
          </div>
        </div>
      </div>

      <!-- Course cards -->
      <div>
        <h2 class="font-headline-sm text-headline-sm text-on-background mb-4">
          Course Grades
        </h2>

        <div
          v-if="!summary.courses?.length"
          class="bg-surface border border-outline-variant rounded-xl p-8 text-center text-on-surface-variant"
        >
          No course grades available yet.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="course in summary.courses"
            :key="course.course_id"
            class="bg-surface border rounded-xl p-6"
            :class="course.course_total < 60 ? 'border-[#ba1a1a]/40 bg-[#ffdad6]/10' : 'border-outline-variant'"
          >
            <div class="flex justify-between items-start mb-4">
              <h3 class="font-semibold text-lg">{{ course.course_name }}</h3>
              <StatusBadge
                v-if="course.course_total < 60"
                label="At Risk"
                variant="error"
                size="sm"
              />
            </div>

            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-on-surface-variant">Lab Score</span>
                <span class="font-medium">{{ formatScore(course.lab_score) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-on-surface-variant">Exam Score</span>
                <span class="font-medium">{{ formatScore(course.exam_score) }}</span>
              </div>
              <div class="flex justify-between pt-2 border-t border-outline-variant font-semibold">
                <span>Course Total</span>
                <span>{{ formatScore(course.course_total) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Grand total from API (ACC-4: display API value, don't recompute) -->
      <div class="bg-primary/10 border-2 border-primary rounded-xl p-8 text-center">
        <p class="text-sm uppercase tracking-wider text-on-surface-variant mb-2">
          Grand Total
        </p>
        <p class="font-display-lg text-display-lg text-primary font-bold">
          {{ formatScore(summary.grand_total) }}
        </p>
        <p class="text-xs text-on-surface-variant mt-2">
          Ledger + all course totals (as computed by the server)
        </p>
      </div>
    </div>
  </MainLayout>
</template>
