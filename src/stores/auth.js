import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useAuthStore = defineStore('auth', () => {

  const token = ref(localStorage.getItem('auth_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))

  /**
   * Getters
   */
  const isLoggedIn = computed(() => !!token.value)

  const role = computed(() => user.value?.role)

  const isManager = computed(() => user.value?.role === 'branch_manager')
  const isTrackAdmin = computed(() => user.value?.role === 'track_admin')
  const isInstructor = computed(() => user.value?.role === 'instructor')
  const isStudent = computed(() => user.value?.role === 'student')

  /**
   * Actions
   */

  async function login(credentials) {
    const response = await api.post('/auth/login', credentials)

    const { token: newToken, user: newUser } = response.data

    token.value = newToken
    user.value = newUser

    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(newUser))

    return newUser
  }

  function logout() {
    token.value = null
    user.value = null

    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  return {
    // state
    user,
    token,

    // getters
    isLoggedIn,
    role,
    isManager,
    isTrackAdmin,
    isInstructor,
    isStudent,

    // actions
    login,
    logout,
  }
})