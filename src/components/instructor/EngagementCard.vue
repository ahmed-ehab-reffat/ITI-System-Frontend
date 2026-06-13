<script setup>
import { useRouter } from 'vue-router'
import AppIcon from '@/components/shared/AppIcon.vue'

const props = defineProps({
  engagementId: {
    type: String,
    required: true,
  },
  labGroup: {
    type: String,
    required: true,
  },
  studentCount: {
    type: Number,
    required: true,
  },
  submissions: {
    type: Number,
    required: true,
  },
})

const router = useRouter()

function goToQr() {
  // Pass a dummy sessionId to start, or we can handle it in the view
  router.push({ name: 'qr-generate', params: { sessionId: 'select' }, query: { engagement: props.engagementId } })
}
</script>

<template>
  <div class="bg-surface border border-outline-variant rounded-xl p-6 hover:border-primary transition-colors">
    <div class="flex justify-between items-start mb-6">
      <h3 class="font-headline-sm text-headline-sm text-on-surface truncate pr-2" :title="labGroup">{{ labGroup }}</h3>
      <AppIcon name="group" class="text-on-surface-variant flex-shrink-0" />
    </div>
    
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-surface-container-lowest p-3 rounded-lg border border-surface-container-high text-center">
        <div class="font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase">Students</div>
        <div class="font-headline-md text-primary">{{ studentCount }}</div>
      </div>
      <div class="bg-surface-container-lowest p-3 rounded-lg border border-surface-container-high text-center">
        <div class="font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase">Submissions</div>
        <div class="font-headline-md text-primary">{{ submissions }}</div>
      </div>
    </div>
    
    <div class="flex gap-2">
      <button class="flex-1 bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm py-2 rounded transition-colors text-center border border-outline-variant">
        Grade
      </button>
      <button @click="goToQr" class="flex-1 bg-primary hover:bg-primary-dark text-white font-label-sm py-2 rounded transition-colors text-center flex items-center justify-center gap-1">
        <AppIcon name="qr_code" :size="16" />
        QR
      </button>
    </div>
  </div>
</template>
