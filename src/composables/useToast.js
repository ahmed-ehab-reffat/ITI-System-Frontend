import { ref } from 'vue'

const toasts = ref([])
let nextId = 1

export function useToast() {
  function show(message, type = 'success', duration = 4000) {
    const id = nextId++

    toasts.value.push({
      id,
      message,
      type,
    })

    setTimeout(() => {
      remove(id)
    }, duration)

    return id
  }

  function remove(id) {
    const index = toasts.value.findIndex(
      (t) => t.id === id
    )

    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts,

    show,

    success: (message, duration) =>
      show(message, 'success', duration),

    error: (message, duration) =>
      show(message, 'error', duration),

    warning: (message, duration) =>
      show(message, 'warning', duration),

    info: (message, duration) =>
      show(message, 'info', duration),

    remove,
  }
}