import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useSubmissionsStore = defineStore('submissions', {
  state: () => ({
    studentSubmissions: [],
    sessionSubmissions: [],
    loading: false,
    error: null,
  }),

  actions: {
     // GET /students/{id}/submissions
     
    async fetchForStudent(studentId) {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.get(
          `/students/${studentId}/submissions`
        )

        this.studentSubmissions = data.data ?? data

        return this.studentSubmissions
      } catch (err) {
        this.error =
          err?.response?.data?.message ||
          'Failed to load submissions.'

        throw err
      } finally {
        this.loading = false
      }
    },

     // GET /sessions/{id}/submissions
     
    async fetchForSession(sessionId) {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.get(
          `/sessions/${sessionId}/submissions`
        )

        this.sessionSubmissions = data.data ?? data

        return this.sessionSubmissions
      } catch (err) {
        this.error =
          err?.response?.data?.message ||
          'Failed to load session submissions.'

        throw err
      } finally {
        this.loading = false
      }
    },

     // POST /sessions/{id}/submissions
     
    async submit(sessionId, payload) {
      this.error = null

      try {
        const formData = new FormData()

        if (payload.url) {
          formData.append('url', payload.url)
        }

        if (payload.file) {
          formData.append('file', payload.file)
        }

        const { data } = await api.post(
          `/sessions/${sessionId}/submissions`,
          formData,
          {
            headers: {
              // by default, axios will set the content type to application/json
              'Content-Type': undefined
            }
          }
        )

        const created = data.data ?? data

        const index = this.studentSubmissions.findIndex(
          (s) => s.session_id === sessionId
        )

        if (index !== -1) {
          this.studentSubmissions[index] = created
        } else {
          this.studentSubmissions.push(created)
        }

        return created
      } catch (err) {
        this.error =
          err?.response?.data?.message ||
          'Failed to submit work.'

        throw err
      }
    },

     // PATCH /sessions/{id}/submissions/{submissionId}/grade
     
    async gradeSubmission(sessionId, submissionId, payload) {
      this.error = null

      try {
        const { data } = await api.patch(
          `/sessions/${sessionId}/submissions/${submissionId}/grade`,
          payload
        )

        const updated = data.data ?? data

        const index = this.sessionSubmissions.findIndex(
          (s) => s.id === submissionId
        )

        if (index !== -1) {
          this.sessionSubmissions[index] = updated
        }

        return updated
      } catch (err) {
        this.error =
          err?.response?.data?.message ||
          'Failed to save submission grade.'

        throw err
      }
    },

    clear() {
      this.studentSubmissions = []
      this.sessionSubmissions = []
      this.error = null
    },
  },
})
