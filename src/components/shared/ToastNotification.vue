<script setup>
import { useToast } from '@/composables/useToast'
import AppIcon from './AppIcon.vue'

const { toasts, remove } = useToast()

function getIcon(type) {
  switch (type) {
    case 'success':
      return 'check_circle'
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    default:
      return 'info'
  }
}

function getClasses(type) {
  switch (type) {
    case 'success':
      return 'bg-[#A9CFE0] text-[#345968] border-[#A9CFE0]'
    case 'error':
      return 'bg-error-container text-on-error-container border-error-container'
    case 'warning':
      return 'bg-[#f0bc98] text-[#724c30] border-[#f0bc98]'
    default:
      return 'bg-surface-container-highest text-on-surface border-outline-variant'
  }
}
</script>

<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-md border min-w-[300px] max-w-md transition-all duration-300"
        :class="getClasses(toast.type)"
      >
        <AppIcon :name="getIcon(toast.type)" :fill="true" />
        <p class="font-body-sm text-body-sm flex-1">{{ toast.message }}</p>
        <button
          @click="remove(toast.id)"
          class="p-1 rounded-full hover:bg-black/10 transition-colors"
        >
          <AppIcon name="close" :size="18" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
