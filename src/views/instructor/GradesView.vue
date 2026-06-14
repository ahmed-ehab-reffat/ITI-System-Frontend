<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import Button from '@/components/ui/Button.vue'
import TagManager from '@/components/shared/TagManager.vue'
import { useSubmissionsStore } from '@/stores/submissions'
import { useEngagementsStore } from '@/stores/engagements'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import api from '@/api/axios'

const route = useRoute()
const submissionsStore = useSubmissionsStore()
const engagementsStore = useEngagementsStore()
const { user } = useAuth()
const toast = useToast()

const selectedSessionId = ref(null)
const labSessions = ref([])
const scoreInputs = ref({})
const savingId = ref(null)

const myLabEngagement = computed(() =>
  engagementsStore.engagements.find(
    (e) =>
      e.instructor_id === user.value?.id &&
      e.type === 'lab' &&
      e.lab_group_id
  )
)

const myLabGroup = computed(() => myLabEngagement.value?.lab_group ?? null)

const groupedByStudent = computed(() => {
  const map = {}

  for (const submission of submissionsStore.sessionSubmissions) {
    const studentId = submission.student_id
    const studentName =
      submission.student?.name || 'Unknown Student'

    if (!map[studentId]) {
      map[studentId] = {
        student_id: studentId,
        student_name: studentName,
        submissions: [],
      }
    }

    map[studentId].submissions.push(submission)
  }

  return Object.values(map)
})

const hasLabGroup = computed(() => !!myLabEngagement.value)
const hasLabSessions = computed(() => labSessions.value.length > 0)

onMounted(async () => {
  try {
    // Instructors don't have a cohort_id on their user record.
    // We derive it from their first engagement via the analytics endpoint.
    const { data: analyticsData } = await api.get('/analytics/instructor')
    const firstEngagement = Array.isArray(analyticsData) ? analyticsData[0] : null

    if (!firstEngagement) {
      // No engagements — hasLabGroup will be false, UI will show the empty state
      return
    }

    // Now fetch engagements using the cohort_id embedded in the engagement resource.
    // The engagement resource includes cohort_id from the DB via EngagementResource.
    const { data: engRes } = await api.get(`/engagements/${firstEngagement.engagement_id}`)
    const cohortId = engRes.data?.cohort_id ?? engRes.cohort_id

    if (!cohortId) {
      toast.error('Could not determine your cohort.')
      return
    }

    await engagementsStore.fetchForCohort(cohortId)

    if (!myLabEngagement.value) {
      return
    }

    await loadLabSessions()

    if (labSessions.value.length > 0) {
      selectedSessionId.value = labSessions.value[0].id
      await loadSubmissions()
    }
  } catch {
    toast.error('Could not load your lab sessions.')
  }
})

async function loadLabSessions() {
  const targetEngagementId = route.query.engagement || null

  const myEngagements = engagementsStore.engagements.filter((e) => {
    const isMyLab = e.instructor_id === user.value?.id && e.type === 'lab'
    // If we came from a specific card, only show sessions for that engagement
    if (targetEngagementId) return isMyLab && e.id === targetEngagementId
    return isMyLab
  })

  const sessions = []

  for (const engagement of myEngagements) {
    const { data } = await api.get(`/engagements/${engagement.id}/sessions`)
    const list = data.data ?? data
    sessions.push(
      ...list.map((s) => ({ ...s, engagement }))
    )
  }

  labSessions.value = sessions
}

async function onSessionChange() {
  await loadSubmissions()
}

async function loadSubmissions() {
  if (!selectedSessionId.value) return

  try {
    await submissionsStore.fetchForSession(selectedSessionId.value)

    const inputs = {}
    for (const sub of submissionsStore.sessionSubmissions) {
      inputs[sub.id] = sub.raw_score ?? ''
    }
    scoreInputs.value = inputs
  } catch {
    toast.error('Could not load submissions for this session.')
  }
}

