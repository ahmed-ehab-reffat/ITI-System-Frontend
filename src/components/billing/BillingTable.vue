<script setup>
import DataTable from '@/components/shared/DataTable.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'

defineProps({
  billing: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  selectedId: {
    type: String,
    default: null,
  }
})

defineEmits(['select'])
</script>

<template>
  <DataTable :loading="loading" :is-empty="billing.length === 0">
    <template #header>
      <th>Instructor</th>
      <th>Type</th>
      <th class="text-right">Total Hours</th>
      <th class="text-right">Total Due</th>
    </template>
    
    <template #default>
      <tr 
        v-for="record in billing" 
        :key="record.instructor_id"
        class="cursor-pointer transition-colors"
        :class="selectedId === record.instructor_id ? 'bg-[#A9CFE0]/10 border-l-4 border-l-[#A9CFE0]' : 'border-l-4 border-l-transparent hover:bg-surface-container-lowest'"
        @click="$emit('select', record.instructor_id)"
      >
        <td class="font-medium text-on-surface">{{ record.instructor_name }}</td>
        <td>
          <StatusBadge 
            :label="record.type" 
            :variant="record.type === 'internal' ? 'info' : 'success'" 
            size="sm" 
          />
        </td>
        <td class="text-right">{{ record.total_hours }}h</td>
        <td class="text-right font-medium" :class="record.total_due > 0 ? 'text-[#345968]' : 'text-on-surface-variant'">
          {{ record.total_due > 0 ? `${record.total_due.toLocaleString()} EGP` : '-' }}
        </td>
      </tr>
    </template>
    
    <template #empty>
      No billing records found.
    </template>
  </DataTable>
</template>
