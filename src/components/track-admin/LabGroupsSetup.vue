<script setup>
import { ref, computed, watch } from 'vue'
import AppIcon from '@/components/shared/AppIcon.vue'
import { useToast } from '@/composables/useToast'
import { useApi } from '@/composables/useApi'
import { useLabGroupsStore } from '@/stores/labGroups'
import { useUsersStore } from '@/stores/users'

const props = defineProps({
  cohortId: {
    type: [String, Number],
    required: true
  }
})

const labGroupsStore = useLabGroupsStore()
const usersStore = useUsersStore()
const { show: showToast } = useToast()

const showAddGroupForm = ref(false)
const groupName = ref('')
const showAssignModal = ref(false)
const selectedGroupForAssign = ref(null)
const selectedStudentIds = ref([])
const studentSearchQuery = ref('')

const { loading: actionLoading, execute: executeAction } = useApi()
const { loading: listLoading, execute: executeFetch } = useApi()

const filteredStudents = computed(() => {
  const query = studentSearchQuery.value.toLowerCase()
  return usersStore.users.filter(user => 
    user.role === 'student' && 
    (user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query))
  )
})

async function fetchGroupsAndStudents() {
  if (!props.cohortId) return
  await executeFetch(async () => {
    await labGroupsStore.fetchForCohort(props.cohortId)
    await usersStore.fetchAll({ role: 'student' })
    return { data: labGroupsStore.labGroups }
  })
}

watch(() => props.cohortId, (newId) => {
  if (newId) {
    fetchGroupsAndStudents()
    showAddGroupForm.value = false
    showAssignModal.value = false
  }
}, { immediate: true })

async function handleCreateGroup() {
  if (!groupName.value || !props.cohortId) return
  await executeAction(async () => {
    const result = await labGroupsStore.create(props.cohortId, { name: groupName.value })
    showToast('Lab group created!', 'success')
    groupName.value = ''
    showAddGroupForm.value = false
    return { data: result }
  })
}

function openAssignModal(group) {
  selectedGroupForAssign.value = group
  selectedStudentIds.value = group.students?.map(s => s.id) || []
  showAssignModal.value = true
}

async function handleAssignStudents() {
  if (!selectedGroupForAssign.value || !props.cohortId) return
  await executeAction(async () => {
    const result = await labGroupsStore.assignStudents(
      props.cohortId,
      selectedGroupForAssign.value.id,
      selectedStudentIds.value
    )
    showToast('Students assigned successfully!', 'success')
    showAssignModal.value = false
    return { data: result }
  })
}

async function handleRemoveStudent(group, studentId) {
  if (!confirm('Remove student from this lab group?') || !props.cohortId) return
  await executeAction(async () => {
    const result = await labGroupsStore.removeStudent(props.cohortId, group.id, studentId)
    showToast('Student removed from group', 'success')
    return { data: result }
  })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="font-headline-sm text-headline-sm">Lab Groups</h3>
      <button
        v-if="!showAddGroupForm"
        @click="showAddGroupForm = true"
        class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
      >
        <AppIcon name="add" /> Create Group
      </button>
    </div>

    <!-- Add Group Form -->
    <div v-if="showAddGroupForm" class="bg-surface border border-outline-variant p-6 rounded-xl space-y-4 max-w-sm">
      <h4 class="font-title-md text-title-md">Create Group</h4>
      <div class="space-y-2">
        <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Group Name</label>
        <input
          v-model="groupName"
          type="text"
          placeholder="e.g. Group A"
          class="w-full text-sm p-2.5 border border-outline-variant rounded-lg bg-surface"
        />
      </div>
      <div class="flex justify-end gap-2 pt-2">
        <button @click="showAddGroupForm = false" class="px-4 py-2 border border-outline text-secondary text-sm rounded-lg hover:bg-surface-container">Cancel</button>
        <button
          @click="handleCreateGroup"
          :disabled="!groupName || actionLoading"
          class="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark disabled:opacity-50"
        >
          Create
        </button>
      </div>
    </div>

    <div v-if="listLoading" class="py-8 flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Lab Group List Cards -->
    <div v-else-if="labGroupsStore.labGroups.length === 0" class="py-8 text-center text-on-surface-variant text-sm">
      No lab groups created. Create one to begin group assignment.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="group in labGroupsStore.labGroups"
        :key="group.id"
        class="bg-surface border border-outline-variant rounded-xl p-6 flex flex-col justify-between"
      >
        <div>
          <div class="flex justify-between items-start mb-4">
            <div>
              <h4 class="font-headline-sm text-lg text-black">{{ group.name }}</h4>
              <span class="text-xs text-on-surface-variant">{{ group.students?.length || 0 }} Students assigned</span>
            </div>
            <button
              @click="openAssignModal(group)"
              class="flex items-center gap-1.5 px-3 py-1.5 border border-outline hover:border-primary text-sm font-medium rounded-lg"
            >
              <AppIcon name="person_add" :size="16" /> Manage Students
            </button>
          </div>

          <!-- Students Roster for Group -->
          <div v-if="!group.students || group.students.length === 0" class="text-xs text-on-surface-variant py-4 italic">
            No students in this group.
          </div>
          <div v-else class="max-h-48 overflow-y-auto space-y-2 mt-2 pr-2">
            <div
              v-for="student in group.students"
              :key="student.id"
              class="flex justify-between items-center text-sm p-2 bg-surface-container-low border border-outline-variant rounded-lg"
            >
              <span class="font-medium text-black">{{ student.name }}</span>
              <button
                @click="handleRemoveStudent(group, student.id)"
                class="text-[#ba1a1a] hover:bg-[#ffdad6] p-1 rounded"
                title="Remove student"
              >
                <AppIcon name="close" :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Students Modal -->
    <div v-if="showAssignModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-surface border border-outline-variant rounded-xl max-w-md w-full p-6 space-y-4">
        <div class="flex justify-between items-center">
          <h4 class="font-headline-sm text-headline-sm">Assign Students: {{ selectedGroupForAssign?.name }}</h4>
          <button @click="showAssignModal = false" class="text-secondary hover:text-black">
            <AppIcon name="close" />
          </button>
        </div>

        <!-- Search -->
        <div>
          <input
            v-model="studentSearchQuery"
            type="text"
            placeholder="Search students..."
            class="w-full text-sm p-2 border border-outline-variant rounded-lg bg-surface"
          />
        </div>

        <!-- Student Checklist -->
        <div class="max-h-60 overflow-y-auto border border-outline-variant rounded-lg p-2 space-y-2">
          <div v-if="filteredStudents.length === 0" class="text-sm text-on-surface-variant p-4 text-center">
            No students found.
          </div>
          <label
            v-for="std in filteredStudents"
            :key="std.id"
            class="flex items-center gap-3 p-2 hover:bg-surface-container rounded-lg cursor-pointer text-sm"
          >
            <input
              type="checkbox"
              :value="std.id"
              v-model="selectedStudentIds"
              class="text-primary rounded focus:ring-primary h-4 w-4"
            />
            <div>
              <div class="font-medium text-black">{{ std.name }}</div>
              <div class="text-xs text-on-surface-variant">{{ std.email }}</div>
            </div>
          </label>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 pt-2">
          <button @click="showAssignModal = false" class="px-4 py-2 border border-outline text-secondary text-sm rounded-lg hover:bg-surface-container">Cancel</button>
          <button
            @click="handleAssignStudents"
            :disabled="actionLoading"
            class="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark"
          >
            Save Assignment
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