async function saveGrade(submission) {
  const rawScore = scoreInputs.value[submission.id]

  if (rawScore === '' || rawScore === null) {
    toast.error('Enter a raw score before saving.')
    return
  }

  savingId.value = submission.id

  try {
    await submissionsStore.gradeSubmission(
      selectedSessionId.value,
      submission.id,
      { raw_score: Number(rawScore) }
    )
    toast.success('Submission grade saved.')
  } catch (err) {
    toast.error(
      err.response?.data?.message || 'Failed to save grade.'
    )
  } finally {
    savingId.value = null
  }
}

function formatScore(value) {
  if (value === null || value === undefined) return '—'
  return Number(value).toFixed(2)
}
</script>

<template>
  <MainLayout>
    <div class="mb-8">
      <h1 class="font-display-lg text-display-lg text-on-background">Lab Grades</h1>
      <p class="font-body-md text-body-md text-on-surface-variant mt-2">
        Grade lab submissions for students in your lab group.
      </p>
    </div>

    <!-- No lab group assigned -->
    <div
      v-if="!hasLabGroup"
      class="bg-surface border border-outline-variant rounded-xl p-8 text-center"
    >
      <p class="text-on-surface-variant">
        You are not assigned to a lab group yet. Contact your track admin to be assigned before grading submissions.
      </p>
    </div>

    <template v-else>
      <div class="mb-4 p-3 bg-surface-container-low border border-outline-variant rounded-lg text-sm">
        <span class="text-on-surface-variant">Your lab group:</span>
        <strong class="ml-1">{{ myLabGroup?.name || 'Lab Group' }}</strong>
        <span class="text-on-surface-variant ml-2">
          ({{ myLabGroup?.students?.length ?? 0 }} students)
        </span>
      </div>

      <div v-if="!hasLabSessions" class="bg-surface border border-outline-variant rounded-xl p-8 text-center text-on-surface-variant">
        No lab sessions scheduled yet for your cohort.
      </div>

      <template v-else>
        <div class="mb-6 w-full max-w-sm">
          <label class="mb-1 block text-sm font-medium text-neutral-700">
            Lab Session
          </label>
          <select
            v-model="selectedSessionId"
            class="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
            @change="onSessionChange"
          >
            <option
              v-for="session in labSessions"
              :key="session.id"
              :value="session.id"
            >
              {{ session.title || session.course_name || 'Lab Session' }}
              — {{ session.session_date || session.date }}
            </option>
          </select>
        </div>

        <div v-if="submissionsStore.loading" class="py-12 flex justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>

        <div
          v-else-if="groupedByStudent.length === 0"
          class="bg-surface border border-outline-variant rounded-xl p-8 text-center text-on-surface-variant"
        >
          No submissions from your lab group students for this session yet.
        </div>

        <div v-else class="space-y-6">
          <div
            v-for="student in groupedByStudent"
            :key="student.student_id"
            class="bg-surface border border-outline-variant rounded-xl p-5"
          >
            <h3 class="font-semibold text-lg mb-4">{{ student.student_name }}</h3>

            <!-- Tags (ACC-5: visible to instructors, not students) -->
            <div class="mb-4">
              <span class="text-xs uppercase tracking-wider text-on-surface-variant">Tags</span>
              <TagManager :student-id="student.student_id" />
            </div>

            <div class="space-y-3">
              <div
                v-for="submission in student.submissions"
                :key="submission.id"
                class="flex flex-wrap items-center gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant"
              >
                <div class="flex-1 min-w-[200px]">
                  <span class="text-sm font-medium">Lab Submission</span>
                  <p class="text-xs text-on-surface-variant mt-0.5">
                    Submitted:
                    {{
                      submission.submitted_at
                        ? new Date(submission.submitted_at).toLocaleString()
                        : '—'
                    }}
                  </p>
                  <p
                    v-if="submission.final_score !== null"
                    class="text-sm font-semibold text-primary mt-1"
                  >
                    Final score: {{ formatScore(submission.final_score) }}
                    <span
                      v-if="submission.late_penalty > 0"
                      class="text-xs font-normal text-yellow-700 ml-1"
                    >
                      (late penalty: -{{ submission.late_penalty }})
                    </span>
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <input
                    v-model="scoreInputs[submission.id]"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Raw score"
                    class="w-28 rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="primary"
                    :loading="savingId === submission.id"
                    @click="saveGrade(submission)"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>
  </MainLayout>
</template>
