import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useLabGroupsStore = defineStore('labGroups', () => {
  const labGroups = ref([])
  const loading = ref(false)

  async function fetchForCohort(cohortId) {
    loading.value = true
    try {
      const { data } = await api.get(`/cohorts/${cohortId}/lab-groups`)
      labGroups.value = data.data
      return data.data
    } finally {
      loading.value = false
    }
  }

  async function create(cohortId, payload) {
    loading.value = true
    try {
      const { data } = await api.post(`/cohorts/${cohortId}/lab-groups`, payload)
      // Make sure students is initialized if empty
      if (!data.students) data.students = []
      labGroups.value.push(data)
      return data
    } finally {
      loading.value = false
    }
  }

  async function assignStudents(cohortId, labGroupId, studentIds) {
    loading.value = true
    try {
      const { data } = await api.post(`/lab-groups/${labGroupId}/students`, {
        student_ids: studentIds
      })
      // Refresh lab groups after assignment
      await fetchForCohort(cohortId)
      return data
    } finally {
      loading.value = false
    }
  }

  async function removeStudent(cohortId, labGroupId, studentId) {
    loading.value = true
    try {
      const { data } = await api.delete(`/lab-groups/${labGroupId}/students/${studentId}`)

      // Local update to avoid full reload
      const group = labGroups.value.find(g => g.id === labGroupId)
      if (group && group.students) {
        group.students = group.students.filter(s => s.id !== studentId)
      }
      return data
    } finally {
      loading.value = false
    }
  }

  return {
    labGroups,
    loading,
    fetchForCohort,
    create,
    assignStudents,
    removeStudent
  }
})
