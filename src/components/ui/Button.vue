<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary', // primary | secondary | outline | inverted | danger | ghost
  },
  size: {
    type: String,
    default: 'md', // sm | md | lg
  },
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['click'])

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
}

const variants = {
  primary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
  secondary: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 focus:ring-neutral-400',
  outline:
    'bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-50 focus:ring-neutral-400',
  inverted: 'bg-neutral-800 text-white hover:bg-neutral-900 focus:ring-neutral-600',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-400',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[base, sizes[size], variants[variant]]"
    @click="$emit('click', $event)"
  >
    <svg
      v-if="loading"
      class="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
    <slot />
  </button>
</template>