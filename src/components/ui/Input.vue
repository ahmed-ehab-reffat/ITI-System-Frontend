<script setup>
defineProps({
  label: {
    type: String,
    default: '',
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="space-y-1">
    <label
      v-if="label"
      class="block text-sm font-medium text-neutral-700"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div class="relative">
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        class="block w-full rounded-md border-neutral-300 shadow-sm transition-colors focus:border-secondary-500 focus:ring-secondary-500 sm:text-sm disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed"
        :class="{
          'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500': error,
          'border-neutral-300': !error
        }"
      />
    </div>

    <p v-if="error" class="text-xs text-red-600">
      {{ error }}
    </p>
  </div>
</template>
