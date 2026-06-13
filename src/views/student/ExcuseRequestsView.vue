<script setup>
import { ref, computed, onMounted } from 'vue'
import { useExcuseRequestsStore } from '@/stores/excuseRequests'
import { useAttendanceStore } from '@/stores/attendance'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

import Table from '@/components/ui/Table.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import NewExcuseModal from '@/components/shared/NewExcuseModal.vue'

const store = useExcuseRequestsStore()
const attendanceStore = useAttendanceStore()
const { user } = useAuth()
const toast = useToast()

const showModal = ref(false)
const submitting = ref(false)

const columns = [
  { key: 'session_date', label: 'Session Date' },
  { key: 'reason', label: 'Reason' },
  { key: 'status', label: 'Status' },
]

// Only the student's own absent records — fetched via /students/{id}/attendance
const absences = computed(() =>
  (attendanceStore.studentRecords || []).filter((r) => r.status === 'absent')
)

onMounted(async () => {
  try {
    await Promise.all([store.fetchMine(), attendanceStore.fetchForStudent(user.value?.id)])
  } catch {
    toast.error('Could not load your excuse requests.')
  }
})

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
}

async function handleSubmit(payload) {
  submitting.value = true
  try {
    await store.submit(payload)
    toast.success('Excuse request submitted.')
    showModal.value = false
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to submit excuse request.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-neutral-800">My Excuse Requests</h2>
      <Button variant="primary" @click="showModal = true">+ New Excuse</Button>
    </div>

    <Table
      :columns="columns"
      :rows="store.requests"
      :loading="store.loading"
      empty-text="You haven't submitted any excuse requests yet."
    >
      <template #cell-session_date="{ value }">
        {{ formatDate(value) }}
      </template>
      <template #cell-status="{ value }">
        <Badge :status="value" />
      </template>
    </Table>

    <NewExcuseModal
      v-model="showModal"
      :absences="absences"
      :loading="submitting"
      @submit="handleSubmit"
    />
  </div>
</template>