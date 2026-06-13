import { defineStore } from 'pinia'
import api from '@/api/axios'

export const MAX_ATTACHMENT_BYTES = 1024 * 1024

export const ALLOWED_ATTACHMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
]

export const useExcuseRequestsStore = defineStore(
  'excuseRequests',
  {
    state: () => ({
      requests: [],
      loading: false,
      error: null,
    }),

    getters: {
      pending: (state) =>
        state.requests.filter(
          (r) => r.status === 'requested'
        ),

      approved: (state) =>
        state.requests.filter(
          (r) => r.status === 'approved'
        ),

      rejected: (state) =>
        state.requests.filter(
          (r) => r.status === 'rejected'
        ),
    },

    actions: {
      /**
       * POST /excuse-requests
       *
       * Backend:
       * - validates ownership
       * - validates attachment
       * - returns 422 on failure
       */
      async submit(payload) {
        this.error = null

        try {
          const formData = new FormData()

          formData.append(
            'attendance_record_id',
            payload.attendance_record_id
          )

          formData.append(
            'reason',
            payload.reason
          )

          if (payload.attachment) {
            formData.append(
              'attachment',
              payload.attachment
            )
          }

          const { data } = await api.post(
            '/excuse-requests',
            formData,
            {
              headers: {
                'Content-Type':
                  'multipart/form-data',
              },
            }
          )

          const created = data.data ?? data

          this.requests.unshift(created)

          return created
        } catch (err) {
          if (err?.response?.status === 422) {
            this.error =
              err?.response?.data?.message ||
              'Invalid excuse request.'
          } else {
            this.error =
              err?.response?.data?.message ||
              'Failed to submit excuse request.'
          }

          throw err
        }
      },

      /**
       * PATCH /excuse-requests/{id}/approve
       *
       * ledger +20
       * status -> excused
       * returns 409 if already reviewed
       */
      async approve(requestId, note) {
        this.error = null

        try {
          const { data } = await api.patch(
            `/excuse-requests/${requestId}/approve`,
            { note }
          )

          const updated = data.data ?? data

          const index =
            this.requests.findIndex(
              (r) => r.id === requestId
            )

          if (index !== -1) {
            this.requests[index] = updated
          }

          return updated
        } catch (err) {
          if (err?.response?.status === 409) {
            this.error =
              'This request has already been reviewed.'
          } else {
            this.error =
              err?.response?.data?.message ||
              'Failed to approve request.'
          }

          throw err
        }
      },

      /**
       * PATCH /excuse-requests/{id}/reject
       *
       * ledger unchanged
       * status -> rejected
       */
      async reject(requestId, note) {
        this.error = null

        try {
          const { data } = await api.patch(
            `/excuse-requests/${requestId}/reject`,
            { note }
          )

          const updated = data.data ?? data

          const index =
            this.requests.findIndex(
              (r) => r.id === requestId
            )

          if (index !== -1) {
            this.requests[index] = updated
          }

          return updated
        } catch (err) {
          this.error =
            err?.response?.data?.message ||
            'Failed to reject request.'

          throw err
        }
      },

      clear() {
        this.requests = []
        this.error = null
      },
    },
  }
)

/**
 * Client-side validation
 */
export function validateAttachment(file) {
  if (!file) return null

  if (file.size > MAX_ATTACHMENT_BYTES) {
    return 'File exceeds 1MB.'
  }

  if (
    !ALLOWED_ATTACHMENT_TYPES.includes(
      file.type
    )
  ) {
    return 'Only PDF, JPG, PNG, WEBP allowed.'
  }

  return null
}