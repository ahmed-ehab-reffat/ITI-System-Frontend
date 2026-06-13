<script setup>
import { ref, onMounted, watch } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import AppIcon from '@/components/shared/AppIcon.vue'
import StudentDetailPanel from '@/components/track-admin/StudentDetailPanel.vue'
import { useApi } from '@/composables/useApi'
import { useCohortsStore } from '@/stores/cohorts'
import { useUsersStore } from '@/stores/users'
import api from '@/api/axios'

const cohortsStore = useCohortsStore()
const usersStore = useUsersStore()

const selectedCohortId = ref(null)
const selectedStudent = ref(null)
const studentLedger = ref(null)

const { loading: cohortsLoading, execute: executeFetchCohorts } = useApi()
const { loading: studentsLoading, execute: executeFetchStudents } = useApi()
const { loading: ledgerLoading, execute: executeFetchLedger } = useApi()

// Fetch all cohorts on mount
onMounted(async () => {
  await executeFetchCohorts(async () => {
    const list = await cohortsStore.fetchAll()
    if (list && list.length > 0) {
      selectedCohortId.value = list[0].id
    }
    return { data: list }
  })
})

// Load students on cohort select
async function loadStudents(cohortId) {
  if (!cohortId) return
  await executeFetchStudents(async () => {
    const result = await usersStore.fetchAll({ role: 'student' })
    return { data: result }
  })
}

watch(selectedCohortId, (newId) => {
  if (newId) {
    loadStudents(newId)
    selectedStudent.value = null
    studentLedger.value = null
  }
})

// Open student side panel and load ledger info
async function selectStudent(student) {
  selectedStudent.value = student
  studentLedger.value = null
  
  await executeFetchLedger(async () => {
    const response = await api.get(`/students/${student.id}/ledger`)
    studentLedger.value = response.data
    return response
  })
}

function closePanel() {
  selectedStudent.value = null
  studentLedger.value = null
}
</script>

<template>
  <MainLayout>
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="font-display-lg text-display-lg text-on-background">Student Roster</h1>
        <p class="font-body-md text-body-md text-on-surface-variant mt-2">
          View students enrolled in the cohort. Click on a student to see their details, attendance ledger, and tags.
        </p>
      </div>

      <!-- Cohort Selector -->
      <div v-if="cohortsStore.cohorts.length > 0" class="flex items-center gap-2">
        <label for="cohort-select" class="text-sm font-medium text-secondary whitespace-nowrap">Cohort:</label>
        <select
          id="cohort-select"
          v-model="selectedCohortId"
          class="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-[200px]"
        >
          <option v-for="cohort in cohortsStore.cohorts" :key="cohort.id" :value="cohort.id">
            {{ cohort.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Main Layout Grid (with or without side-panel) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Student List Table (Col Span changes dynamically when side panel is open) -->
      <div :class="selectedStudent ? 'lg:col-span-7' : 'lg:col-span-12'" class="transition-all duration-300">
        <div v-if="cohortsLoading || studentsLoading" class="py-12 flex justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="usersStore.users.length === 0" class="bg-surface border border-outline-variant p-8 rounded-xl text-center text-on-surface-variant">
          No students found in this cohort.
        </div>

        <div v-else class="overflow-hidden border border-outline-variant rounded-xl bg-surface shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container border-b border-outline-variant text-xs font-semibold text-on-surface-variant">
                <th class="py-3 px-4">Name</th>
                <th class="py-3 px-4">Email</th>
                <th class="py-3 px-4">Expires At</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              <tr 
                v-for="student in usersStore.users.filter(u => u.role === 'student')" 
                :key="student.id" 
                @click="selectStudent(student)"
                class="border-b border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer"
                :class="selectedStudent?.id === student.id ? 'bg-[#A9CFE0]/10 border-l-4 border-l-primary' : ''"
              >
                <td class="py-3 px-4 font-semibold text-black">{{ student.name }}</td>
                <td class="py-3 px-4 text-on-surface-variant">{{ student.email }}</td>
                <td class="py-3 px-4 text-xs font-medium text-black">
                  {{ student.expires_at ? new Date(student.expires_at).toLocaleDateString() : 'N/A' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Student Detail Side Panel -->
      <StudentDetailPanel
        v-if="selectedStudent"
        class="lg:col-span-5"
        :student="selectedStudent"
        :student-ledger="studentLedger"
        :ledger-loading="ledgerLoading"
        @close="closePanel"
      />

    </div>
  </MainLayout>
</template>
