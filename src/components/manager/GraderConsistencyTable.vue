<script setup>
import { computed } from 'vue'
import DataTable from '@/components/shared/DataTable.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'

const props = defineProps({
  consistencies: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const cohortAverage = computed(() => {
  if (!props.consistencies || props.consistencies.length === 0) return 0
  const sum = props.consistencies.reduce((acc, curr) => acc + Number(curr.mean_score), 0)
  return sum / props.consistencies.length
})

function isAnomalous(meanScore) {
  if (cohortAverage.value === 0) return false
  return Math.abs(Number(meanScore) - cohortAverage.value) > 10
}
</script>

<template>
  <div class="mb-6">
    <div class="flex items-center gap-2 mb-2 text-sm text-on-surface-variant">
      <span>Cohort Average:</span>
      <span class="font-bold">{{ cohortAverage.toFixed(2) }}</span>
    </div>
    
    <DataTable :loading="loading" :is-empty="consistencies.length === 0">
      <template #header>
        <th>Lab Group</th>
        <th>Instructor</th>
        <th class="text-right">Mean Score</th>
      </template>
      
      <template #default>
        <tr v-for="item in consistencies" :key="item.lab_group" :class="{ 'bg-warning/10': isAnomalous(item.mean_score) }">
          <td class="font-medium text-on-surface">{{ item.lab_group }}</td>
          <td class="text-on-surface-variant">{{ item.instructor }}</td>
          <td class="text-right flex items-center justify-end gap-2">
            <StatusBadge v-if="isAnomalous(item.mean_score)" label="Anomaly" variant="warning" size="sm" />
            <span class="font-medium" :class="isAnomalous(item.mean_score) ? 'text-[#724c30]' : 'text-on-surface'">
              {{ Number(item.mean_score).toFixed(2) }}
            </span>
          </td>
        </tr>
      </template>
    </DataTable>
  </div>
</template>
