<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppIcon from './AppIcon.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const navLinks = computed(() => {
  const role = auth.user?.role

  if (role === 'branch_manager') {
    return [
      { name: 'Dashboard',      icon: 'dashboard', to: '/manager/dashboard' },
      { name: 'Users',          icon: 'group',     to: '/manager/users' },
      { name: 'Cohorts',        icon: 'school',    to: '/manager/cohorts' },
      { name: 'Tracks',         icon: 'category',  to: '/manager/tracks' },
      { name: 'Announcements',  icon: 'campaign',  to: '/announcements' },
      { name: 'Billing',        icon: 'payments',  to: '/manager/billing' },
    ]
  }

  if (role === 'track_admin') {
    return [
      { name: 'Dashboard',     icon: 'dashboard',       to: '/admin' },
      { name: 'Setup',         icon: 'settings',        to: '/admin/setup' },
      { name: 'Students',      icon: 'group',           to: '/admin/students' },
      { name: 'Grades',        icon: 'grade',           to: '/admin/grades' },
      { name: 'Attendance',    icon: 'fact_check',      to: '/admin/attendance' },
     { name: 'Excuses',       icon: 'rule',            to: '/admin/excuses' },
      { name: 'Announcements', icon: 'campaign',        to: '/admin/announcements' },
    ]
  }

  if (role === 'instructor') {
    return [
      { name: 'Dashboard',     icon: 'dashboard',   to: '/instructor/dashboard' },
      { name: 'Grades',        icon: 'grade',       to: '/instructor/grades' },
      { name: 'Attendance',    icon: 'fact_check',  to: '/instructor/attendance' },
     { name: 'QR Attendence',    icon: 'qr_code_scanner',  to: '/instructor/qr/select' },
      { name: 'Announcements', icon: 'campaign',    to: '/announcements' },
    ]
  }

  if (role === 'student') {
    return [
      { name: 'Dashboard',     icon: 'dashboard',        to: '/student/dashboard' },
      {
      name: 'Attendance',
      icon: 'fact_check',
      to: '/student/attendance',
    },

    {
      name: 'Excuse Requests',
      icon: 'assignment',
      to: '/student/excuses',
    },

      { name: 'Grades',        icon: 'grade',            to: '/student/grades' },
      { name: 'Submissions',   icon: 'upload_file',      to: '/student/submissions' },
      { name: 'Check In',      icon: 'qr_code_scanner',  to: '/student/checkin' },
      { name: 'Announcements', icon: 'campaign',         to: '/announcements' },
    ]
  }

  return []
})

function handleLogout() {
  auth.logout()
  router.push('/login')
}

const isActive = (path) => route.path === path || (route.path.startsWith(path) && path !== '/announcements')
</script>

<template>
  <aside class="flex h-screen w-[240px] flex-col border-r border-outline-variant bg-surface flex-shrink-0">
    <!-- Logo -->
    <div class="px-6 py-5 border-b border-outline-variant flex items-center gap-3">
      <div class="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
        <AppIcon name="domain" class="text-on-surface-variant" />
      </div>
      <div>
        <div class="font-medium text-sm text-on-surface">ITI Portal</div>
        <div class="text-xs text-secondary mt-0.5">Academic Management</div>
      </div>
    </div>

    <!-- Nav Links -->
    <nav class="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
      <router-link
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors border-l-4"
        :class="isActive(link.to)
          ? 'bg-[#A9CFE0]/10 text-[#345968] border-[#A9CFE0] font-medium'
          : 'text-on-surface-variant border-transparent hover:bg-surface-container-high hover:text-on-surface'"
      >
        <AppIcon :name="link.icon" :fill="isActive(link.to)" :size="20" />
        {{ link.name }}
      </router-link>
    </nav>

    <!-- User + Logout -->
    <div class="border-t border-outline-variant p-4">
      <div v-if="auth.user" class="mb-3 px-1 flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-[#A9CFE0] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          {{ auth.user.name?.charAt(0).toUpperCase() || 'U' }}
        </div>
        <div class="min-w-0">
          <p class="text-sm font-medium text-on-surface truncate">{{ auth.user.name }}</p>
          <p class="text-xs text-on-surface-variant capitalize truncate">{{ auth.user.role?.replace('_', ' ') }}</p>
        </div>
      </div>
      <button
        @click="handleLogout"
        class="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-[#ba1a1a] rounded-lg hover:bg-[#ffdad6] transition-colors"
      >
        <AppIcon name="logout" :size="20" />
        Logout
      </button>
    </div>
  </aside>
</template>
