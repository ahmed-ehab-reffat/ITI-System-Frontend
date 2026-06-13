<script setup>
import { ref, onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import BillingTable from '@/components/billing/BillingTable.vue'
import BillingDetail from '@/components/billing/BillingDetail.vue'
import { useApi } from '@/composables/useApi'
import api from '@/api/axios'

const { loading, error, data: billingRecords, execute } = useApi()
const { loading: detailLoading, error: detailError, data: selectedDetail, execute: executeDetail } = useApi()

const selectedInstructorId = ref(null)

async function loadBilling() {
  await execute(() => api.get('/billing'))
}

async function selectInstructor(id) {
  selectedInstructorId.value = id
  await executeDetail(() => api.get(`/billing/${id}`))
}

onMounted(() => {
  loadBilling()
})
</script>

<template>
  <MainLayout>
    <div class="mb-8">
      <h1 class="font-display-lg text-display-lg text-on-background">Instructor Billing</h1>
      <p class="font-body-md text-body-md text-on-surface-variant mt-2">Rollup of delivered sessions and payment due.</p>
    </div>

    <div v-if="error" class="bg-error-container text-on-error-container p-6 rounded-xl mb-8">
      <p>{{ error }}</p>
      <button @click="loadBilling" class="mt-4 px-4 py-2 bg-surface rounded">Retry</button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div class="lg:col-span-7">
        <h2 class="font-headline-sm text-headline-sm mb-4">Summary</h2>
        <BillingTable 
          :billing="billingRecords || []" 
          :loading="loading" 
          :selected-id="selectedInstructorId"
          @select="selectInstructor"
        />
      </div>
      
      <div class="lg:col-span-5">
        <h2 class="font-headline-sm text-headline-sm mb-4">Session Breakdown</h2>
        <div v-if="detailError" class="bg-error-container text-on-error-container p-4 rounded-xl mb-4 text-sm">
          Failed to load details: {{ detailError }}
        </div>
        <BillingDetail 
          :detail="selectedDetail" 
          :loading="detailLoading" 
        />
      </div>
    </div>
  </MainLayout>
</template>
