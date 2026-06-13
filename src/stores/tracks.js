import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useTracksStore = defineStore('tracks', () => {
  const tracks = ref([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      const { data } = await api.get('/tracks')
      tracks.value = data.data
      return data.data
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    loading.value = true
    try {
      const { data } = await api.post('/tracks', payload)
      tracks.value.push(data)
      return data
    } finally {
      loading.value = false
    }
  }

  async function update(id, payload) {
    loading.value = true
    try {
      const { data } = await api.put(`/tracks/${id}`, payload)
      const index = tracks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tracks.value[index] = data
      }
      return data
    } finally {
      loading.value = false
    }
  }

  return {
    tracks,
    loading,
    fetchAll,
    create,
    update,
  }
})
