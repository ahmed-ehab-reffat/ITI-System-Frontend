<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/shared/AppIcon.vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  announcement: {
    type: Object,
    required: true,
  },
})

defineEmits(['delete'])

const authStore = useAuthStore()

const canDelete = computed(() => {
  return authStore.user?.id === props.announcement.author_id
})

const formattedDate = computed(() => {
  if (!props.announcement.created_at) return ''
  const date = new Date(props.announcement.created_at)
  if (isNaN(date.getTime())) return props.announcement.created_at || ''
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date)
})

const authorInitials = computed(() => {
  return props.announcement.author_name?.charAt(0).toUpperCase() || 'U'
})

const authorRole = computed(() => {
  const role = props.announcement.author_role
  if (!role) return ''
  // Format role string (e.g. "track_admin" -> "Track Admin")
  return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
})
</script>

<template>
  <article class="bg-surface border border-outline-variant rounded-xl p-6 mb-4 hover:border-primary transition-colors">
    <div class="flex justify-between items-start mb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface font-medium">
          {{ authorInitials }}
        </div>
        <div>
          <div class="font-medium text-sm text-black flex items-center gap-2">
            {{ announcement.author_name }}
            <span v-if="authorRole" class="text-[10px] uppercase tracking-wider bg-surface-container-low text-on-surface-variant px-1.5 py-0.5 rounded font-semibold">{{ authorRole }}</span>
          </div>
          <div class="text-xs text-secondary">{{ formattedDate }}</div>
        </div>
      </div>
      
      <button 
        v-if="canDelete" 
        @click="$emit('delete', announcement.id)"
        class="text-on-surface-variant hover:text-error hover:bg-error-container p-2 rounded-full transition-colors"
        title="Delete announcement"
      >
        <AppIcon name="delete" :size="20" />
      </button>
    </div>
    
    <h3 class="font-headline-sm text-headline-sm text-black mb-2">{{ announcement.title }}</h3>
    <p class="font-body-md text-body-md text-on-surface whitespace-pre-wrap">{{ announcement.body }}</p>
  </article>
</template>
