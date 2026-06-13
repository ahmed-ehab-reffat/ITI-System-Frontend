<script setup>
import { computed, ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppSidebar from '@/components/shared/AppSidebar.vue'
import AppIcon from '@/components/shared/AppIcon.vue'
import ToastNotification from '@/components/shared/ToastNotification.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'

const auth = useAuthStore()
const route = useRoute()

const isMobileMenuOpen = ref(false)

// Only show the app shell (sidebar + topbar) when authenticated and not on login page
const showShell = computed(() => auth.isLoggedIn && route.name !== 'login')
</script>

<template>
  <div class="flex h-screen bg-background overflow-hidden font-sans">

    <!-- ── Sidebar (desktop) ─────────────────────────────── -->
    <AppSidebar v-if="showShell" class="hidden md:flex" />

    <!-- ── Mobile Overlay ───────────────────────────────── -->
    <div
      v-if="showShell && isMobileMenuOpen"
      class="fixed inset-0 bg-black/50 z-30 md:hidden"
      @click="isMobileMenuOpen = false"
    />

    <!-- ── Mobile Sidebar ───────────────────────────────── -->
    <div
      v-if="showShell"
      class="fixed top-0 left-0 h-full z-40 md:hidden transition-transform duration-200"
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <AppSidebar />
    </div>

    <!-- ── Right Side: topbar + content ─────────────────── -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">

      <!-- Topbar -->
      <header
        v-if="showShell"
        class="h-[64px] flex items-center justify-between px-4 md:px-6 border-b border-outline-variant bg-surface flex-shrink-0 z-20"
      >
        <!-- Mobile menu toggle -->
        <button
          class="md:hidden p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <AppIcon name="menu" />
        </button>

        <div class="font-bold text-[#A9CFE0] text-xl">TrackIQ</div>

        <!-- User chip -->
        <div v-if="auth.user" class="flex items-center gap-2">
          <div class="text-right hidden sm:block">
            <div class="text-sm font-medium text-on-surface">{{ auth.user.name }}</div>
            <div class="text-xs text-on-surface-variant capitalize">{{ auth.user.role?.replace('_', ' ') }}</div>
          </div>
          <div class="w-8 h-8 rounded-full bg-[#A9CFE0] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
            {{ auth.user.name?.charAt(0).toUpperCase() || 'U' }}
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto">
        <RouterView />
      </main>
    </div>

    <!-- ── Global Components ─────────────────────────────── -->
    <ToastNotification />
    <ConfirmModal />
  </div>
</template>

<style>
@import "tailwindcss";

:root {
  --primary: #345968;
  --secondary: #A9CFE0;
}

body {
  @apply antialiased text-neutral-900;
}
</style>
