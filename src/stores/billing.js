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
      const records = Array.isArray(data) ? data : (data.records || data.data || [])
      billingRecords.value = records

      const internal = records.filter(r => r.type === 'internal')
      const external = records.filter(r => r.type === 'external')

      summary.value = {
        total_due: records.reduce((sum, r) => sum + (Number(r.total_due) || 0), 0),
        internal_count: internal.length,
        internal_due: internal.reduce((sum, r) => sum + (Number(r.total_due) || 0), 0),
        external_count: external.length,
        external_due: external.reduce((sum, r) => sum + (Number(r.total_due) || 0), 0),
      }
      
      return data
    } finally {
      loading.value = false
    }
  }

  return { billingRecords, summary, loading, fetchAll }
})
