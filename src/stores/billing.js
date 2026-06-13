import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useBillingStore = defineStore('billing', () => {
  const records = ref([])
  const summary = ref(null)
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      const { data } = await api.get('/billing')
      records.value = data.records
      summary.value = data.summary
      return data
    } finally {
      loading.value = false
    }
  }

  return {
    records,
    summary,
    loading,
    fetchAll,
  }
})
