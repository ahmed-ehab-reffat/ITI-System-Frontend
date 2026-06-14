<script setup>
import { useConfirm } from '@/composables/useConfirm'
import AppModal from '@/components/ui/Modal.vue'
import AppButton from '@/components/ui/Button.vue'

const { state, handleConfirm, handleCancel } = useConfirm()
</script>

<template>
  <AppModal
    :modelValue="state.isOpen"
    :title="state.title"
    @update:modelValue="(val) => { if (!val) handleCancel() }"
  >
    <div class="space-y-4">
      <p class="text-neutral-600">
        {{ state.message }}
      </p>

      <div class="flex justify-end gap-3">
        <AppButton
          variant="secondary"
          @click="handleCancel"
        >
          {{ state.cancelText }}
        </AppButton>
        <AppButton
          :variant="state.variant"
          @click="handleConfirm"
        >
          {{ state.confirmText }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
