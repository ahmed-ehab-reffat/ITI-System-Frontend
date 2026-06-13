<script setup>
import DataTable from '@/components/shared/DataTable.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'

defineProps({
  students: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <DataTable :loading="loading" :is-empty="students.length === 0">
    <template #header>
      <th>Student Name</th>
      <th>Email</th>
      <th>Reason</th>
      <th class="text-right">Status</th>
    </template>
    
    <template #default>
      <tr v-for="student in students" :key="student.id">
        <td class="font-medium text-on-surface">{{ student.name }}</td>
        <td class="text-on-surface-variant">{{ student.email }}</td>
        <td class="text-on-surface-variant text-sm max-w-[200px] truncate" :title="student.at_risk_reason">{{ student.at_risk_reason || '—' }}</td>
        <td class="text-right">
          <StatusBadge label="At Risk" variant="error" />
        </td>
      </tr>
    </template>
    
    <template #empty>
      No students are currently marked as at-risk.
    </template>
  </DataTable>
</template>
