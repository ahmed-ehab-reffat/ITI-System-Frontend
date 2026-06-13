<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  isEmpty: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="bg-surface border border-outline-variant rounded-xl overflow-hidden">
    <div v-if="$slots.toolbar" class="px-6 py-4 border-b border-surface-container-high bg-surface-container-lowest">
      <slot name="toolbar" />
    </div>
    
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-container-lowest border-b-2 border-outline-variant">
            <slot name="header" />
          </tr>
        </thead>
        <tbody class="font-body-sm text-body-sm">
          <tr v-if="loading">
            <td colspan="100%" class="py-8 text-center text-on-surface-variant">
              Loading...
            </td>
          </tr>
          <tr v-else-if="isEmpty">
            <td colspan="100%" class="py-8 text-center text-on-surface-variant">
              <slot name="empty">No data available.</slot>
            </td>
          </tr>
          <slot v-else />
        </tbody>
      </table>
    </div>
    
    <div v-if="$slots.footer" class="p-4 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
      <slot name="footer" />
    </div>
  </div>
</template>

<style>
@reference "../../assets/main.css";

/* Style for th elements within the header slot */
:deep(th) {
  @apply py-4 px-6 text-sm text-on-surface-variant font-medium;
}

/* Style for td elements within the default slot */
:deep(td) {
  @apply py-3 px-6;
}

/* Style for tr elements within the default slot */
:deep(tbody tr) {
  @apply border-b border-surface-container-high hover:bg-surface-container-lowest transition-colors;
}
:deep(tbody tr:last-child) {
  @apply border-b-0;
}
</style>
