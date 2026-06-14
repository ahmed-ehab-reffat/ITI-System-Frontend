<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import Table from '@/components/ui/Table.vue'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { useSubmissionsStore } from '@/stores/submissions'
import { useEngagementsStore } from '@/stores/engagements'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import api from '@/api/axios'

const submissionsStore = useSubmissionsStore()
const engagementsStore = useEngagementsStore()
const authStore = useAuthStore()
const toast = useToast()

const cohortSessions = ref([])

const showSubmitModal = ref(false)
const submitTab = ref('url')
const submitUrl = ref('')
const submitFile = ref(null)
const submitting = ref(false)
const selectedSession = ref(null)

const columns = [
  { key: 'session_label', label: 'Session' },
  { key: 'session_date', label: 'Date' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '' },
]

const sessionRows = computed(() => {
  const submissionBySession = {}

  for (const sub of submissionsStore.studentSubmissions) {
    submissionBySession[sub.session_id] = sub
  }

  return cohortSessions.value.map((session) => {
    const submission = submissionBySession[session.id]

    return {
      session_id: session.id,
      session_label: session.title || session.course_name || session.engagement?.type || 'Session',
      session_date: session.session_date || session.date,
      submission,
      days_late: submission ? getDaysLate(session, submission) : 0,
    }
  })
})

function getDaysLate(session, submission) {
  if (!submission?.submitted_at) return 0
  if (Number(submission.late_penalty) > 0) {
    const due = new Date(session.session_date || session.date)
    const submitted = new Date(submission.submitted_at)
    due.setHours(0, 0, 0, 0)
    submitted.setHours(0, 0, 0, 0)
    const diff = Math.floor((submitted - due) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 1
  }
  return 0
}

function getStatus(row) {
  const sub = row.submission
  if (!sub || !sub.submitted_at) return 'not_submitted'
  if (sub.raw_score !== null && sub.raw_score !== undefined) return 'graded'
  return 'submitted'
}

onMounted(async () => {
  const studentId = authStore.user?.id
  const cohortId = authStore.user?.cohort_id

  if (!studentId || !cohortId) {
    toast.error('Your account is missing cohort information.')
    return
  }

  try {
    await engagementsStore.fetchForCohort(cohortId)

    const sessions = []
    for (const engagement of engagementsStore.engagements) {
      const { data } = await api.get(`/engagements/${engagement.id}/sessions`)
      const list = data.data ?? data
      sessions.push(...list.map((s) => ({ ...s, engagement })))
    }
    cohortSessions.value = sessions

    await submissionsStore.fetchForStudent(studentId)
  } catch {
    toast.error('Could not load your submissions.')
  }
})

function openSubmitModal(row) {
  selectedSession.value = row
  submitTab.value = 'url'
  submitUrl.value = ''
  submitFile.value = null
  showSubmitModal.value = true
}

function onFileChange(event) {
  submitFile.value = event.target.files?.[0] || null
}

async function handleSubmit() {
  if (!selectedSession.value) return

  if (submitTab.value === 'url' && !submitUrl.value.trim()) {
    toast.error('Enter a URL to submit.')
    return
  }

  if (submitTab.value === 'file' && !submitFile.value) {
    toast.error('Select a file to upload.')
    return
  }

  submitting.value = true

  try {
    const payload =
      submitTab.value === 'url' ? { url: submitUrl.value.trim() } : { file: submitFile.value }

    await submissionsStore.submit(selectedSession.value.session_id, payload)

    await submissionsStore.fetchForStudent(authStore.user.id)

    toast.success('Submission saved successfully.')
    showSubmitModal.value = false
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to submit work.')
  } finally {
    submitting.value = false
  }
}

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <MainLayout>
    <div class="mb-8">
      <h1 class="font-display-lg text-display-lg text-on-background">My Submissions</h1>
      <p class="font-body-md text-body-md text-on-surface-variant mt-2">
        Submit lab work and track grading status for each session.
      </p>
    </div>

    <Table
      :columns="columns"
      :rows="sessionRows"
      :loading="submissionsStore.loading"
      row-key="session_id"
      empty-text="No sessions available for your cohort."
    >
      <template #cell-session_date="{ value }">
        {{ formatDate(value) }}
      </template>

      <template #cell-status="{ row }">
        <div class="flex flex-wrap items-center gap-2">
          <template v-if="getStatus(row) === 'not_submitted'">
            <span class="text-neutral-500">Not submitted</span>
          </template>

          <template v-else-if="getStatus(row) === 'submitted'">
            <span class="text-neutral-700">
              Submitted ({{ formatDate(row.submission.submitted_at) }})
            </span>
            <StatusBadge
              v-if="row.days_late > 0"
              :label="`${row.days_late} day${row.days_late > 1 ? 's' : ''} late`"
              variant="warning"
              size="sm"
            />
          </template>

          <template v-else>
            <span class="font-semibold text-primary text-base">
              Graded: {{ Number(row.submission.final_score).toFixed(2) }}
            </span>
            <StatusBadge
              v-if="row.days_late > 0"
              :label="`Late (-${row.submission.late_penalty})`"
              variant="warning"
              size="sm"
            />
          </template>
        </div>
      </template>

      <template #cell-actions="{ row }">
        <Button
          v-if="getStatus(row) === 'not_submitted'"
          size="sm"
          variant="primary"
          @click="openSubmitModal(row)"
        >
          Submit
        </Button>
        <Button
          v-else-if="getStatus(row) === 'submitted'"
          size="sm"
          variant="outline"
          @click="openSubmitModal(row)"
        >
          Resubmit
        </Button>
      </template>
    </Table>

    <!-- Submit Modal -->
    <Modal
      v-model="showSubmitModal"
      :title="`Submit — ${selectedSession?.session_label || 'Session'}`"
      size="md"
    >
      <div class="flex border-b border-neutral-200 mb-4">
        <button
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          :class="
            submitTab === 'url'
              ? 'border-primary text-primary'
              : 'border-transparent text-neutral-500'
          "
          @click="submitTab = 'url'"
        >
          URL
        </button>
        <button
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          :class="
            submitTab === 'file'
              ? 'border-primary text-primary'
              : 'border-transparent text-neutral-500'
          "
          @click="submitTab = 'file'"
        >
          File Upload
        </button>
      </div>

      <div v-if="submitTab === 'url'">
        <label class="block text-sm font-medium text-neutral-700 mb-1"> Submission URL </label>
        <input
          v-model="submitUrl"
          type="url"
          placeholder="https://github.com/..."
          class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div v-else>
        <label class="block text-sm font-medium text-neutral-700 mb-1">
          Upload File (max 1 MB)
        </label>
        <input type="file" class="w-full text-sm" @change="onFileChange" />
      </div>

      <template #footer>
        <Button variant="outline" @click="showSubmitModal = false">Cancel</Button>
        <Button variant="primary" :loading="submitting" @click="handleSubmit"> Submit </Button>
      </template>
    </Modal>
  </MainLayout>
</template>
