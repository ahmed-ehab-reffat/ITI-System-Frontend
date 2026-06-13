import { defineStore } from 'pinia'
import api from '@/api/axios'


export const MAX_ATTACHMENT_BYTES = 1 * 1024 * 1024 // 1MB
export const ALLOWED_ATTACHMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
]

export const useExcuseRequestsStore = defineStore('excuseRequests', {
  state: () => ({
    requests: [],
    loading: false,
    error: null,
  }),

  getters: {
    pending: (state) => state.requests.filter((r) => r.status === 'requested'),
    approved: (state) => state.requests.filter((r) => r.status === 'approved'),
    rejected: (state) => state.requests.filter((r) => r.status === 'rejected'),
  },

  actions: {
  
    async fetchAll(status = null) {
      this.loading = true
      this.error = null
      try {
        const params = status ? { status } : {}
        const { data } = await api.get('/excuse-requests', { params })
        this.requests = data.data ?? data
        return this.requests
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load excuse requests.'
        throw err
      } finally {
        this.loading = false
      }
    },

  
    async fetchMine() {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get('/excuse-requests')
        this.requests = data.data ?? data
        return this.requests
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load your excuse requests.'
        throw err
      } finally {
        this.loading = false
      }
    },


    async submit(payload) {
      this.error = null
      try {
        const formData = new FormData()
        formData.append('attendance_record_id', payload.attendance_record_id)
        formData.append('reason', payload.reason)
        if (payload.attachment) {
          formData.append('attachment', payload.attachment)
        }

        const { data } = await api.post('/excuse-requests', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        const created = data.data ?? data
        this.requests.unshift(created)
        return created
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to submit excuse request.'
        throw err
      }
    },

    async approve(requestId, note) {
      this.error = null
      try {
        const { data } = await api.patch(`/excuse-requests/${requestId}/approve`, { note })
        const updated = data.data ?? data

        const index = this.requests.findIndex((r) => r.id === requestId)
        if (index !== -1) this.requests[index] = updated

        return updated
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to approve excuse request.'
        throw err
      }
    },

    async reject(requestId, note) {
      this.error = null
      try {
        const { data } = await api.patch(`/excuse-requests/${requestId}/reject`, { note })
        const updated = data.data ?? data

        const index = this.requests.findIndex((r) => r.id === requestId)
        if (index !== -1) this.requests[index] = updated

        return updated
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to reject excuse request.'
        throw err
      }
    },
  },
})

export function validateAttachment(file) {
  if (!file) return null

  if (file.size > MAX_ATTACHMENT_BYTES) {
    return 'File is too large. Maximum size is 1MB.'
  }

  if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
    return 'Invalid file type. Only PDF or image files (JPG, PNG, WEBP) are allowed.'
  }

  return null
}