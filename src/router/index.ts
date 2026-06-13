import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Maps a user role string to its corresponding dashboard route name.
 * @param {string} role
 * @returns {string}
 */
type UserRole =
  | 'branch_manager'
  | 'track_admin'
  | 'instructor'
  | 'student'

function getDashboardRoute(role?: UserRole) {
  const dashboards: Record<UserRole, string> = {
    branch_manager: 'manager-dashboard',
    track_admin: 'manager-dashboard',
    instructor: 'instructor-dashboard',
    student: 'student-dashboard',
  }

  return role ? dashboards[role] : 'login'
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
   // meta: { requiresAuth: true, role: 'branch_manager' },
       meta: { guest: true },

  },
  {
    path: '/instructor/dashboard',
    name: 'instructor-dashboard',
    component: () => import('@/views/instructor/InstructorDashboard.vue'),
   // meta: { requiresAuth: true, role: 'instructor' },
       meta: { guest: true },

  },
  {
    path: '/student/dashboard',
    name: 'student-dashboard',
    component: () => import('@/views/student/StudentDashboard.vue'),
    //meta: { requiresAuth: true, role: 'student' },
    meta: { guest: true },
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

  // 1. Unauthenticated: Redirect to login if path requires auth
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login' }
  }

  // 2. Authenticated: Handle guest-only routes and role mismatches
  if (isAuthenticated) {
    const dashboard = getDashboardRoute(userRole)

    // A. If accessing a guest route (like /login), redirect to dashboard
    if (to.meta.guest) {
      if (to.name !== dashboard) {
        return { name: dashboard }
      }
    }

    // B. If accessing a route with a specific role requirement that doesn't match
    if (to.meta.requiresAuth && to.meta.role && to.meta.role !== userRole) {
      // CRITICAL: Only redirect if we aren't already at the target dashboard
      // This prevents infinite loops when multiple roles (e.g., track_admin) map to same dashboard
      if (to.name !== dashboard) {
        return { name: dashboard }
      }
    }
  }

  // 3. Allow navigation
})

export default router
export { getDashboardRoute }
