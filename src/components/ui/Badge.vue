<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
  // Optional explicit label override (defaults to a titleized status)
  label: {
    type: String,
    default: '',
  },
})

// Map domain statuses to visual styles.
// Attendance: present (green), absent (red), excused (yellow)
// Excuse requests: requested/pending (yellow), approved (green), rejected (red)
const styleMap = {
  present: 'bg-green-100 text-green-700',
  approved: 'bg-green-100 text-green-700',
  checked_in: 'bg-green-100 text-green-700',
  checked_out: 'bg-green-100 text-green-700',

  absent: 'bg-red-100 text-red-700',
  rejected: 'bg-red-100 text-red-700',

  excused: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-yellow-100 text-yellow-700',
  requested: 'bg-yellow-100 text-yellow-700',

  default: 'bg-neutral-100 text-neutral-700',
}

const classes = computed(() => styleMap[props.status] || styleMap.default)

const text = computed(() => {
  if (props.label) return props.label
  return props.status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
    :class="classes"
  >
    {{ text }}
  </span>
</template>