import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useCohortsStore = defineStore('cohorts', () => {
  const cohorts = ref([])
  const currentCohort = ref(null)
  const loading = ref(false)

  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    from: 0,
    to: 0,
  })

  async function fetchAll(params = {}) {
    loading.value = true
    try {
      const { data } = await api.get('/cohorts', { params })
      cohorts.value = data.data
      if (data.meta) {
        pagination.value = {
          currentPage: data.meta.current_page,
          lastPage: data.meta.last_page,
          total: data.meta.total,
          from: data.meta.from,
          to: data.meta.to,
        }
      }
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
      const cohort = data.data || data
      cohorts.value.push(cohort)
      return cohort
    } finally {
      loading.value = false
    }
  }

  async function update(id, payload) {
    loading.value = true
    try {
      const { data } = await api.put(`/cohorts/${id}`, payload)
      const cohort = data.data || data
      const index = cohorts.value.findIndex(c => c.id === id)
      if (index !== -1) cohorts.value[index] = cohort
      if (currentCohort.value?.id === id) currentCohort.value = cohort
      return cohort
    } finally {
      loading.value = false
    }
  }

  async function remove(id) {
    loading.value = true
    try {
      await api.delete(`/cohorts/${id}`)
      cohorts.value = cohorts.value.filter(c => c.id !== id)
    } finally {
      loading.value = false
    }
  }

  return {
    cohorts,
    currentCohort,
    loading,
    pagination,
    fetchAll,
    fetchOne,
    create,
    update,
    remove,
  }
})
