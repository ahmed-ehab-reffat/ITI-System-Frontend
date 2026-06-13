import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useCoursesStore = defineStore('courses', () => {
  const courses = ref([])
  const loading = ref(false)

  async function fetchForCohort(cohortId) {
    loading.value = true
    try {
      const { data } = await api.get(`/cohorts/${cohortId}/courses`)
      courses.value = data.data
      return data.data
    } finally {
      loading.value = false
    }
  }

  async function create(cohortId, payload) {
    loading.value = true
    try {
      const { data } = await api.post(`/cohorts/${cohortId}/courses`, payload)
      courses.value.push(data)
      return data
    } finally {
      loading.value = false
    }
  }

  async function update(cohortId, courseId, payload) {
    loading.value = true
    try {
      const { data } = await api.put(`/cohorts/${cohortId}/courses/${courseId}`, payload)
      const index = courses.value.findIndex(c => c.id === courseId)
      if (index !== -1) {
        courses.value[index] = data
      }
      return data
    } finally {
      loading.value = false
    }
  }

  async function destroy(cohortId, courseId) {
    loading.value = true
    try {
      const { data } = await api.delete(`/cohorts/${cohortId}/courses/${courseId}`)
      courses.value = courses.value.filter(c => c.id !== courseId)
      return data
    } finally {
      loading.value = false
    }
  }

  return {
    courses,
    loading,
    fetchForCohort,
    create,
    update,
    destroy
  }
})
