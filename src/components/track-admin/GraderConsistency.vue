<script setup>
import AppIcon from '@/components/shared/AppIcon.vue'

defineProps({
  graderConsistency: {
    type: Array,
    required: true,
    default: () => []
  }
})
</script>

<template>
  <div class="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
    <h3 class="font-headline-sm text-headline-sm text-on-surface mb-6 flex items-center gap-2">
      <AppIcon name="analytics" class="text-primary-dark" /> Grader Consistency
    </h3>

    <div v-if="graderConsistency.length === 0" class="py-12 text-center text-on-surface-variant text-sm">
      No consistency analytics available yet.
    </div>

    <div v-else class="overflow-hidden border border-outline-variant rounded-xl">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-container border-b border-outline-variant text-xs font-semibold text-on-surface-variant">
            <th class="py-3 px-4">Lab Group</th>
            <th class="py-3 px-4">Instructor</th>
            <th class="py-3 px-4 text-right">Mean Score</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <tr v-for="row in graderConsistency" :key="row.lab_group" class="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
            <td class="py-3 px-4 font-medium text-black">{{ row.lab_group }}</td>
            <td class="py-3 px-4 text-on-surface-variant">{{ row.instructor }}</td>
            <td class="py-3 px-4 text-right font-semibold text-[#345968]">{{ row.mean_score }} / 10</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
