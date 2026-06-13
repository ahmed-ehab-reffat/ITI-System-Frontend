<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
  fill: {
    type: Boolean,
    default: false,
  },
  size: {
    type: [String, Number],
    default: 24,
  },
})
</script>

<template>
  <span
    class="material-symbols-outlined select-none"
    :class="{ filled: fill }"
    :style="{ fontSize: `${size}px` }"
  >
    {{ name }}
  </span>
</template>
