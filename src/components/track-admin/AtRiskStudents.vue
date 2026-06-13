<script setup>
import AppIcon from '@/components/shared/AppIcon.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'

defineProps({
  atRiskList: {
    type: Array,
    required: true,
    default: () => []
  }
})
</script>

<template>
  <div class="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
    <h3 class="font-headline-sm text-headline-sm text-on-surface mb-6 flex items-center gap-2">
      <AppIcon name="warning" class="text-[#ba1a1a]" /> At-Risk Students
    </h3>

    <div v-if="atRiskList.length === 0" class="py-12 text-center text-on-surface-variant text-sm bg-surface-container rounded-xl">
      No at-risk students in this cohort!
    </div>

    <div v-else class="overflow-hidden border border-outline-variant rounded-xl">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-container border-b border-outline-variant text-xs font-semibold text-on-surface-variant">
            <th class="py-3 px-4">Student</th>
            <th class="py-3 px-4">Ledger</th>
            <th class="py-3 px-4">Reason</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <tr v-for="std in atRiskList" :key="std.id" class="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
            <td class="py-3 px-4 font-medium text-black">{{ std.name }}</td>
            <td class="py-3 px-4">
              <span :class="std.ledger_balance < 150 ? 'text-error font-bold' : 'text-secondary'">
                {{ std.ledger_balance }}
              </span>
            </td>
            <td class="py-3 px-4">
              <StatusBadge
                :label="std.at_risk_reason === 'ledger_below_150' ? 'Ledger < 150' : 'Course Grade < 60'"
                :variant="std.at_risk_reason === 'ledger_below_150' ? 'error' : 'warning'"
                size="sm"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
