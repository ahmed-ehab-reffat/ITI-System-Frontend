<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import AppIcon from '@/components/shared/AppIcon.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const isMobileMenuOpen = ref(false)

const navigation = computed(() => {
  const role = authStore.user?.role
  
  const links = []
  
  if (role === 'branch_manager') {
    links.push({ name: 'Dashboard', path: '/manager/dashboard', icon: 'dashboard' })
    links.push({ name: 'Announcements', path: '/announcements', icon: 'campaign' })
    links.push({ name: 'Billing', path: '/manager/billing', icon: 'payments' })
  }
  
  if (role === 'track_admin') {
    links.push({ name: 'Dashboard', path: '/admin', icon: 'dashboard' })
    links.push({ name: 'Setup', path: '/admin/setup', icon: 'settings' })
    links.push({ name: 'Students', path: '/admin/students', icon: 'group' })
    links.push({ name: 'Grades', path: '/admin/grades', icon: 'grade' })
    links.push({ name: 'Announcements', path: '/admin/announcements', icon: 'campaign' })
  }
  
  if (role === 'instructor') {
    links.push({ name: 'Dashboard', path: '/instructor/dashboard', icon: 'dashboard' })
    links.push({ name: 'Grades', path: '/instructor/grades', icon: 'grade' })
    links.push({ name: 'Attendance', path: '/instructor/qr/select', icon: 'fact_check' })
    links.push({ name: 'Announcements', path: '/announcements', icon: 'campaign' })
  }
  
  if (role === 'student') {
    links.push({ name: 'Dashboard', path: '/student/dashboard', icon: 'dashboard' })
    links.push({ name: 'Grades', path: '/student/grades', icon: 'grade' })
    links.push({ name: 'Submissions', path: '/student/submissions', icon: 'upload_file' })
    links.push({ name: 'Check In', path: '/student/checkin', icon: 'qr_code_scanner' })
    links.push({ name: 'Announcements', path: '/announcements', icon: 'campaign' })
  }

  return links
})

function handleLogout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-background flex">
    <!-- SideNavBar -->
    <nav 
      class="fixed md:flex flex-col top-0 left-0 h-full w-[240px] bg-surface border-r border-outline-variant z-40 transition-transform duration-200 ease-in-out pt-[64px]"
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    >
      <div class="px-6 py-6 border-b border-outline-variant">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
            <AppIcon name="domain" class="text-on-surface-variant" />
          </div>
          <div>
            <div class="font-medium text-sm text-black">ITI Portal</div>
            <div class="text-xs text-secondary mt-0.5">Academic Management</div>
          </div>
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors border-l-4"
          :class="route.path === item.path || route.path.startsWith(item.path) && item.path !== '#' ? 'bg-[#A9CFE0]/10 text-[#A9CFE0] border-[#A9CFE0] font-medium' : 'text-secondary border-transparent hover:bg-surface-container-high hover:text-black'"
        >
          <AppIcon :name="item.icon" :fill="route.path === item.path" />
          {{ item.name }}
        </router-link>
      </div>
      
      <div class="p-4 border-t border-outline-variant flex flex-col gap-1">
        <button
          @click="handleLogout"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors w-full text-left"
        >
          <AppIcon name="logout" />
          Logout
        </button>
      </div>
    </nav>

    <!-- Mobile menu overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      @click="isMobileMenuOpen = false"
      class="fixed inset-0 bg-black/50 z-30 md:hidden"
    ></div>

    <!-- TopNavBar -->
    <header class="fixed top-0 left-0 w-full h-[64px] flex justify-between items-center px-4 md:px-8 z-50 bg-surface border-b border-outline-variant md:pl-[calc(240px+32px)]">
      <div class="flex items-center gap-4">
        <button 
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="md:hidden p-2 text-secondary hover:bg-surface-container-high rounded-full"
        >
          <AppIcon name="menu" />
        </button>
        <div class="font-bold text-[#A9CFE0] text-xl">TrackIQ</div>
      </div>
      
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <div class="text-right hidden sm:block">
            <div class="text-sm font-medium text-black">{{ authStore.user?.name }}</div>
            <div class="text-xs text-secondary capitalize">{{ authStore.user?.role?.replace('_', ' ') }}</div>
          </div>
          <div class="w-8 h-8 rounded-full bg-[#A9CFE0] flex items-center justify-center text-white font-medium shadow-sm">
            {{ authStore.user?.name?.charAt(0).toUpperCase() || 'U' }}
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 md:ml-[240px] pt-[64px] min-h-screen">
      <div class="p-4 md:p-8 max-w-7xl mx-auto w-full">
        <slot />
      </div>
    </main>
  </div>
</template>
