import { reactive } from 'vue'

const state = reactive({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'primary', // primary | danger
  resolve: null,
})

export function useConfirm() {
  function confirm(options = {}) {
    state.title = options.title || 'Are you sure?'
    state.message = options.message || ''
    state.confirmText = options.confirmText || 'Confirm'
    state.cancelText = options.cancelText || 'Cancel'
    state.variant = options.variant || 'primary'
    state.isOpen = true

    return new Promise((resolve) => {
      state.resolve = resolve
    })
  }

  function handleConfirm() {
    state.isOpen = false
    if (state.resolve) state.resolve(true)
  }

  function handleCancel() {
    state.isOpen = false
    if (state.resolve) state.resolve(false)
  }

  return {
    state,
    confirm,
    handleConfirm,
    handleCancel,
  }
}
