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
 
    async fetchForSession(sessionId) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get(`/sessions/${sessionId}/attendance`)
        this.sessionRecords = data.data ?? data
        return this.sessionRecords
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load attendance for this session.'
        throw err
      } finally {
        this.loading = false
      }
    },

  
    async recordAttendance(sessionId, payload) {
      this.error = null
      try {
        console.log('ATTENDANCE PAYLOAD:', payload)
        const { data } = await api.post(`/sessions/${sessionId}/attendance`, payload)
        const record = data.data ?? data

        const index = this.sessionRecords.findIndex((r) => r.student_id === record.student_id)
        if (index !== -1) {
          this.sessionRecords[index] = record
        } else {
          this.sessionRecords.push(record)
        }

        return record
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to record attendance.'
        throw err
      }
    },

    async updateRecord(sessionId, recordId, payload) {
      this.error = null
      try {
        const { data } = await api.patch(
          `/sessions/${sessionId}/attendance/${recordId}`,
          payload
        )
        const record = data.data ?? data

        const index = this.sessionRecords.findIndex((r) => r.id === recordId)
        if (index !== -1) this.sessionRecords[index] = record

        return record
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to update attendance record.'
        throw err
      }
    },


    async fetchForStudent(studentId) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get(`/students/${studentId}/attendance`)
        this.studentRecords = data.data ?? data
        return this.studentRecords
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load attendance history.'
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})