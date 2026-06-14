import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useSessionsStore = defineStore('sessions', {
  state: () => ({
    sessions: [],
    loading: false,
    error: null,
  }),

  actions: {
    /**
     * @param {string} cohortId
     * @param {{ instructorId?: string }} options
     */
    async fetchForCohort(cohortId, { instructorId = null } = {}) {
      this.loading = true
      this.error = null
      try {
        const params = instructorId ? { instructor_id: instructorId } : {}
        const { data: engRes } = await api.get(`/cohorts/${cohortId}/engagements`, { params })
        const engagements = engRes.data ?? engRes

        const sessionLists = await Promise.all(
          engagements.map(async (engagement) => {
            const { data: sessRes } = await api.get(`/engagements/${engagement.id}/sessions`)
            const sessions = sessRes.data ?? sessRes
           
            return sessions.map((s) => ({ ...s, engagement }))
          })
        )

        this.sessions = sessionLists
          .flat()
          .sort((a, b) => new Date(a.session_date) - new Date(b.session_date))

        return this.sessions
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load cohort sessions.'
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Create a session under an engagement.
     */
    async create(engagementId, payload) {
      this.error = null
      try {
        const { data } = await api.post(`/engagements/${engagementId}/sessions`, payload)
        const created = data.data ?? data
        this.sessions.push(created)
        return created
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to create session.'
        throw err
      }
    },

    async deliver(sessionId) {
      this.error = null
      try {
        const { data } = await api.patch(`/sessions/${sessionId}/deliver`)
        const updated = data.data ?? data

        const index = this.sessions.findIndex((s) => s.id === sessionId)
        if (index !== -1) {
          this.sessions[index] = { ...this.sessions[index], ...updated }
        }

        return updated
      } catch (err) {
        if (err.response?.status === 422) {
          this.error = 'This session was already delivered.'
        } else {
          this.error = err.response?.data?.message || 'Failed to mark session as delivered.'
        }
        throw err
      }
    },

    clear() {
      this.sessions = []
      this.error = null
    },
  },
})