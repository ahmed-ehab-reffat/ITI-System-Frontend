import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useAnnouncementsStore = defineStore('announcements', () => {
  const announcements = ref([])
  const loading = ref(false)

  async function fetchForCohort(cohortId) {
    loading.value = true
    try {
      const { data } = await api.get(`/cohorts/${cohortId}/announcements`)
      announcements.value = data.data
      return data.data
    } finally {
      loading.value = false
    }
  }

  async function create(cohortId, payload) {
    loading.value = true
    try {
      const { data } = await api.post(`/cohorts/${cohortId}/announcements`, payload)
      announcements.value.unshift(data)
      return data
    } finally {
      loading.value = false
    }
  }

  async function update(cohortId, announcementId, payload) {
    loading.value = true
    try {
      const { data } = await api.put(`/cohorts/${cohortId}/announcements/${announcementId}`, payload)
      const index = announcements.value.findIndex(a => a.id === announcementId)
      if (index !== -1) {
        announcements.value[index] = data
      }
      return data
    } finally {
      loading.value = false
    }
  }

  async function destroy(cohortId, announcementId) {
    loading.value = true
    try {
      const { data } = await api.delete(`/cohorts/${cohortId}/announcements/${announcementId}`)
      announcements.value = announcements.value.filter(a => a.id !== announcementId)
      return data
    } finally {
      loading.value = false
    }
  }

  return {
    announcements,
    loading,
    fetchForCohort,
    create,
    update,
    destroy
  }
})
