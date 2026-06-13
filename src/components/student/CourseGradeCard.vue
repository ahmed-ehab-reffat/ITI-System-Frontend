<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/shared/AppIcon.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'

const props = defineProps({
  course: {
    type: String,
    required: true,
  },
  score: {
    type: [Number, String],
    required: true,
  },
})

const numScore = computed(() => Number(props.score))
const formattedScore = computed(() => numScore.value.toFixed(2))
const isFailing = computed(() => numScore.value < 60)
</script>

<template>
  <div class="bg-surface border border-outline-variant rounded-xl p-6 flex flex-col justify-between h-32 transition-colors" :class="isFailing ? 'border-[#ba1a1a]/40 bg-[#ffdad6]/10' : 'hover:border-primary'">
    <div class="flex justify-between items-start">
      <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider truncate mr-2" :title="course">{{ course }}</span>
      <AppIcon name="school" class="text-on-surface-variant" :class="isFailing ? 'text-on-error-container' : ''" />
    </div>
    <div class="flex items-baseline gap-2">
      <span class="font-display-lg text-display-lg" :class="isFailing ? 'text-on-error-container' : 'text-on-surface'">
        {{ formattedScore }}
      </span>
      <StatusBadge v-if="isFailing" label="Failing" variant="error" size="sm" />
      <span v-else class="text-secondary font-body-sm">/ 100</span>
    </div>
  </div>
</template>
