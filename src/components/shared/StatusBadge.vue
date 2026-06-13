<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: 'neutral',
    validator: (value) => ['success', 'error', 'warning', 'info', 'neutral'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md'].includes(value),
  }
})

const variantClasses = computed(() => {
  const map = {
    success: 'bg-[#A9CFE0]/20 text-[#345968]', // Using primary colors for success based on design
    error: 'bg-error-container text-on-error-container',
    warning: 'bg-[#f0bc98]/30 text-[#724c30]',
    info: 'bg-secondary-container text-on-secondary-container',
    neutral: 'bg-surface-container-high text-on-surface-variant',
  }
  return map[props.variant]
})

const sizeClasses = computed(() => {
  if (props.size === 'sm') {
    return 'px-2 py-0.5 text-xs'
  }
  return 'px-2.5 py-1 text-sm'
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full font-medium"
    :class="[variantClasses, sizeClasses]"
  >
    {{ label }}
  </span>
</template>
