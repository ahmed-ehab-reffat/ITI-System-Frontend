import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useEngagementsStore = defineStore('engagements', () => {
  const engagements = ref([])
  const loading = ref(false)

  async function fetchForCohort(cohortId, params = {}) {
    loading.value = true
    try {
      const { data } = await api.get(`/cohorts/${cohortId}/engagements`, { params })
      engagements.value = data.data
      return data.data
    } finally {
      loading.value = false
    }
  }

  async function create(cohortId, payload) {
    loading.value = true
    try {
      const { data } = await api.post(`/cohorts/${cohortId}/engagements`, payload)
      engagements.value.push(data)
      return data
    } finally {
      loading.value = false
    }
  }

  async function update(cohortId, engagementId, payload) {
    loading.value = true
    try {
      const { data } = await api.put(`/cohorts/${cohortId}/engagements/${engagementId}`, payload)
      const index = engagements.value.findIndex(e => e.id === engagementId)
      if (index !== -1) {
        engagements.value[index] = data
      }
      return data
    } finally {
      loading.value = false
    }
  }

  async function destroy(cohortId, engagementId) {
    loading.value = true
    try {
      const { data } = await api.delete(`/cohorts/${cohortId}/engagements/${engagementId}`)
      engagements.value = engagements.value.filter(e => e.id !== engagementId)
      return data
    } finally {
      loading.value = false
    }
  }

  return {
    engagements,
    loading,
    fetchForCohort,
    create,
    update,
    destroy
  }
})
