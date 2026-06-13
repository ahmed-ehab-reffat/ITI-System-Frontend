import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useUsersStore = defineStore('users', () => {
  const users = ref([])
  const loading = ref(false)
  const errors = ref(null)

  async function fetchAll(params = {}) {
    loading.value = true
    try {
      const { data } = await api.get('/users', { params })
      users.value = data.data
      return data.data
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    errors.value = null
    try {
      const { data } = await api.post('/users', payload)
      users.value.push(data)
      return data
    } catch (e) {
      errors.value = e.response?.data?.errors
      throw e
    }
  }

  async function update(id, payload) {
    const { data } = await api.put(`/users/${id}`, payload)
    const i = users.value.findIndex(u => u.id === id)
    if (i !== -1) users.value[i] = data
    return data
  }

  async function deactivate(id) {
    await api.delete(`/users/${id}`)
    users.value = users.value.filter(u => u.id !== id)
  }

  return { users, loading, errors, fetchAll, create, update, deactivate }
})
