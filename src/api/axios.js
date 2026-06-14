import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

/**
 * Request Interceptor
 * Attaches the Bearer token from localStorage to every outgoing request.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => Promise.reject(error),
)

/**
 * Response Interceptor
 * Catches 401 Unauthorized responses, clears the session, and redirects to login.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Lazy imports to avoid circular dependency with router ↔ auth ↔ axios
      const { useAuthStore } = await import('@/stores/auth')
      const { default: router } = await import('@/router')
      const authStore = useAuthStore()

      authStore.logout()
      router.push({ name: 'login' })
    }

    return Promise.reject(error)
  },
)

export default api
