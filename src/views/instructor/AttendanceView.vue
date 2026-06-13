<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSessionsStore } from '@/stores/sessions'
import { useAttendanceStore } from '@/stores/attendance'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

import Table from '@/components/ui/Table.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import AttendanceRecordModal from '@/components/shared/AttendanceRecordModal.vue'
import QrDisplay from '@/components/instructor/QrCodeDisplay.vue'

const sessionsStore = useSessionsStore()
const attendanceStore = useAttendanceStore()
const { user } = useAuth()
const toast = useToast()

const selectedSessionId = ref(null)
const showRecordModal = ref(false)
const showQr = ref(false)
const savingRecord = ref(false)
const delivering = ref(false)

const columns = [
  { key: 'student_name', label: 'Student' },
  { key: 'arrived_at', label: 'Arrived At' },
  { key: 'left_at', label: 'Left At' },
  { key: 'status', label: 'Status' },
]

const selectedSession = computed(() =>
  sessionsStore.sessions.find((s) => s.id === selectedSessionId.value)
)

const isDelivered = computed(() => !!selectedSession.value?.delivered_at)

onMounted(async () => {
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
    toast.error('Could not load your sessions.')
  }
})

async function onSessionChange() {
  showQr.value = false
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

async function handleAddRecord({ student_id, status }) {
  savingRecord.value = true

  try {
    await attendanceStore.recordAttendance(selectedSessionId.value, {
      student_id,
      status,
    })

    toast.success('Attendance record saved.')
    showRecordModal.value = false
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to save the record.')
  } finally {
    savingRecord.value = false
  }
}

async function markDelivered() {
  delivering.value = true

  try {
    await sessionsStore.deliver(selectedSessionId.value)
    toast.success('Session marked as delivered.')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to mark session as delivered.')
  } finally {
    delivering.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header / session picker -->
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="w-full max-w-sm">
        <label class="mb-1 block text-sm font-medium text-neutral-700">
          Session
        </label>

        <select
          v-model="selectedSessionId"
          class="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          @change="onSessionChange"
        >
          <option v-if="sessionsStore.sessions.length === 0" value="" disabled>
            No sessions assigned
          </option>

          <option
            v-for="session in sessionsStore.sessions"
            :key="session.id"
            :value="session.id"
          >
            {{ session.title || session.course_name }} — {{ session.date }}
            <template v-if="session.delivered_at">
              (Delivered)
            </template>
          </option>
        </select>
      </div>

      <div class="flex gap-2">
        <Button
          variant="outline"
          :disabled="!selectedSessionId"
          @click="showQr = !showQr"
        >
          {{ showQr ? 'Hide QR' : 'Show QR' }}
        </Button>

        <Button
          variant="secondary"
          :disabled="!selectedSessionId"
          @click="showRecordModal = true"
        >
          + Manual Record
        </Button>

        <Button
          variant="primary"
          :disabled="!selectedSessionId || isDelivered"
          :loading="delivering"
          @click="markDelivered"
        >
          {{ isDelivered ? 'Delivered ✓' : 'Mark Delivered' }}
        </Button>
      </div>
    </div>

    <!-- QR display (FIXED ONLY HERE) -->
    <QrDisplay
      v-if="showQr && selectedSessionId"
      :payload="String(selectedSessionId)"
    />

    <!-- Attendance table -->
    <Table
      :columns="columns"
      :rows="attendanceStore.sessionRecords"
      :loading="attendanceStore.loading"
      row-key="student_id"
      empty-text="No attendance records yet for this session."
    >
      <template #cell-arrived_at="{ value }">
        {{ formatTime(value) }}
      </template>

      <template #cell-left_at="{ value }">
        {{ formatTime(value) }}
      </template>

      <template #cell-status="{ value }">
        <Badge v-if="value" :status="value" />
        <span v-else class="text-neutral-400">—</span>
      </template>
    </Table>

    <AttendanceRecordModal
      v-model="showRecordModal"
      :roster="attendanceStore.sessionRecords"
      :loading="savingRecord"
      @submit="handleAddRecord"
    />
  </div>
</template>