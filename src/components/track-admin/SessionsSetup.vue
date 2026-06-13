<script setup>
import { ref, watch } from 'vue'
import AppIcon from '@/components/shared/AppIcon.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { useToast } from '@/composables/useToast'
import { useApi } from '@/composables/useApi'
import { useEngagementsStore } from '@/stores/engagements'
import { useSessionsStore } from '@/stores/sessions'
import api from '@/api/axios'

const props = defineProps({
  cohortId: {
    type: [String, Number],
    required: true
  }
})

const engagementsStore = useEngagementsStore()
const sessionsStore = useSessionsStore()
const { show: showToast } = useToast()

const selectedEngagementId = ref('')
const showAddSessionForm = ref(false)
const sessionDate = ref('')
const sessionDeliveryLoading = ref({})

const { loading: actionLoading, execute: executeAction } = useApi()
const { loading: listLoading, execute: executeFetch } = useApi()

async function fetchEngagements() {
  if (!props.cohortId) return
  await executeFetch(async () => {
    await engagementsStore.fetchForCohort(props.cohortId)
    if (engagementsStore.engagements.length > 0) {
      selectedEngagementId.value = engagementsStore.engagements[0].id
    } else {
      selectedEngagementId.value = ''
      sessionsStore.sessions = []
    }
    return { data: engagementsStore.engagements }
  })
}

watch(() => props.cohortId, (newId) => {
  if (newId) {
    fetchEngagements()
    showAddSessionForm.value = false
    sessionDate.value = ''
  }
}, { immediate: true })

watch(selectedEngagementId, async (newEngagementId) => {
  if (newEngagementId) {
    try {
      const { data } = await api.get(`/engagements/${newEngagementId}/sessions`)
      sessionsStore.sessions = data.data ?? data
    } catch {
      sessionsStore.sessions = []
    }
  } else {
    sessionsStore.sessions = []
  }
})

async function handleCreateSession() {
  if (!selectedEngagementId.value || !sessionDate.value) return
  await executeAction(async () => {
    const result = await sessionsStore.create(selectedEngagementId.value, {
      session_date: sessionDate.value
    })
    showToast('Session date added!', 'success')
    sessionDate.value = ''
    showAddSessionForm.value = false
    return { data: result }
  })
}

async function handleMarkDelivered(sessionId) {
  sessionDeliveryLoading.value[sessionId] = true
  try {
    await sessionsStore.deliver(sessionId)
    showToast('Session delivered & billing recorded.', 'success')
  } catch (e) {
    showToast(e.response?.data?.message || 'Failed to mark session delivered', 'error')
  } finally {
    sessionDeliveryLoading.value[sessionId] = false
  }
}

async function handleDeleteSession(sessionId) {
  if (!confirm('Are you sure you want to delete this session?')) return
  await executeAction(async () => {
    await api.delete(`/sessions/${sessionId}`)
    sessionsStore.sessions = sessionsStore.sessions.filter(s => s.id !== sessionId)
    showToast('Session deleted', 'success')
    return { data: null }
  })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <!-- Engagement Picker -->
      <div class="flex items-center gap-2">
        <label for="eng-select" class="text-sm font-medium text-secondary whitespace-nowrap">Select Engagement:</label>
        <select
          id="eng-select"
          v-model="selectedEngagementId"
          class="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-[250px]"
        >
          <option value="" disabled>Select Engagement</option>
          <option v-for="eng in engagementsStore.engagements" :key="eng.id" :value="eng.id">
            {{ eng.type.toUpperCase() }} - {{ eng.instructor?.name }} ({{ eng.lab_group?.name || 'No Group' }})
          </option>
        </select>
      </div>

      <button
        v-if="selectedEngagementId && !showAddSessionForm"
        @click="showAddSessionForm = true"
        class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
      >
        <AppIcon name="add" /> Add Date
      </button>
    </div>

    <!-- Add Session Date Form -->
    <div v-if="showAddSessionForm" class="bg-surface border border-outline-variant p-6 rounded-xl space-y-4 max-w-sm">
      <h4 class="font-title-md text-title-md">Add Session Date</h4>
      <div class="space-y-2">
        <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Session Date</label>
        <input
          v-model="sessionDate"
          type="date"
          class="w-full text-sm p-2.5 border border-outline-variant rounded-lg bg-surface"
        />
      </div>
      <div class="flex justify-end gap-2 pt-2">
        <button @click="showAddSessionForm = false" class="px-4 py-2 border border-outline text-secondary text-sm rounded-lg hover:bg-surface-container">Cancel</button>
        <button
          @click="handleCreateSession"
          :disabled="!sessionDate || actionLoading"
          class="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark"
        >
          Add
        </button>
      </div>
    </div>

    <div v-if="listLoading" class="py-8 flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Session List Table -->
    <div v-else-if="!selectedEngagementId" class="py-8 text-center text-on-surface-variant text-sm">
      Please pick an engagement to manage sessions.
    </div>
    
    <div v-else-if="sessionsStore.sessions.length === 0" class="py-8 text-center text-on-surface-variant text-sm">
      No session dates registered yet. Click "Add Date" to create one.
    </div>

    <div v-else class="overflow-hidden border border-outline-variant rounded-xl bg-surface">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-container border-b border-outline-variant text-xs font-semibold text-on-surface-variant">
            <th class="py-3 px-4">Session Date</th>
            <th class="py-3 px-4">Status</th>
            <th class="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <tr v-for="session in sessionsStore.sessions" :key="session.id" class="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
            <td class="py-3 px-4 font-semibold text-black">{{ session.session_date }}</td>
            <td class="py-3 px-4">
              <span v-if="session.delivered" class="flex items-center gap-1 text-success font-medium">
                <AppIcon name="check_circle" :size="16" /> Delivered
              </span>
              <button
                v-else
                @click="handleMarkDelivered(session.id)"
                :disabled="sessionDeliveryLoading[session.id]"
                class="flex items-center gap-1 px-3 py-1 bg-surface-container hover:bg-[#A9CFE0]/15 text-[#345968] text-xs font-bold rounded-lg border border-outline-variant transition-colors disabled:opacity-50"
              >
                <span v-if="sessionDeliveryLoading[session.id]" class="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-[#345968] mr-1"></span>
                Mark Delivered
              </button>
            </td>
            <td class="py-3 px-4 text-right">
              <button
                @click="handleDeleteSession(session.id)"
                :disabled="actionLoading"
                class="text-[#ba1a1a] hover:bg-[#ffdad6] p-1.5 rounded transition-colors"
                title="Delete session"
              >
                <AppIcon name="delete" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
