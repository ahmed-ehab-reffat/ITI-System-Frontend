import { ref } from 'vue'
import { useToast } from './useToast'

export function useApi() {
  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)
  const { show } = useToast()

  async function execute(apiCall, options = { showSuccess: false, successMsg: 'Success' }) {
    loading.value = true
    error.value = null
    try {
      const response = await apiCall()
      data.value = response?.data !== undefined ? response.data : response
      if (options.showSuccess) {
        show(options.successMsg, 'success')
      }
      return data.value
    } catch (e) {
      error.value = e.response?.data?.message || 'An unexpected error occurred.'
      show(error.value, 'error')
      throw e
    } finally {
      loading.value = false
    }
  }

  return { loading, error, data, execute }
}
