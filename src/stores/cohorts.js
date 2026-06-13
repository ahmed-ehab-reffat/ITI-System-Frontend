import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useCohortsStore = defineStore('cohorts', () => {
  const cohorts = ref([])
  const currentCohort = ref(null)
  const loading = ref(false)

  async function fetchAll(params = {}) {
    loading.value = true
    try {
      const { data } = await api.get('/cohorts', { params })
      cohorts.value = data.data
      return data.data
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    loading.value = true
    try {
      const { data } = await api.get(`/cohorts/${id}`)
      currentCohort.value = data
      return data
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    loading.value = true
    try {
      const { data } = await api.post('/cohorts', payload)
      cohorts.value.push(data)
      return data
    } finally {
      loading.value = false
    }
  }

  async function update(id, payload) {
    loading.value = true
    try {
      const { data } = await api.put(`/cohorts/${id}`, payload)
      const index = cohorts.value.findIndex(c => c.id === id)
      if (index !== -1) {
        cohorts.value[index] = data
      }
      if (currentCohort.value && currentCohort.value.id === id) {
        currentCohort.value = data
      }
      return data
    } finally {
      loading.value = false
    }
  }

  return {
    cohorts,
    currentCohort,
    loading,
    fetchAll,
    fetchOne,
    create,
    update
  }
})
