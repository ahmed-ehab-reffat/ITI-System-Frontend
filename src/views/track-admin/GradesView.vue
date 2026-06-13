<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import Table from '@/components/ui/Table.vue'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { useGradesStore } from '@/stores/grades'
import { useCoursesStore } from '@/stores/courses'
import { useCohortsStore } from '@/stores/cohorts'
import { useUsersStore } from '@/stores/users'
import { useToast } from '@/composables/useToast'
import api from '@/api/axios'

const gradesStore = useGradesStore()
const coursesStore = useCoursesStore()
const cohortsStore = useCohortsStore()
const usersStore = useUsersStore()
const toast = useToast()

const selectedCohortId = ref(null)
const selectedCourseId = ref(null)
const enrichedRows = ref([])
const enriching = ref(false)

const showExamModal = ref(false)
const showOverrideModal = ref(false)
const showHistoryPanel = ref(false)
const savingExam = ref(false)
const savingOverride = ref(false)

const selectedRow = ref(null)
const examForm = ref({ exam_raw_score: '', exam_raw_max: '' })
const overrideForm = ref({ new_value: '', reason: '' })

const columns = [
  { key: 'student_name', label: 'Student' },
  { key: 'lab_score', label: 'Lab Score' },
  { key: 'exam_score', label: 'Exam Score' },
  { key: 'course_total', label: 'Course Total' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

const students = computed(() =>
  usersStore.users.filter((u) => u.role === 'student')
)

const overrideReasonValid = computed(
  () => overrideForm.value.reason.trim().length >= 10
)

onMounted(async () => {
  try {
    const cohorts = await cohortsStore.fetchAll()
    if (cohorts?.length) {
      selectedCohortId.value = cohorts[0].id
    }
  } catch {
    toast.error('Could not load cohorts.')
  }
})

watch(selectedCohortId, async (cohortId) => {
  selectedCourseId.value = null
  enrichedRows.value = []
  gradesStore.clear()

  if (!cohortId) return

  try {
    await Promise.all([
      coursesStore.fetchForCohort(cohortId),
      usersStore.fetchAll({ role: 'student' }),
    ])

    if (coursesStore.courses.length) {
      selectedCourseId.value = coursesStore.courses[0].id
    }
  } catch {
    toast.error('Could not load courses or students.')
  }
})

watch(selectedCourseId, async (courseId) => {
  if (!courseId) return
  await loadGradebook()
})

async function loadGradebook() {
  enriching.value = true

  try {
    await gradesStore.fetchCourseGrades(selectedCourseId.value)

    const gradeByStudent = {}
    for (const grade of gradesStore.courseGrades) {
      gradeByStudent[grade.student_id] = grade
    }

    const rows = await Promise.all(
      students.value.map(async (student) => {
        let labScore = null
        let courseTotal = null
        let examScore = gradeByStudent[student.id]?.computed_score ?? null

        try {
          const { data } = await api.get(
            `/students/${student.id}/grades/summary`
          )
          const summary = data.data ?? data
          const courseEntry = summary.courses?.find(
            (c) => c.course_id === selectedCourseId.value
          )

          if (courseEntry) {
            labScore = courseEntry.lab_score
            examScore = courseEntry.exam_score ?? examScore
            courseTotal = courseEntry.course_total
          }
        } catch {
          // Student summary may be unavailable; show partial row
        }

        const grade = gradeByStudent[student.id]

        return {
          student_id: student.id,
          student_name: student.name,
          grade_id: grade?.id ?? null,
          exam_raw_score: grade?.exam_raw_score ?? null,
          exam_raw_max: grade?.exam_raw_max ?? null,
          lab_score: labScore,
          exam_score: examScore,
          course_total: courseTotal,
          is_at_risk: courseTotal !== null && courseTotal < 60,
        }
      })
    )

    enrichedRows.value = rows
  } catch {
    toast.error('Could not load gradebook.')
  } finally {
    enriching.value = false
  }
}

function formatScore(value) {
  if (value === null || value === undefined) return '—'
  return Number(value).toFixed(2)
}

function openExamModal(row) {
  selectedRow.value = row
  examForm.value = {
    exam_raw_score: row.exam_raw_score ?? '',
    exam_raw_max: row.exam_raw_max ?? '',
  }
  showExamModal.value = true
}

function openOverrideModal(row) {
  if (!row.grade_id) {
    toast.error('Enter an exam grade before overriding.')
    return
  }

  selectedRow.value = row
  overrideForm.value = { new_value: row.exam_score ?? '', reason: '' }
  showOverrideModal.value = true
}

async function openHistoryPanel(row) {
  if (!row.grade_id) {
    toast.error('No grade record found for this student.')
    return
  }

  selectedRow.value = row
  showHistoryPanel.value = true

  try {
    await gradesStore.fetchOverrides(row.grade_id)
  } catch {
    toast.error('Could not load override history.')
  }
}

async function saveExamGrade() {
  savingExam.value = true

  try {
    const grade = await gradesStore.enterExamGrade(
      selectedCourseId.value,
      {
        student_id: selectedRow.value.student_id,
        exam_raw_score: Number(examForm.value.exam_raw_score),
        exam_raw_max: Number(examForm.value.exam_raw_max),
      }
    )

    toast.success(
      `Exam grade saved. Normalized score: ${Number(grade.computed_score).toFixed(2)}`
    )
    showExamModal.value = false
    await loadGradebook()
  } catch (err) {
    toast.error(
      err.response?.data?.message || 'Failed to save exam grade.'
    )
  } finally {
    savingExam.value = false
  }
}

async function saveOverride() {
  if (!overrideReasonValid.value) return

  savingOverride.value = true

  try {
    await gradesStore.overrideGrade(selectedRow.value.grade_id, {
      new_value: Number(overrideForm.value.new_value),
      reason: overrideForm.value.reason.trim(),
    })

    toast.success('Grade override saved.')
    showOverrideModal.value = false
    await loadGradebook()
  } catch (err) {
    toast.error(
      err.response?.data?.message || 'Failed to save override.'
    )
  } finally {
    savingOverride.value = false
  }
}
</script>

<template>
  <MainLayout>
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="font-display-lg text-display-lg text-on-background">Gradebook</h1>
        <p class="font-body-md text-body-md text-on-surface-variant mt-2">
          Enter exam grades, override scores, and review the audit trail per course.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <div v-if="cohortsStore.cohorts.length" class="flex items-center gap-2">
          <label class="text-sm font-medium text-secondary whitespace-nowrap">Cohort:</label>
          <select
            v-model="selectedCohortId"
            class="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm min-w-[180px]"
          >
            <option v-for="cohort in cohortsStore.cohorts" :key="cohort.id" :value="cohort.id">
              {{ cohort.name }}
            </option>
          </select>
        </div>

        <div v-if="coursesStore.courses.length" class="flex items-center gap-2">
          <label class="text-sm font-medium text-secondary whitespace-nowrap">Course:</label>
          <select
            v-model="selectedCourseId"
            class="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm min-w-[200px]"
          >
            <option v-for="course in coursesStore.courses" :key="course.id" :value="course.id">
              {{ course.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <Table
      :columns="columns"
      :rows="enrichedRows"
      :loading="gradesStore.loading || enriching"
      row-key="student_id"
      empty-text="No students found for this cohort."
    >
      <template #cell-lab_score="{ value }">
        {{ formatScore(value) }}
      </template>

      <template #cell-exam_score="{ value }">
        {{ formatScore(value) }}
      </template>

      <template #cell-course_total="{ value }">
        <span class="font-semibold">{{ formatScore(value) }}</span>
      </template>

      <template #cell-status="{ row }">
        <StatusBadge
          v-if="row.is_at_risk"
          label="At Risk"
          variant="error"
          size="sm"
        />
        <span v-else class="text-neutral-400">—</span>
      </template>

      <template #cell-actions="{ row }">
        <div class="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" @click="openExamModal(row)">
            Enter Exam Grade
          </Button>
          <Button
            size="sm"
            variant="secondary"
            :disabled="!row.grade_id"
            @click="openOverrideModal(row)"
          >
            Override
          </Button>
          <button
            class="text-sm text-primary hover:underline disabled:opacity-50"
            :disabled="!row.grade_id"
            @click="openHistoryPanel(row)"
          >
            View Override History
          </button>
        </div>
      </template>
    </Table>

    <!-- Enter Exam Grade Modal -->
    <Modal v-model="showExamModal" title="Enter Exam Grade" size="md">
      <p v-if="selectedRow" class="text-sm text-neutral-600 mb-4">
        Student: <strong>{{ selectedRow.student_name }}</strong>
      </p>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            Raw Score
          </label>
          <input
            v-model="examForm.exam_raw_score"
            type="number"
            min="0"
            step="0.01"
            class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            Max Score
          </label>
          <input
            v-model="examForm.exam_raw_max"
            type="number"
            min="0.01"
            step="0.01"
            class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <template #footer>
        <Button variant="outline" @click="showExamModal = false">Cancel</Button>
        <Button
          variant="primary"
          :loading="savingExam"
          :disabled="!examForm.exam_raw_score || !examForm.exam_raw_max"
          @click="saveExamGrade"
        >
          Save
        </Button>
      </template>
    </Modal>

    <!-- Override Modal -->
    <Modal v-model="showOverrideModal" title="Override Grade" size="md">
      <p v-if="selectedRow" class="text-sm text-neutral-600 mb-4">
        Student: <strong>{{ selectedRow.student_name }}</strong>
      </p>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            New Value (0–100)
          </label>
          <input
            v-model="overrideForm.new_value"
            type="number"
            min="0"
            max="100"
            step="0.01"
            class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            Reason (min. 10 characters)
          </label>
          <textarea
            v-model="overrideForm.reason"
            rows="3"
            class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm resize-none"
            placeholder="Explain why this grade is being overridden..."
          />
          <p class="text-xs text-neutral-500 mt-1">
            {{ overrideForm.reason.trim().length }} / 10 characters
          </p>
        </div>
      </div>

      <template #footer>
        <Button variant="outline" @click="showOverrideModal = false">Cancel</Button>
        <Button
          variant="primary"
          :loading="savingOverride"
          :disabled="!overrideForm.new_value || !overrideReasonValid"
          @click="saveOverride"
        >
          Save
        </Button>
      </template>
    </Modal>

    <!-- Override History Side Panel -->
    <div
      v-if="showHistoryPanel"
      class="fixed inset-0 z-40 flex justify-end"
    >
      <div
        class="absolute inset-0 bg-black/30"
        @click="showHistoryPanel = false"
      />

      <div class="relative w-full max-w-md bg-white h-full shadow-xl flex flex-col">
        <div class="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h3 class="font-semibold text-neutral-800">Override History</h3>
            <p v-if="selectedRow" class="text-sm text-neutral-500">
              {{ selectedRow.student_name }}
            </p>
          </div>
          <button
            class="text-neutral-400 hover:text-neutral-600"
            @click="showHistoryPanel = false"
          >
            ✕
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-5">
          <div v-if="gradesStore.loading" class="text-center text-neutral-400 py-8">
            Loading…
          </div>

          <div
            v-else-if="gradesStore.overrides.length === 0"
            class="text-center text-neutral-400 py-8"
          >
            No overrides recorded yet.
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="entry in gradesStore.overrides"
              :key="entry.id"
              class="border border-neutral-200 rounded-lg p-4"
            >
              <div class="flex justify-between text-sm mb-2">
                <span class="text-neutral-500">
                  {{ new Date(entry.created_at).toLocaleString() }}
                </span>
                <span class="font-medium">
                  {{ Number(entry.original_value).toFixed(2) }}
                  →
                  {{ Number(entry.new_value).toFixed(2) }}
                </span>
              </div>
              <p class="text-sm text-neutral-700">{{ entry.reason }}</p>
              <p
                v-if="entry.overridden_by_user"
                class="text-xs text-neutral-400 mt-2"
              >
                By {{ entry.overridden_by_user.name }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
