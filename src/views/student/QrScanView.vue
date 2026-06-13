<script setup>
import { ref, onUnmounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import AppIcon from '@/components/shared/AppIcon.vue'
import { Html5Qrcode } from 'html5-qrcode'
import api from '@/api/axios'
import { useToast } from '@/composables/useToast'
import { useNfcScanner } from '@/composables/useNfcScanner'

const { show } = useToast()
const nfc = useNfcScanner()

const scannerDivId = 'qr-reader'
let html5QrCode = null
const scanning = ref(false)
const scanResult = ref(null)
const processing = ref(false)

async function startScanner() {
  if (scanning.value) return
  
  html5QrCode = new Html5Qrcode(scannerDivId)
  try {
    scanning.value = true
    scanResult.value = null
    
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        // Success callback
        await processPayload(decodedText)
      },
      () => {
        // Ignore failure callbacks (fires constantly when no QR is in view)
      }
    )
  } catch (err) {
    console.error('Error starting scanner', err)
    show('Could not access camera. Please check permissions.', 'error')
    scanning.value = false
  }
}

async function stopScanner() {
  if (html5QrCode && scanning.value) {
    try {
      await html5QrCode.stop()
      html5QrCode.clear()
    } catch (err) {
      console.error(err)
    }
    scanning.value = false
  }
}

async function startNfc() {
  await stopScanner() // Stop QR if running
  nfc.startScan(processPayload)
}

async function processPayload(payload) {
  if (processing.value) return
  processing.value = true
  
  // Stop scanners
  await stopScanner()
  nfc.stopScan()
  
  try {
    // Backend payload format is: {sessionId}|{timestamp}|{hmac_signature}
    const parts = payload.split('|')
    if (parts.length !== 3) throw new Error('Invalid QR code format.')

    const sessionId = parts[0]

    // Call API — backend verifies signature and expiry
    const response = await api.post('/qr/scan', {
      session_id: sessionId,
      payload: payload
    })
    
    // Display appropriate message
    if (response.data.status === 'checked_in') {
      scanResult.value = { type: 'success', message: `Successfully checked in at ${new Date(response.data.arrived_at).toLocaleTimeString()}` }
      show('Checked in successfully! ✓', 'success')
    } else if (response.data.status === 'checked_out') {
      scanResult.value = { type: 'success', message: `Successfully checked out at ${new Date(response.data.left_at).toLocaleTimeString()}` }
      show('Checked out successfully! ✓', 'success')
    }
  } catch (error) {
    console.error('Scan error', error)
    if (error.message === 'Invalid QR code format.') {
      scanResult.value = { type: 'error', message: 'This does not look like a valid QR code. Please scan the code on the instructor\'s screen.' }
      show('Invalid QR format', 'error')
    } else if (error.response?.status === 409) {
      scanResult.value = { type: 'warning', message: 'You have already checked out for this session.' }
      show('Already checked out', 'warning')
    } else if (error.response?.status === 422) {
      scanResult.value = { type: 'error', message: 'QR code is invalid or has expired. Ask your instructor to refresh it.' }
      show('Invalid or expired QR code', 'error')
    } else {
      scanResult.value = { type: 'error', message: error.response?.data?.message || error.message || 'An unexpected error occurred.' }
      show('Failed to process scan', 'error')
    }
  } finally {
    processing.value = false
  }
}

onUnmounted(() => {
  stopScanner()
  nfc.stopScan()
})
</script>

<template>
  <MainLayout>
    <div class="mb-8 text-center max-w-lg mx-auto">
      <h1 class="font-display-lg text-display-lg text-on-background">Attendance Check-in</h1>
      <p class="font-body-md text-body-md text-on-surface-variant mt-2">Scan the QR code displayed by your instructor, or tap your phone to the NFC tag.</p>
    </div>

    <div class="max-w-lg mx-auto">
      <div v-if="scanResult" class="mb-6 p-6 rounded-xl border flex flex-col items-center text-center" 
           :class="{
             'bg-surface-container-highest border-[#A9CFE0]': scanResult.type === 'success',
             'bg-error-container border-error-container text-on-error-container': scanResult.type === 'error',
             'bg-[#f0bc98]/30 border-[#f0bc98] text-[#724c30]': scanResult.type === 'warning'
           }">
        <AppIcon 
          :name="scanResult.type === 'success' ? 'check_circle' : (scanResult.type === 'error' ? 'error' : 'warning')" 
          :size="48" 
          :fill="true"
          class="mb-4"
          :class="{
            'text-[#345968]': scanResult.type === 'success',
            'text-on-error-container': scanResult.type === 'error',
            'text-[#724c30]': scanResult.type === 'warning'
          }"
        />
        <h3 class="font-headline-sm mb-2">
          {{ scanResult.type === 'success' ? 'Success!' : (scanResult.type === 'error' ? 'Error' : 'Notice') }}
        </h3>
        <p class="mb-6">{{ scanResult.message }}</p>
        
        <button @click="startScanner" class="px-6 py-2 bg-primary text-white rounded-input font-medium hover:bg-primary-dark transition-colors">
          Scan Another Code
        </button>
      </div>

      <div v-show="!scanResult" class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div id="qr-reader" class="w-full bg-black"></div>
        
        <div class="p-6">
          <div v-if="processing" class="text-center py-8">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p class="text-on-surface-variant">Processing...</p>
          </div>
          <div v-else class="flex flex-col gap-4">
            <button 
              v-if="!scanning"
              @click="startScanner" 
              class="w-full py-3 bg-primary text-white rounded-input font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              <AppIcon name="qr_code_scanner" />
              Start QR Scanner
            </button>
            <button 
              v-else
              @click="stopScanner" 
              class="w-full py-3 bg-surface-container-high text-on-surface rounded-input font-medium transition-colors flex items-center justify-center gap-2"
            >
              <AppIcon name="stop_circle" />
              Stop Scanning
            </button>
            
            <button 
              v-if="nfc.isSupported.value && !nfc.scanning.value"
              @click="startNfc" 
              class="w-full py-3 border border-outline-variant hover:bg-surface-container-lowest text-on-surface rounded-input font-medium transition-colors flex items-center justify-center gap-2"
            >
              <AppIcon name="contactless" />
              Use NFC Instead
            </button>
            <div v-else-if="nfc.scanning.value" class="w-full py-3 border border-primary bg-primary/10 text-primary rounded-input font-medium flex flex-col items-center justify-center gap-2 animate-pulse">
              <AppIcon name="contactless" :size="32" />
              <span>Ready to Scan NFC... Tap phone to tag</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style>
/* Adjust html5-qrcode styles to fit our UI */
#qr-reader video {
  width: 100% !important;
  object-fit: cover;
}
#qr-reader__dashboard_section_csr span {
  display: none !important;
}
</style>
