import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useAnnouncementsStore = defineStore('announcements', () => {
  const announcements = ref([])
  const loading = ref(false)

  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    from: 0,
    to: 0,
  })

  /**
   * GET /cohorts/{cohortId}/announcements
   */
  async function fetchForCohort(cohortId, page = 1) {
    loading.value = true
    try {
      const { data } = await api.get(`/cohorts/${cohortId}/announcements`, { params: { page } })
      // Handle both wrapped { data: [...] } and plain [...] responses
      announcements.value = data.data ?? data
      if (data.meta) {
        pagination.value = {
          currentPage: data.meta.current_page,
          lastPage: data.meta.last_page,
          total: data.meta.total,
          from: data.meta.from,
          to: data.meta.to,
        }
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * POST /cohorts/{cohortId}/announcements
   */
  async function create(cohortId, payload) {
    loading.value = true
    try {
      const { data } = await api.post(`/cohorts/${cohortId}/announcements`, payload)
      const newAnnouncement = data.data ?? data
      announcements.value.unshift(newAnnouncement)
      return newAnnouncement
    } finally {
      loading.value = false
    }
  }

  /**
   * PUT /announcements/{id}
   * Note: shallow resource — cohortId is NOT needed for update.
   */
  async function update(announcementId, payload) {
    loading.value = true
    try {
      const { data } = await api.put(`/announcements/${announcementId}`, payload)
      const updatedAnnouncement = data.data ?? data
      const index = announcements.value.findIndex(a => a.id === announcementId)
      if (index !== -1) {
        announcements.value[index] = updatedAnnouncement
      }
      return updatedAnnouncement
    } finally {
      loading.value = false
    }
  }

  /**
   * DELETE /announcements/{id}
   * Note: shallow resource — cohortId is NOT needed for destroy.
   */
  async function destroy(announcementId) {
    loading.value = true
    try {
      await api.delete(`/announcements/${announcementId}`)
      announcements.value = announcements.value.filter(a => a.id !== announcementId)
    } finally {
      loading.value = false
    }
  }

  return {
    announcements,
    loading,
    pagination,
    fetchForCohort,
    create,
    update,
    destroy,
  }
})
