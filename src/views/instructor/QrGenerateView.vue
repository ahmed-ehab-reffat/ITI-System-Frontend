<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import SessionSelector from '@/components/instructor/SessionSelector.vue'
import QrCodeDisplay from '@/components/instructor/QrCodeDisplay.vue'
import AppIcon from '@/components/shared/AppIcon.vue'
import { useApi } from '@/composables/useApi'
import api from '@/api/axios'

const route = useRoute()
const engagementId = ref(route.query.engagement)
const sessionId = ref(route.params.sessionId !== 'select' ? route.params.sessionId : null)

const { loading, error, data: qrData, execute } = useApi()

const autoRefresh = ref(true)
let refreshInterval = null

async function loadQr() {
  if (!sessionId.value || sessionId.value === 'select') return
  await execute(() => api.get(`/qr/session/${sessionId.value}`))
}

function handleSessionSelect(id) {
  sessionId.value = id
  loadQr()
}

function startAutoRefresh() {
  if (refreshInterval) clearInterval(refreshInterval)
  if (autoRefresh.value) {
    // Refresh every 9 minutes (backend validity is 10 mins)
    refreshInterval = setInterval(loadQr, 9 * 60 * 1000)
  }
}

watch(autoRefresh, () => {
  startAutoRefresh()
})

onMounted(() => {
  if (sessionId.value && sessionId.value !== 'select') {
    loadQr()
  }
  startAutoRefresh()
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<template>
  <MainLayout>
    <div class="mb-8">
      <h1 class="font-display-lg text-display-lg text-on-background">Attendance QR Code</h1>
      <p class="font-body-md text-body-md text-on-surface-variant mt-2">Display this to students so they can scan it to check in.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div class="lg:col-span-4">
        <div class="bg-surface border border-outline-variant rounded-xl p-6 mb-6">
          <SessionSelector 
            v-if="engagementId" 
            :engagement-id="engagementId" 
            @select="handleSessionSelect" 
          />
          <div v-else class="text-on-surface-variant text-sm mb-6">
            Please navigate here from the dashboard to select an engagement first.
          </div>
          
          <div class="border-t border-outline-variant pt-4 mt-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="autoRefresh" class="rounded border-outline-variant text-primary focus:ring-primary" />
              <span class="font-body-sm text-on-surface">Auto-refresh QR code (every 9m)</span>
            </label>
          </div>
        </div>
      </div>
      
      <div class="lg:col-span-8 flex flex-col items-center">
        <div v-if="!sessionId || sessionId === 'select'" class="bg-surface-container-lowest border border-outline-variant p-12 rounded-xl text-center w-full max-w-lg">
          <AppIcon name="qr_code_scanner" :size="48" class="text-surface-container-high mb-4" />
          <h3 class="text-on-surface font-medium mb-1">Select a session</h3>
          <p class="text-on-surface-variant text-sm">Choose a session from the left to generate its QR code.</p>
        </div>
        
        <div v-else-if="loading && !qrData" class="py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        
        <div v-else-if="error" class="bg-error-container text-on-error-container p-6 rounded-xl border border-error-container w-full max-w-lg">
          <p>{{ error }}</p>
          <button @click="loadQr" class="mt-4 px-4 py-2 bg-surface rounded">Retry</button>
        </div>
        
        <div v-else-if="qrData" class="text-center">
          <QrCodeDisplay :payload="qrData.qr_payload" :size="350" class="mb-6 shadow-sm" />
          <div class="font-headline-sm text-on-surface">Scan with TrackIQ app</div>
          <div class="text-secondary text-sm mt-1">Updates automatically. Do not take a photo.</div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
