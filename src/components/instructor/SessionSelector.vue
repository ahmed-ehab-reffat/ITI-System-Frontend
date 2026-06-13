<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import api from '@/api/axios'

const props = defineProps({
  engagementId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['select'])

const { loading, error, data: sessions, execute } = useApi()
const selectedId = ref('')

const isToday = (dateString) => {
  const today = new Date()
  const date = new Date(dateString)
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

onMounted(async () => {
  if (!props.engagementId) return
  
  const res = await execute(() => api.get(`/engagements/${props.engagementId}/sessions`))
  
  if (res && res.data && res.data.length > 0) {
    // Try to find today's session
    const todaySession = res.data.find(s => isToday(s.session_date))
    if (todaySession) {
      selectedId.value = todaySession.id
    } else {
      selectedId.value = res.data[0].id
    }
    emit('select', selectedId.value)
  }
})

function handleChange() {
  if (selectedId.value) {
    emit('select', selectedId.value)
  }
}

function formatDate(dateStr) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date(dateStr))
}
</script>

<template>
  <div class="mb-6">
    <label class="block font-label-md text-label-md mb-2">Select Session</label>
    
    <div v-if="loading" class="text-on-surface-variant text-sm py-2">
      Loading sessions...
    </div>
    
    <div v-else-if="error" class="text-error text-sm py-2">
      {{ error }}
    </div>
    
    <div v-else-if="!sessions || sessions.length === 0" class="text-on-surface-variant text-sm py-2">
      No sessions available for this engagement.
    </div>
    
    <select 
      v-else
      v-model="selectedId" 
      @change="handleChange"
      class="w-full md:w-96 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-input focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
    >
      <option v-for="session in sessions" :key="session.id" :value="session.id" :class="{'font-bold': isToday(session.session_date)}">
        {{ formatDate(session.session_date) }} 
        <span v-if="isToday(session.session_date)"> (Today)</span>
      </option>
    </select>
  </div>
</template>
