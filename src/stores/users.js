import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useUsersStore = defineStore('users', () => {
  const users = ref([])
  const loading = ref(false)
  const errors = ref(null)

  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    from: 0,
    to: 0,
  })

  async function fetchAll(params = {}) {
    loading.value = true
    try {
      const { data } = await api.get('/users', { params })
      users.value = data.data
      if (data.meta) {
        pagination.value = {
          currentPage: data.meta.current_page,
          lastPage: data.meta.last_page,
          total: data.meta.total,
          from: data.meta.from,
          to: data.meta.to,
        }
      }
      return data.data
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    loading.value = true
    errors.value = null
    try {
      const { data } = await api.post('/users', payload)
      const user = data.data || data
      users.value.push(user)
      return user
    } catch (e) {
      errors.value = e.response?.data?.errors
      throw e
    } finally {
      loading.value = false
    }
  }

  async function update(id, payload) {
    loading.value = true
    try {
      const { data } = await api.put(`/users/${id}`, payload)
      const user = data.data || data
      const i = users.value.findIndex(u => u.id === id)
      if (i !== -1) users.value[i] = user
      return user
    } finally {
      loading.value = false
    }
  }

  async function deactivate(id) {
    loading.value = true
    try {
      await api.delete(`/users/${id}`)
      users.value = users.value.filter(u => u.id !== id)
    } finally {
      loading.value = false
    }
  }

  return { users, loading, errors, pagination, fetchAll, create, update, deactivate }
})
