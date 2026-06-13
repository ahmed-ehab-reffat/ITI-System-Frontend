<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppSidebar from '@/components/shared/AppSidebar.vue'
import ToastNotification from '@/components/shared/ToastNotification.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'

const auth = useAuthStore()
const route = useRoute()

const showSidebar = computed(() => {
  return auth.isLoggedIn && route.name !== 'login'
})
</script>

<template>
  <div class="flex h-screen bg-neutral-50 overflow-hidden font-sans">
    <!-- Sidebar -->
    <AppSidebar v-if="showSidebar" />

    <!-- Main Content -->
    <main 
      class="flex-1 flex flex-col min-w-0 overflow-hidden border-l border-neutral-200"
      :class="{ 'bg-white': !showSidebar }"
    >
      <div class="flex-1 overflow-y-auto">
        <RouterView />
      </div>
    </main>

    <!-- Global Components -->
    <ToastNotification />
    <ConfirmModal />
  </div>
</template>

<style>
/* Global styles if needed, though Tailwind 4 should handle most */
@import "tailwindcss";

:root {
  --primary: #345968;
  --secondary: #A9CFE0;
}

body {
  @apply antialiased text-neutral-900;
}
</style>
