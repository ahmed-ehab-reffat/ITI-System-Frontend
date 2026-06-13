import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useSessionsStore = defineStore('sessions', {
  state: () => ({
    sessions: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchForCohort(cohortId, params = {}) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get('/sessions', {
          params: { cohort_id: cohortId, ...params },
        })
        this.sessions = data.data ?? data
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
        const payload = data.data ?? data
        const updatedSession = payload.session ?? payload

        const index = this.sessions.findIndex((s) => s.id === sessionId)
        if (index !== -1) {
          this.sessions[index] = { ...this.sessions[index], ...updatedSession }
        }

        return payload
      } catch (err) {
        if (err.response?.status === 409) {
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