<script setup>
// MainLayout is now a transparent content wrapper.
// The sidebar and topbar are rendered globally by App.vue via AppSidebar.
// This component exists only for semantic grouping and padding consistency
// across views that use <MainLayout> as their root.
</script>

<template>
  <div class="p-4 md:p-8 max-w-7xl mx-auto w-full">
    <slot />
  </div>
</template>
