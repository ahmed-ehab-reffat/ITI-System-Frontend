import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useLedgerStore = defineStore('ledger', {
  state: () => ({
    balance: 0,
    history: [],
    loading: false,
    error: null,
  }),

  getters: {
    statusColor: (state) => {
      if (state.balance === null || state.balance === undefined) return 'neutral'
      return state.balance >= 150 ? 'green' : 'red'
    },

    isAtRisk: (state) =>
      state.balance !== null &&
      state.balance !== undefined &&
      state.balance < 150,
  },

  actions: {
    /**
     * GET /api/students/{id}/ledger
     */
    async fetchForStudent(studentId) {
      if (!studentId) {
        this.error = 'Missing student id'
        return
      }

      this.loading = true
      this.error = null

      try {
        const { data } = await api.get(`/students/${studentId}/ledger`)
        const payload = data.data ?? data

        this.balance =
          payload.total_balance ??
          payload.balance ??
          0

        this.history = payload.history ?? []

        return payload
      } catch (err) {
        this.error =
          err?.response?.data?.message ||
          'Failed to load attendance ledger.'

        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Refresh ledger without resetting loading UI heavily
     */
    async refresh(studentId) {
      if (!studentId) return

      try {
        const { data } = await api.get(`/students/${studentId}/ledger`)
        const payload = data.data ?? data

        this.balance =
          payload.total_balance ??
          payload.balance ??
          0

        this.history = payload.history ?? []

        return payload
      } catch (err) {
        this.error =
          err?.response?.data?.message ||
          'Failed to refresh ledger.'

        throw err
      }
    },

    /**
     * Reset store (logout / switch user)
     */
    clear() {
      this.balance = 0
      this.history = []
      this.loading = false
      this.error = null
    },
  },
})