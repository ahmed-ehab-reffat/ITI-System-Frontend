<script setup>
import { ref, onMounted } from 'vue'
import { useSessionsStore } from '@/stores/sessions'
import { useAttendanceStore } from '@/stores/attendance'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

import Table from '@/components/ui/Table.vue'
import Badge from '@/components/ui/Badge.vue'

const sessionsStore = useSessionsStore()
const attendanceStore = useAttendanceStore()

const { user, isAuthenticated } = useAuth()

const toast = useToast()

const selectedSessionId = ref(null)
const savingRecordId = ref(null)

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'excused', label: 'Excused' },
]

const columns = [
  { key: 'student_name', label: 'Student' },
  { key: 'arrived_at', label: 'Arrived At' },
  { key: 'left_at', label: 'Left At' },
  { key: 'status', label: 'Status' },
]

onMounted(async () => {
  // FIX: authentication guard
  if (!isAuthenticated.value) {
    toast.error('You must be logged in.')
    return
  }

  const cohortId = user.value?.cohort_id
  if (!cohortId) {
    toast.error('No cohort assigned to your account.')
    return
  }

  try {
    await sessionsStore.fetchForCohort(cohortId)

    if (sessionsStore.sessions.length > 0) {
      selectedSessionId.value = sessionsStore.sessions[0].id
      await loadAttendance()
    }
  } catch {
    toast.error('Could not load cohort sessions.')
  }
})

async function onSessionChange() {
  await loadAttendance()
}

async function loadAttendance() {
  if (!selectedSessionId.value) return

  try {
    await attendanceStore.fetchForSession(selectedSessionId.value)
  } catch {
    toast.error('Could not load attendance for this session.')
  }
}

function formatTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function handleStatusChange(record, newStatus) {
  if (newStatus === record.status) return

  const previousStatus = record.status
  savingRecordId.value = record.id

  try {
    const updated = await attendanceStore.updateRecord(record.id, {
      status: newStatus,
    })

    const delta = updated.ledger_delta

    if (typeof delta === 'number' && delta !== 0) {
      const sign = delta > 0 ? '+' : ''
      toast.success(
        `Status updated. Ledger adjusted by ${sign}${delta} points.`
      )
    } else {
      toast.success('Status updated.')
    }
  } catch (err) {
    // rollback UI state on failure
    record.status = previousStatus
    toast.error(
      err.response?.data?.message || 'Failed to update status.'
    )
  } finally {
    savingRecordId.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="w-full max-w-sm">
      <label class="mb-1 block text-sm font-medium text-neutral-700">
        Session
      </label>

      <select
        v-model="selectedSessionId"
        class="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        @change="onSessionChange"
      >
        <option
          v-if="sessionsStore.sessions.length === 0"
          value=""
          disabled
        >
          No sessions found for this cohort
        </option>

        <option
          v-for="session in sessionsStore.sessions"
          :key="session.id"
          :value="session.id"
        >
          {{ session.title || session.course_name }} — {{ session.date }}
          <template v-if="session.instructor_name">
            · {{ session.instructor_name }}
          </template>
        </option>
      </select>
    </div>

    <Table
      :columns="columns"
      :rows="attendanceStore.sessionRecords"
      :loading="attendanceStore.loading"
      row-key="student_id"
      empty-text="No attendance records for this session."
    >
      <template #cell-arrived_at="{ value }">
        {{ formatTime(value) }}
      </template>

      <template #cell-left_at="{ value }">
        {{ formatTime(value) }}
      </template>

      <template #cell-status="{ row }">
        <div class="flex items-center gap-2">
          <Badge :status="row.status || 'absent'" />

          <select
            :value="row.status || 'absent'"
            :disabled="savingRecordId === row.id"
            class="rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-50"
            @change="handleStatusChange(row, $event.target.value)"
          >
            <option
              v-for="opt in STATUS_OPTIONS"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
      </template>
    </Table>
  </div>
</template>