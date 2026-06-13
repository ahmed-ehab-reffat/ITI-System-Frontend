<script setup>
import AppIcon from '@/components/shared/AppIcon.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'

defineProps({
  announcement: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm hover:border-[#A9CFE0] transition-colors relative">
    <!-- Author + Date -->
    <div class="flex justify-between items-start mb-3">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-[#A9CFE0]/30 flex items-center justify-center text-[#345968] font-bold text-sm">
          {{ announcement.author?.name?.charAt(0).toUpperCase() || 'A' }}
        </div>
        <div>
          <div class="text-sm font-semibold text-black flex items-center gap-2">
            {{ announcement.author?.name }}
            <StatusBadge :label="announcement.author?.role?.replace('_', ' ')" variant="info" size="sm" class="capitalize" />
          </div>
          <div class="text-[10px] text-on-surface-variant mt-0.5">
            {{ new Date(announcement.created_at).toLocaleString() }}
          </div>
        </div>
      </div>

      <!-- Actions (Edit/Delete) -->
      <div class="flex gap-2">
        <button 
          @click="$emit('edit', announcement)"
          class="text-secondary hover:text-black hover:bg-surface-container p-1.5 rounded-full transition-colors"
          title="Edit Announcement"
        >
          <AppIcon name="edit" :size="18" />
        </button>
        <button 
          @click="$emit('delete', announcement.id)"
          class="text-[#ba1a1a] hover:bg-[#ffdad6] p-1.5 rounded-full transition-colors"
          title="Delete Announcement"
        >
          <AppIcon name="delete" :size="18" />
        </button>
      </div>
    </div>

    <!-- Title & Body -->
    <h3 class="font-title-md text-lg text-black mb-3">{{ announcement.title }}</h3>
    <!-- Preserve whitespace for newlines as required (ANN-3) -->
    <p class="text-sm text-secondary whitespace-pre-wrap leading-relaxed">{{ announcement.body }}</p>
  </div>
</template>
