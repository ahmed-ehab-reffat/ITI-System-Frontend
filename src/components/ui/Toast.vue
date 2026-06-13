<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'info', // success | error | warning | info
  },
})

defineEmits(['close'])

const classes = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-50 text-green-800 border-green-200'
    case 'error':
      return 'bg-red-50 text-red-800 border-red-200'
    case 'warning':
      return 'bg-yellow-50 text-yellow-800 border-yellow-200'
    case 'info':
    default:
      return 'bg-blue-50 text-blue-800 border-blue-200'
  }
})

const iconColor = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-400'
    case 'error':
      return 'text-red-400'
    case 'warning':
      return 'text-yellow-400'
    case 'info':
    default:
      return 'text-blue-400'
  }
})
</script>

<template>
  <div
    class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-sm border pointer-events-auto min-w-[300px] max-w-md"
    :class="classes"
  >
    <div :class="iconColor" class="flex-shrink-0">
      <slot name="icon">
        <!-- Default icons based on type could go here if using a library -->
      </slot>
    </div>
    
    <p class="text-sm font-medium flex-1">
      {{ message }}
    </p>

    <button
      @click="$emit('close')"
      class="p-1 rounded-full hover:bg-black/5 transition-colors text-neutral-400 hover:text-neutral-600"
    >
      <span class="sr-only">Close</span>
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
