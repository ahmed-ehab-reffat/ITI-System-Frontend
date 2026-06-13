<script setup>
import { computed } from 'vue'

const props = defineProps({
  tag: {
    type: Object,
    required: true,
  }
})

const variantClass = computed(() => {
  if (props.tag.tag_type === 'predefined') {
    switch (props.tag.tag_value.toLowerCase()) {
      case 'cheating':
        return 'bg-error-container text-on-error-container'
      case 'uses ai':
        return 'bg-[#f0bc98]/30 text-[#724c30]'
      case 'loves extra work':
        return 'bg-[#A9CFE0]/20 text-[#345968]'
      default:
        return 'bg-surface-container-high text-on-surface-variant'
    }
  } else {
    // Free text
    return 'bg-surface-container-high text-on-surface'
  }
})
</script>

<template>
  <span 
    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-transparent whitespace-nowrap"
    :class="variantClass"
    :title="tag.note || tag.tag_value"
  >
    <span v-if="tag.tag_type === 'free_text'" class="mr-1 opacity-60">#</span>
    {{ tag.tag_value }}
  </span>
</template>
