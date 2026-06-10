import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Maps a user role string to its corresponding dashboard route name.
 * @param {string} role
 * @returns {string}
 */
function getDashboardRoute(role) {
  const dashboards = {
    manager: 'manager-dashboard',
    instructor: 'instructor-dashboard',
    student: 'student-dashboard',
  }

  return dashboards[role] || 'login'
}

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/manager/dashboard',
    name: 'manager-dashboard',
    component: () => import('@/views/manager/ManagerDashboard.vue'),
    meta: { requiresAuth: true, role: 'manager' },
  },
  {
    path: '/instructor/dashboard',
    name: 'instructor-dashboard',
    component: () => import('@/views/instructor/InstructorDashboard.vue'),
    meta: { requiresAuth: true, role: 'instructor' },
  },
  {
    path: '/student/dashboard',
    name: 'student-dashboard',
    component: () => import('@/views/student/StudentDashboard.vue'),
    meta: { requiresAuth: true, role: 'student' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

/**
 * Global Navigation Guard
 * Enforces authentication and role-based access control.
 */
router.beforeEach((to) => {
  const authStore = useAuthStore()

  const isAuthenticated = authStore.isLoggedIn
  const userRole = authStore.user?.role

  // 1. Route requires auth but user is not logged in → redirect to login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login' }
  }

  // 2. Logged-in user tries to visit a guest-only route (e.g. /login) → redirect to their dashboard
  if (to.meta.guest && isAuthenticated) {
    return { name: getDashboardRoute(userRole) }
  }

  // 3. Logged-in user accesses a route whose role doesn't match → redirect to correct dashboard
  if (to.meta.requiresAuth && to.meta.role && to.meta.role !== userRole) {
    return { name: getDashboardRoute(userRole) }
  }

  // 4. All checks passed — allow navigation
})

export default router
export { getDashboardRoute }
