import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    sessionRecords: [],
    studentRecords: [],

    loading: false,
    error: null,
  }),

  getters: {
    sessionRecordsByStudent: (state) => {
      const map = {}

      for (const record of state.sessionRecords) {
        map[record.student_id] = record
      }

      return map
    },
  },

  actions: {
    /**
     * Load attendance roster for a session
     * GET /sessions/{id}/attendance
     */
    async fetchForSession(sessionId) {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.get(
          `/sessions/${sessionId}/attendance`
        )

        this.sessionRecords = data.data ?? data

        return this.sessionRecords
      } catch (err) {
        this.error =
          err?.response?.data?.message ||
          'Failed to load attendance.'

        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * POST /sessions/{id}/attendance
     *
     * present → no ledger deduction
     * absent → backend deducts 25
     */
    async recordAttendance(sessionId, payload) {
      this.error = null

      try {
        const { data } = await api.post(
          `/sessions/${sessionId}/attendance`,
          payload
        )

        const record = data.data ?? data

        const index = this.sessionRecords.findIndex(
          (r) => r.student_id === record.student_id
        )

        if (index !== -1) {
          this.sessionRecords[index] = record
        } else {
          this.sessionRecords.push(record)
        }

        return record
      } catch (err) {
        this.error =
          err?.response?.data?.message ||
          'Failed to record attendance.'

        throw err
      }
    },

    /**
     * PATCH /sessions/{sessionId}/attendance/{recordId}
     *
     * absent → present → refund 25
     * absent → excused → refund 20
     */
    async updateRecord(sessionId, recordId, payload) {
      this.error = null

      try {
        const { data } = await api.patch(
          `/sessions/${sessionId}/attendance/${recordId}`,
          payload
        )

        const updated = data.data ?? data

        const index = this.sessionRecords.findIndex(
          (r) => r.id === recordId
        )

        if (index !== -1) {
          this.sessionRecords[index] = updated
        }

        return updated
      } catch (err) {
        this.error =
          err?.response?.data?.message ||
          'Failed to update attendance.'

        throw err
      }
    },

    /**
     * GET /students/{id}/attendance
     *
     * Backend enforces:
     * - student → own history only
     * - instructor / track admin → scoped access
     */
    async fetchForStudent(studentId) {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.get(
          `/students/${studentId}/attendance`
        )

        this.studentRecords = data.data ?? data

        return this.studentRecords
      } catch (err) {
        this.error =
          err?.response?.data?.message ||
          'Failed to load attendance history.'

        throw err
      } finally {
        this.loading = false
      }
    },

    clear() {
      this.sessionRecords = []
      this.studentRecords = []
      this.error = null
    },
  },
})