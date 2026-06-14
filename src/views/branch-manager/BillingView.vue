<script setup>
import { onMounted } from 'vue'
import { useBillingStore } from '@/stores/billing'
import AppSpinner from '@/components/ui/Spinner.vue'

const billingStore = useBillingStore()

onMounted(() => {
  billingStore.fetchAll()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-neutral-900">Billing & Ledger Summary</h1>
      <button 
        @click="billingStore.fetchAll"
        class="text-sm font-medium text-secondary-600 hover:text-secondary-700"
      >
        Refresh Reports
      </button>
    </div>

    <div v-if="billingStore.loading && !billingStore.summary" class="flex justify-center py-12">
      <AppSpinner size="lg" />
    </div>

    <template v-else-if="billingStore.summary">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div class="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
          <p class="text-sm font-medium text-neutral-500 uppercase">Total Payroll Due</p>
          <p class="mt-2 text-3xl font-bold text-green-700">${{ billingStore.summary.total_due.toLocaleString() }}</p>
        </div>
        
        <!-- Internal vs External Split (BIL-4) -->
        <div class="bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm">
          <p class="text-sm font-medium text-blue-700 uppercase italic">Internal Staff</p>
          <p class="mt-2 text-3xl font-bold text-blue-900">${{ billingStore.summary.internal_due.toLocaleString() }}</p>
          <p class="text-xs text-blue-600 mt-1">{{ billingStore.summary.internal_count }} Instructors</p>
        </div>

        <div class="bg-secondary-50 p-6 rounded-lg border border-secondary-100 shadow-sm">
          <p class="text-sm font-medium text-secondary-700 uppercase italic font-bold">External Instructors</p>
          <p class="mt-2 text-3xl font-bold text-secondary-900">${{ billingStore.summary.external_due.toLocaleString() }}</p>
          <p class="text-xs text-secondary-600 mt-1">{{ billingStore.summary.external_count }} Instructors</p>
        </div>
      </div>

      <!-- Rollup Table -->
      <div class="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-neutral-200">
          <h2 class="text-lg font-semibold text-neutral-900">Instructor Billing Rollup</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold">
              <tr>
                <th class="px-6 py-3">Instructor Name</th>
                <th class="px-6 py-3">Type</th>
                <th class="px-6 py-3">Total Hours</th>
                <th class="px-6 py-3">Total Due</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-200">
              <tr v-for="record in billingStore.billingRecords" :key="record.instructor_id" class="hover:bg-neutral-50">
                <td class="px-6 py-4 font-medium text-neutral-900">{{ record.instructor_name }}</td>
                <td class="px-6 py-4">
                  <span 
                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter"
                    :class="record.type === 'internal' ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-600'"
                  >
                    {{ record.type }}
                  </span>
                </td>
                <td class="px-6 py-4">{{ record.total_hours }} hrs</td>
                <td class="px-6 py-4 font-mono font-bold text-green-700">
                  ${{ record.total_due.toLocaleString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
