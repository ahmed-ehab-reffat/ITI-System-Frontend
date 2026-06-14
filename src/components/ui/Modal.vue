<script setup>
import { watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: undefined,
  },
  show: {
    type: Boolean,
    default: undefined,
  },
  title: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md', // sm | md | lg | xl
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue', 'close'])

const isOpen = computed({
  get: () => props.modelValue ?? props.show,
  set: (val) => {
    if (props.modelValue !== undefined) {
      emit('update:modelValue', val)
    } else {
      emit('close')
    }
  },
})

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

function close() {
  isOpen.value = false
}

function onBackdropClick() {
  if (props.closeOnBackdrop) close()
}

watch(isOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="onBackdropClick"
      >
        <div
          class="w-full rounded-lg bg-white shadow-xl"
          :class="sizes[size]"
          role="dialog"
        >
          <!-- Header -->
          <div
            v-if="title || $slots.header"
            class="flex items-center justify-between border-b px-5 py-4"
          >
            <slot name="header">
              <h3 class="text-base font-semibold">{{ title }}</h3>
            </slot>

            <button @click="close">✕</button>
          </div>

          <!-- Body -->
          <div class="px-5 py-4">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="flex justify-end gap-2 border-t px-5 py-3"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.15s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>