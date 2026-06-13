<script setup>
import AppIcon from './AppIcon.vue'
import StatusBadge from './StatusBadge.vue'

defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  badge: {
    type: String,
    default: null,
  },
  badgeVariant: {
    type: String,
    default: 'neutral',
  },
  icon: {
    type: String,
    default: null,
  },
})
</script>

<template>
  <div class="bg-surface border border-outline-variant rounded-xl p-6 flex flex-col justify-between h-32 hover:border-primary transition-colors">
    <div class="flex justify-between items-start">
      <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{{ label }}</span>
      <AppIcon v-if="icon" :name="icon" class="text-on-surface-variant" />
    </div>
    <div class="flex items-baseline gap-2">
      <span class="font-display-lg text-display-lg text-on-surface">{{ value }}</span>
      <StatusBadge v-if="badge" :label="badge" :variant="badgeVariant" />
    </div>
  </div>
</template>
