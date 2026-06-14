<script setup>
defineProps({
  columns: {
    // [{ key: 'name', label: 'Name', class: '' }]
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  emptyText: {
    type: String,
    default: 'No records found.',
  },
  rowKey: {
    type: String,
    default: 'id',
  },
})
function getDisplayValue(value) {
  if (value == null) return '—'

  if (typeof value === 'object') {
    return value.name ?? '—'
  }

  return value
}
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
    <table class="w-full min-w-full text-left text-sm">
      <thead class="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3 font-medium"
            :class="col.class"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>

      <tbody class="divide-y divide-neutral-100">
        <tr v-if="loading">
          <td :colspan="columns.length" class="px-4 py-8 text-center text-neutral-400">
            Loading…
          </td>
        </tr>

        <tr v-else-if="rows.length === 0">
          <td :colspan="columns.length" class="px-4 py-8 text-center text-neutral-400">
            {{ emptyText }}
          </td>
        </tr>

        <tr
          v-for="row in rows"
          v-else
          :key="row[rowKey]"
          class="hover:bg-neutral-50/60"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3 text-neutral-700"
            :class="col.class"
          >
            <!-- Allow per-column custom rendering via named slots: <template #cell-status="{ row }"> -->
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
  {{ getDisplayValue(row[col.key]) }}
</slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>