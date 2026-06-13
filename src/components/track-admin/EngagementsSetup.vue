<script setup>
import { ref, computed, watch } from 'vue'
import AppIcon from '@/components/shared/AppIcon.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { useToast } from '@/composables/useToast'
import { useApi } from '@/composables/useApi'
import { useEngagementsStore } from '@/stores/engagements'
import { useLabGroupsStore } from '@/stores/labGroups'
import { useUsersStore } from '@/stores/users'

const props = defineProps({
  cohortId: {
    type: [String, Number],
    required: true
  }
})

const engagementsStore = useEngagementsStore()
const labGroupsStore = useLabGroupsStore()
const usersStore = useUsersStore()
const { show: showToast } = useToast()

const showAddEngagementForm = ref(false)
const engagementType = ref('lecture')
const engagementInstructorId = ref('')
const engagementLabGroupId = ref('')
const engagementStartsAt = ref('')
const engagementEndsAt = ref('')
const engagementHoursPerSession = ref(3.0)

const { loading: actionLoading, execute: executeAction } = useApi()
const { loading: listLoading, execute: executeFetch } = useApi()

const instructors = computed(() => usersStore.users.filter(u => u.role === 'instructor'))

async function fetchEngagementData() {
  if (!props.cohortId) return
  await executeFetch(async () => {
    await engagementsStore.fetchForCohort(props.cohortId)
    await usersStore.fetchAll({ role: 'instructor' })
    await labGroupsStore.fetchForCohort(props.cohortId)
    return { data: engagementsStore.engagements }
  })
}

watch(() => props.cohortId, (newId) => {
  if (newId) {
    fetchEngagementData()
    resetEngagementForm()
  }
}, { immediate: true })

async function handleCreateEngagement() {
  if (!props.cohortId) return
  await executeAction(async () => {
    const payload = {
      type: engagementType.value,
      instructor_id: engagementInstructorId.value,
      starts_at: engagementStartsAt.value,
      ends_at: engagementEndsAt.value,
      hours_per_session: Number(engagementHoursPerSession.value)
    }
    
    if (engagementType.value === 'lab') {
      payload.lab_group_id = engagementLabGroupId.value
    }

    const result = await engagementsStore.create(props.cohortId, payload)
    showToast('Engagement created successfully!', 'success')
    resetEngagementForm()
    return { data: result }
  })
}

function resetEngagementForm() {
  engagementType.value = 'lecture'
  engagementInstructorId.value = ''
  engagementLabGroupId.value = ''
  engagementStartsAt.value = ''
  engagementEndsAt.value = ''
  engagementHoursPerSession.value = 3.0
  showAddEngagementForm.value = false
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="font-headline-sm text-headline-sm">Instructor Engagements</h3>
      <button
        v-if="!showAddEngagementForm"
        @click="showAddEngagementForm = true"
        class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
      >
        <AppIcon name="add" /> Create Engagement
      </button>
    </div>

    <!-- Create Engagement Form -->
    <div v-if="showAddEngagementForm" class="bg-surface border border-outline-variant p-6 rounded-xl space-y-4 max-w-lg">
      <h4 class="font-title-md text-title-md">Schedule Engagement</h4>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Engagement Type</label>
          <select
            v-model="engagementType"
            class="w-full text-sm p-2.5 border border-outline-variant rounded-lg bg-surface"
          >
            <option value="lecture">Lecture</option>
            <option value="lab">Lab Group</option>
            <option value="business_session">Business Session</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Instructor</label>
          <select
            v-model="engagementInstructorId"
            class="w-full text-sm p-2.5 border border-outline-variant rounded-lg bg-surface"
          >
            <option value="" disabled>Select Instructor</option>
            <option v-for="inst in instructors" :key="inst.id" :value="inst.id">
              {{ inst.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Lab Group select, conditionally show lab_group_id only when type is 'lab' -->
      <div v-if="engagementType === 'lab'">
        <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Lab Group</label>
        <select
          v-model="engagementLabGroupId"
          class="w-full text-sm p-2.5 border border-outline-variant rounded-lg bg-surface"
        >
          <option value="" disabled>Select Lab Group</option>
          <option v-for="grp in labGroupsStore.labGroups" :key="grp.id" :value="grp.id">
            {{ grp.name }}
          </option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Start Date</label>
          <input
            v-model="engagementStartsAt"
            type="date"
            class="w-full text-sm p-2.5 border border-outline-variant rounded-lg bg-surface"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">End Date</label>
          <input
            v-model="engagementEndsAt"
            type="date"
            class="w-full text-sm p-2.5 border border-outline-variant rounded-lg bg-surface"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Hours Per Session</label>
        <input
          v-model="engagementHoursPerSession"
          type="number"
          step="0.5"
          class="w-full text-sm p-2.5 border border-outline-variant rounded-lg bg-surface"
        />
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button @click="resetEngagementForm" class="px-4 py-2 border border-outline text-secondary text-sm rounded-lg hover:bg-surface-container">Cancel</button>
        <button
          @click="handleCreateEngagement"
          :disabled="!engagementInstructorId || (engagementType === 'lab' && !engagementLabGroupId) || !engagementStartsAt || !engagementEndsAt || actionLoading"
          class="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark"
        >
          Save
        </button>
      </div>
    </div>

    <div v-if="listLoading" class="py-8 flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Engagement List -->
    <div v-else-if="engagementsStore.engagements.length === 0" class="py-8 text-center text-on-surface-variant text-sm">
      No engagements scheduled.
    </div>

    <div v-else class="overflow-hidden border border-outline-variant rounded-xl bg-surface">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-container border-b border-outline-variant text-xs font-semibold text-on-surface-variant">
            <th class="py-3 px-4">Type</th>
            <th class="py-3 px-4">Instructor</th>
            <th class="py-3 px-4">Lab Group</th>
            <th class="py-3 px-4">Dates</th>
            <th class="py-3 px-4">Hours</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <tr v-for="eng in engagementsStore.engagements" :key="eng.id" class="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
            <td class="py-3 px-4 capitalize font-semibold text-black">
              <StatusBadge
                :label="eng.type.replace('_', ' ')"
                :variant="eng.type === 'lab' ? 'success' : eng.type === 'lecture' ? 'info' : 'warning'"
                size="sm"
              />
            </td>
            <td class="py-3 px-4 text-on-surface-variant">{{ eng.instructor?.name || 'Unassigned' }}</td>
            <td class="py-3 px-4 text-on-surface-variant">{{ eng.lab_group?.name || 'N/A' }}</td>
            <td class="py-3 px-4 text-xs font-medium text-black">
              {{ eng.starts_at }} to {{ eng.ends_at }}
            </td>
            <td class="py-3 px-4 font-medium text-black">{{ eng.hours_per_session }} hrs</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
