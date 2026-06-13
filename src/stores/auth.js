import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useAuthStore = defineStore('auth', () => {
  /**
   * State
   * Initialized from localStorage to persist the session across page refreshes.
   */
  const token = ref(localStorage.getItem('auth_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))

  /**
   * Getters
   */
  const isLoggedIn = computed(() => !!token.value)
  const isManager = computed(() => user.value?.role === 'branch_manager')
  const isTrackAdmin = computed(() => user.value?.role === 'track_admin')
  const isInstructor = computed(() => user.value?.role === 'instructor')
  const isStudent = computed(() => user.value?.role === 'student')

  /**
   * Actions
   */

  /**
   * Authenticates the user with the given credentials.
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<object>} The authenticated user object.
   */
  async function login(credentials) {
    const response = await api.post('/auth/login', credentials)

    const { token: newToken, user: newUser } = response.data

    // Update reactive state
    token.value = newToken
    user.value = newUser

    // Persist to localStorage
    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(newUser))

    return newUser
  }

  /**
   * Clears the authenticated session from state and localStorage.
   */
  function logout() {
    token.value = null
    user.value = null

    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  return {
    // State
    user,
    token,

    // Getters
    isLoggedIn,
    isManager,
    isTrackAdmin,
    isInstructor,
    isStudent,

    // Actions
    login,
    logout,
  }
})
