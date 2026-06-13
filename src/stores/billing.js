import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useBillingStore = defineStore('billing', () => {
  const billingRecords = ref([])
  const summary = ref(null)
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      const { data } = await api.get('/billing')
      // Handling both resource wrappers and direct arrays
      // Backend returns a plain array directly — data.data ?? data handles both wrapped and unwrapped
      billingRecords.value = Array.isArray(data) ? data : (data.records || data.data || [])
      summary.value = data.summary || null
      return data
    } finally {
      loading.value = false
    }
  }

  return { billingRecords, summary, loading, fetchAll }
})
