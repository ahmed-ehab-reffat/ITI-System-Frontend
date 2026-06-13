import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useTagsStore = defineStore('tags', () => {
  const tags = ref([])
  const loading = ref(false)

  async function fetchForStudent(studentId) {
    loading.value = true
    try {
      const { data } = await api.get(`/students/${studentId}/tags`)
      tags.value = data.data
      return data.data
    } finally {
      loading.value = false
    }
  }

  async function addTag(studentId, payload) {
    loading.value = true
    try {
      const { data } = await api.post(`/students/${studentId}/tags`, payload)
      tags.value.push(data)
      return data
    } finally {
      loading.value = false
    }
  }

  async function deleteTag(studentId, tagId) {
    loading.value = true
    try {
      const { data } = await api.delete(`/students/${studentId}/tags/${tagId}`)
      tags.value = tags.value.filter(t => t.id !== tagId)
      return data
    } finally {
      loading.value = false
    }
  }

  return {
    tags,
    loading,
    fetchForStudent,
    addTag,
    deleteTag
  }
})
