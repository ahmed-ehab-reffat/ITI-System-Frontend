<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppIcon from './AppIcon.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const navLinks = computed(() => {
  const links = []

  if (auth.isManager) {
    links.push(
      { name: 'Dashboard', icon: 'dashboard', to: '/manager/dashboard' },
      { name: 'Users', icon: 'group', to: '/manager/users' },
      { name: 'Cohorts', icon: 'school', to: '/manager/cohorts' },
      { name: 'Tracks', icon: 'category', to: '/manager/tracks' },
      { name: 'Billing', icon: 'payments', to: '/manager/billing' }
    )
  }

  if (auth.isTrackAdmin) {
    links.push(
      { name: 'Dashboard', icon: 'dashboard', to: '/admin' },
      { name: 'Setup', icon: 'settings', to: '/admin/setup' },
      { name: 'Students', icon: 'group', to: '/admin/students' },
      { name: 'Attendance', icon: 'event_available', to: '/admin/attendance' },
      { name: 'Excuses', icon: 'description', to: '/admin/excuses' },
      { name: 'Grades', icon: 'grade', to: '/admin/grades' }
    )
  }

  if (auth.isInstructor) {
    links.push(
      { name: 'Dashboard', icon: 'dashboard', to: '/instructor/dashboard' },
      { name: 'Attendance', icon: 'event_available', to: '/instructor/attendance' },
      { name: 'Grades', icon: 'grade', to: '/instructor/grades' }
    )
  }

  if (auth.isStudent) {
    links.push(
      { name: 'Dashboard', icon: 'dashboard', to: '/student/dashboard' },
      { name: 'Attendance', icon: 'event_available', to: '/student/attendance' },
      { name: 'Submissions', icon: 'upload_file', to: '/student/submissions' },
      { name: 'Grades', icon: 'grade', to: '/student/grades' },
      { name: 'Excuses', icon: 'description', to: '/student/excuses' }
    )
  }

  // Everyone gets announcements (unless it's already in the list for specific roles)
  if (!links.some(l => l.name === 'Announcements')) {
    links.push({ name: 'Announcements', icon: 'campaign', to: '/announcements' })
  }

  return links
})

function handleLogout() {
  auth.logout()
  router.push('/login')
}

const isActive = (path) => route.path === path
</script>

<template>
  <aside class="flex h-screen w-64 flex-col border-r border-neutral-200 bg-white">
    <div class="flex h-16 items-center border-b border-neutral-200 px-6">
      <span class="text-xl font-bold text-secondary-600">ITI System</span>
    </div>

    <nav class="flex-1 overflow-y-auto space-y-1 p-4">
      <router-link
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors"
        :class="[
          isActive(link.to)
            ? 'bg-secondary-50 text-secondary-700'
            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
        ]"
      >
        <AppIcon :name="link.icon" :size="20" />
        {{ link.name }}
      </router-link>
    </nav>

    <div class="border-t border-neutral-200 p-4">
      <div v-if="auth.user" class="mb-4 px-3">
        <p class="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          {{ auth.user.role.replace('_', ' ') }}
        </p>
        <p class="text-sm font-medium text-neutral-900 truncate">
          {{ auth.user.name || auth.user.email }}
        </p>
      </div>

      <button
        @click="handleLogout"
        class="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
      >
        <AppIcon name="logout" :size="20" />
        Logout
      </button>
    </div>
  </aside>
</template>
