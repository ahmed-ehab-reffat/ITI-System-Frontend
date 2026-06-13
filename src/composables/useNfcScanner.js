import { ref } from 'vue'
import { useToast } from './useToast'

export function useNfcScanner() {
  const { show } = useToast()
  const scanning = ref(false)
  const isSupported = ref('NDEFReader' in window)
  
  // We don't have an AbortController returned directly, we pass signal to scan()
  let abortController = null

  async function startScan(onSuccess) {
    if (!isSupported.value) {
      show('NFC is not supported on this device', 'error')
      return
    }

    try {
      abortController = new AbortController()
      const ndef = new window.NDEFReader()
      
      await ndef.scan({ signal: abortController.signal })
      scanning.value = true
      
      ndef.onreadingerror = () => {
        show('Cannot read data from the NFC tag. Try again.', 'warning')
      }
      
      ndef.onreading = ({ message }) => {
        // Find the payload record
        for (const record of message.records) {
          if (record.recordType === 'text') {
            const textDecoder = new TextDecoder(record.encoding)
            const payload = textDecoder.decode(record.data)
            
            // Call success handler, then stop scanning
            onSuccess(payload)
            stopScan()
            break
          }
        }
      }
    } catch (error) {
      console.error(error)
      show('Error starting NFC scanner: ' + error.message, 'error')
      scanning.value = false
    }
  }

  function stopScan() {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    scanning.value = false
  }

  return { isSupported, scanning, startScan, stopScan }
}
