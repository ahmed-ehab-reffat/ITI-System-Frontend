import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useLedgerStore = defineStore('ledger', {
  state: () => ({
    balance: null,
    history: [],
    loading: false,
    error: null,
  }),

  getters: {
    statusColor: (state) => {
      if (state.balance === null) return 'neutral'
      return state.balance >= 150 ? 'green' : 'red'
    },

    isAtRisk: (state) =>
      state.balance !== null && state.balance < 150,
  },

  actions: {
    /**
     * GET /students/{id}/ledger
     */
    async fetchForStudent(studentId) {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.get(
          `/students/${studentId}/ledger`
        )

        const payload = data.data ?? data

        this.balance = payload.balance
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
     * Silent refresh
     */
    async refresh(studentId) {
      try {
        const { data } = await api.get(
          `/students/${studentId}/ledger`
        )

        const payload = data.data ?? data

        this.balance = payload.balance
        this.history = payload.history ?? []

        return payload
      } catch (err) {
        this.error =
          err?.response?.data?.message ||
          'Failed to refresh ledger.'

        throw err
      }
    },

    clear() {
      this.balance = null
      this.history = []
      this.error = null
    },
  },
})