import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()

  const user = computed(() => authStore.user)
  const role = computed(() => authStore.user?.role)
  const isAuthenticated = computed(() => authStore.isLoggedIn)
  const login = (credentials) => authStore.login(credentials)
  const logout = () => authStore.logout()
  const hasRole = (...roles) => roles.includes(authStore.user?.role)

  return {
    user,
    role,
    isAuthenticated,
    login,
    logout,
    hasRole,
  }
}