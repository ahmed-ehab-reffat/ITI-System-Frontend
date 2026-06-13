<script setup>
import { onMounted, computed } from 'vue'
import { useAttendanceStore } from '@/stores/attendance'
import { useLedgerStore } from '@/stores/ledger'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

import Table from '@/components/ui/Table.vue'
import Badge from '@/components/ui/Badge.vue'

const attendanceStore = useAttendanceStore()
const ledgerStore = useLedgerStore()
const { user } = useAuth()
const toast = useToast()

const historyColumns = [
  { key: 'date', label: 'Date' },
  { key: 'type', label: 'Type' },
  { key: 'arrived_at', label: 'Arrived' },
  { key: 'left_at', label: 'Left' },
  { key: 'status', label: 'Status' },
]

const deductionColumns = [
  { key: 'session_date', label: 'Date' },
  { key: 'cohort', label: 'Cohort' },
  { key: 'status', label: 'Reason' },
  { key: 'deduction', label: 'Points' },
]

onMounted(async () => {
  try {
    // Backend has no /me/ routes — pass the authenticated student's own
    // id; the API still authorizes this server-side (ACC-4).
    const studentId = user.value?.id
    await Promise.all([
      attendanceStore.fetchForStudent(studentId),
      ledgerStore.fetchForStudent(studentId),
    ])
  } catch {
    toast.error('Could not load your attendance.')
  }
})

// The backend already only includes 'absent' and 'excused' records in
// `history` (deduction-affecting entries), so no further filtering needed.
const deductionHistory = computed(() => ledgerStore.history || [])

function formatTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Ledger balance card -->
    <div
      class="rounded-lg border p-6"
      :class="
        ledgerStore.statusColor === 'green'
          ? 'border-green-200 bg-green-50'
          : ledgerStore.statusColor === 'red'
            ? 'border-red-200 bg-red-50'
            : 'border-neutral-200 bg-white'
      "
    >
      <p class="text-sm font-medium text-neutral-500">Attendance Ledger Balance</p>
      <div class="mt-1 flex items-baseline gap-2">
        <span
          class="text-4xl font-bold"
          :class="
            ledgerStore.statusColor === 'green'
              ? 'text-green-700'
              : ledgerStore.statusColor === 'red'
                ? 'text-red-700'
                : 'text-neutral-800'
          "
        >
          {{ ledgerStore.loading ? '—' : ledgerStore.balance }}
        </span>
        <span class="text-sm text-neutral-400">/ 250 points</span>
      </div>
      <p v-if="ledgerStore.isAtRisk" class="mt-2 text-sm font-medium text-red-700">
        ⚠ Your balance is below 150 points — you are flagged as at-risk.
      </p>
    </div>

    <!-- Session history -->
    <div>
      <h3 class="mb-2 text-sm font-semibold text-neutral-700">Session History</h3>
      <Table
        :columns="historyColumns"
        :rows="attendanceStore.studentRecords"
        :loading="attendanceStore.loading"
        empty-text="No attendance records yet."
      >
        <template #cell-date="{ row }">
          {{ formatDate(row.date ?? row.session_date) }}
        </template>
        <template #cell-arrived_at="{ value }">
          {{ formatTime(value) }}
        </template>
        <template #cell-left_at="{ value }">
          {{ formatTime(value) }}
        </template>
        <template #cell-status="{ value }">
          <Badge :status="value" />
        </template>
      </Table>
    </div>

    <!-- Deduction history (POR-2) -->
    <div>
      <h3 class="mb-2 text-sm font-semibold text-neutral-700">Ledger Deduction History</h3>
      <Table
        :columns="deductionColumns"
        :rows="deductionHistory"
        :loading="ledgerStore.loading"
        empty-text="No deductions on record."
      >
        <template #cell-session_date="{ value }">
          {{ formatDate(value) }}
        </template>
        <template #cell-status="{ value }">
          <Badge :status="value" />
        </template>
        <template #cell-deduction="{ value }">
          <span class="font-medium text-red-600">{{ value }}</span>
        </template>
      </Table>
    </div>
  </div>
</template>