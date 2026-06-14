<script setup>
import { ref, onMounted } from 'vue'
import { useSessionsStore } from '@/stores/sessions'
import { useAttendanceStore } from '@/stores/attendance'
import { useCohortsStore } from '@/stores/cohorts'
import { useToast } from '@/composables/useToast'

import Table from '@/components/ui/Table.vue'
import Badge from '@/components/ui/Badge.vue'

const sessionsStore = useSessionsStore()
const attendanceStore = useAttendanceStore()
const cohortsStore = useCohortsStore()
const toast = useToast()

const selectedSessionId = ref(null)
const savingRecordId = ref(null)

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'excused', label: 'Excused' },
]

const columns = [
  { key: 'student', label: 'Student' },
  { key: 'arrived_at', label: 'Arrived At' },
  { key: 'left_at', label: 'Left At' },
  { key: 'status', label: 'Status' },
]

onMounted(async () => {
  try {
    await cohortsStore.fetchAll()

    const cohort =
      cohortsStore.cohorts.find((c) => c.status === 'active') ??
      cohortsStore.cohorts[0]

    if (!cohort) {
      toast.error('No cohort found for your account.')
      return
    }

    await sessionsStore.fetchForCohort(cohort.id)

    if (sessionsStore.sessions.length > 0) {
      selectedSessionId.value = sessionsStore.sessions[0].id
      await loadAttendance()
    }
  } catch (e) {
    console.error(e)
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

    // 🔍 DEBUG (keep temporarily)
    console.log('attendance records:', attendanceStore.sessionRecords)
  } catch (e) {
    console.error(e)
    toast.error('Could not load attendance for this session.')
  }
}

function engagementLabel(engagement) {
  if (!engagement) return 'Session'

  const typeLabel = (() => {
    switch (engagement.type) {
      case 'lecture':
        return 'Lecture'
      case 'business_session':
        return 'Business Session'
      case 'lab':
        return `Lab — ${engagement.lab_group?.name ?? 'Group'}`
      default:
        return engagement.type
    }
  })()

  const instructorName = engagement.instructor?.name
  return instructorName ? `${typeLabel} — ${instructorName}` : typeLabel
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
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
    const updated = await attendanceStore.updateRecord(
      selectedSessionId.value,
      record.id,
      { status: newStatus }
    )

    const delta = updated.ledger_delta

    if (typeof delta === 'number' && delta !== 0) {
      const sign = delta > 0 ? '+' : ''
      toast.success(`Status updated. Ledger adjusted by ${sign}${delta} points.`)
    } else {
      toast.success('Status updated.')
    }
  } catch (err) {
    record.status = previousStatus
    toast.error(err.response?.data?.message || 'Failed to update status.')
  } finally {
    savingRecordId.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Session Selector -->
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
          {{ engagementLabel(session.engagement) }}
          — {{ formatDate(session.session_date) }}
          <span v-if="session.is_delivered">(Delivered)</span>
        </option>
      </select>
    </div>

    <!-- Attendance Table -->
    <Table
      :columns="columns"
      :rows="attendanceStore.sessionRecords"
      :loading="attendanceStore.loading"
      row-key="id"
      empty-text="No attendance records for this session."
    >
      <template #cell-student_name="{ row = {} }">
        {{ row.student?.name ?? '—' }}
      </template>

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
            </option>s
          </select>
        </div>
      </template>
    </Table>
  </div>
</template>