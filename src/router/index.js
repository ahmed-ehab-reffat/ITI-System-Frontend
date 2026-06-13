import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Maps a user role string to its corresponding dashboard route name.
 * @param {string} role
 * @returns {string}
 */
function getDashboardRoute(role) {
  const dashboards = {
    branch_manager: 'manager-dashboard',
    track_admin: 'admin-dashboard',
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
    component: () => import('@/views/branch-manager/DashboardView.vue'),
    meta: { requiresAuth: true, role: 'branch_manager' },
  },
  {
    path: '/manager/users',
    name: 'manager-users',
    component: () => import('@/views/branch-manager/UsersView.vue'),
    meta: { requiresAuth: true, role: 'branch_manager' },
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('@/views/track-admin/DashboardView.vue'),
    meta: { requiresAuth: true, role: 'track_admin' },
  },
  {
    path: '/admin/setup',
    name: 'admin-setup',
    component: () => import('@/views/track-admin/CohortSetupView.vue'),
    meta: { requiresAuth: true, role: 'track_admin' },
  },
  {
    path: '/admin/students',
    name: 'admin-students',
    component: () => import('@/views/track-admin/StudentsView.vue'),
    meta: { requiresAuth: true, role: 'track_admin' },
  },
  {
    path: '/admin/announcements',
    name: 'admin-announcements',
    component: () => import('@/views/track-admin/AnnouncementsView.vue'),
    meta: { requiresAuth: true, role: 'track_admin' },
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
  // Announcements
  {
    path: '/announcements',
    name: 'announcements',
    component: () => import('@/views/shared/AnnouncementsView.vue'),
    meta: { requiresAuth: true },
  },
  // QR
  {
    path: '/instructor/qr/:sessionId',
    name: 'qr-generate',
    component: () => import('@/views/instructor/QrGenerateView.vue'),
    meta: { requiresAuth: true, role: 'instructor' },
  },
  {
    path: '/student/checkin',
    name: 'qr-scan',
    component: () => import('@/views/student/QrScanView.vue'),
    meta: { requiresAuth: true, role: 'student' },
  },
  // Billing
  {
    path: '/manager/billing',
    name: 'billing',
    component: () => import('@/views/manager/BillingView.vue'),
    meta: { requiresAuth: true, role: 'branch_manager' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: () => {
      const authStore = useAuthStore()
      if (authStore.isLoggedIn) {
        return { name: getDashboardRoute(authStore.user?.role) }
      }
      return { name: 'login' }
    }
  }
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
      // Allow track_admin to access branch_manager dashboard layout
      if (userRole === 'track_admin' && to.name === 'manager-dashboard') {
        return
      }
      
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
