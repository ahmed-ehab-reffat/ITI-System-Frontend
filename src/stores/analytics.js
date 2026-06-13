import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useAnalyticsStore = defineStore('analytics', () => {
  const branchData = ref(null)
  const cohortData = ref(null)
  const atRiskStudents = ref([])
  const loading = ref(false)

  async function fetchBranch() {
    loading.value = true
    try {
      const { data } = await api.get('/analytics/branch')
      branchData.value = data
      return data
    } finally {
      loading.value = false
    }
  }

  async function fetchCohort(cohortId) {
    loading.value = true
    try {
      const { data } = await api.get(`/analytics/cohorts/${cohortId}`)
      cohortData.value = data
      return data
    } finally {
      loading.value = false
    }
  }

  async function fetchAtRisk(cohortId) {
    loading.value = true
    try {
      const { data } = await api.get('/analytics/at-risk', { params: { cohort_id: cohortId } })
      // Notice: backend returns { data: [...] } for at-risk
      atRiskStudents.value = data.data || []
      return data.data || []
    } finally {
      loading.value = false
    }
  }

  return {
    branchData,
    cohortData,
    atRiskStudents,
    loading,
    fetchBranch,
    fetchCohort,
    fetchAtRisk
  }
})
