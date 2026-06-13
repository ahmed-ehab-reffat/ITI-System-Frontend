<script setup>
import DataTable from '@/components/shared/DataTable.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'

defineProps({
  detail: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="bg-surface border border-outline-variant rounded-xl overflow-hidden">
    <div v-if="loading" class="p-8 flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
    
    <div v-else-if="!detail" class="p-8 text-center text-on-surface-variant">
      Select an instructor from the table to view their session breakdown.
    </div>
    
    <div v-else>
      <div class="p-6 border-b border-surface-container-high bg-surface-container-lowest flex justify-between items-start">
        <div>
          <h3 class="font-headline-sm text-headline-sm text-on-surface mb-1">{{ detail.instructor_name }}</h3>
          <StatusBadge 
            :label="detail.type" 
            :variant="detail.type === 'internal' ? 'info' : 'success'" 
            size="sm" 
          />
        </div>
        <div class="text-right">
          <div class="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Total Due</div>
          <div class="font-display-md text-primary">{{ detail.summary.total_due.toLocaleString() }} EGP</div>
        </div>
      </div>
      
      <DataTable :is-empty="!detail.sessions || detail.sessions.length === 0" class="border-0 rounded-none">
        <template #header>
          <th>Date</th>
          <th>Engagement</th>
          <th class="text-right">Hours</th>
          <th class="text-right">Rate</th>
          <th class="text-right">Amount</th>
        </template>
        
        <template #default>
          <tr v-for="(session, index) in detail.sessions" :key="index">
            <td class="text-on-surface-variant whitespace-nowrap">{{ session.date }}</td>
            <td class="font-medium">{{ session.engagement }}</td>
            <td class="text-right">{{ session.hours }}h</td>
            <td class="text-right">{{ session.rate }}</td>
            <td class="text-right font-medium">{{ session.amount.toLocaleString() }}</td>
          </tr>
        </template>
        
        <template #empty>
          No sessions recorded.
        </template>
      </DataTable>
    </div>
  </div>
</template>
