import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useTracksStore = defineStore('tracks', () => {
  const tracks = ref([])
  const loading = ref(false)

  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    from: 0,
    to: 0,
  })

  async function fetchAll(page = 1) {
    loading.value = true
    try {
      const { data } = await api.get('/tracks', { params: { page } })
      tracks.value = data.data
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
    try {
      const { data } = await api.post('/tracks', payload)
      const track = data.data || data
      tracks.value.push(track)
      return track
    } finally {
      loading.value = false
    }
  }

  async function update(id, payload) {
    loading.value = true
    try {
      const { data } = await api.put(`/tracks/${id}`, payload)
      const track = data.data || data
      const index = tracks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tracks.value[index] = track
      }
      return track
    } finally {
      loading.value = false
    }
  }

  async function destroy(id) {
    loading.value = true
    try {
      await api.delete(`/tracks/${id}`)
      tracks.value = tracks.value.filter(t => t.id !== id)
    } finally {
      loading.value = false
    }
  }

  return {
    tracks,
    loading,
    pagination,
    fetchAll,
    create,
    update,
    destroy,
  }
})
