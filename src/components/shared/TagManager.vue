<script setup>
import { ref, onMounted, computed } from 'vue'
import { useApi } from '@/composables/useApi'
import api from '@/api/axios'
import StudentTagBadge from './StudentTagBadge.vue'
import AppIcon from './AppIcon.vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  studentId: {
    type: String,
    required: true
  }
})

const authStore = useAuthStore()

const { loading, data: tags, execute: fetchTags } = useApi()
const { loading: adding, execute: executeAdd } = useApi()
const { execute: executeDelete } = useApi()

const canManage = computed(() => authStore.isTrackAdmin || authStore.isInstructor)

const showForm = ref(false)
const tagType = ref('predefined')
const tagValue = ref('uses AI')
const note = ref('')
const predefinedOptions = ['uses AI', 'Cheating', 'loves extra work']

async function loadTags() {
  await fetchTags(() => api.get(`/students/${props.studentId}/tags`))
}

async function handleAdd() {
  if (!tagValue.value) return
  
  try {
    await executeAdd(() => api.post(`/students/${props.studentId}/tags`, {
      tag_type: tagType.value,
      tag_value: tagValue.value,
      note: note.value || null
    }), { showSuccess: true, successMsg: 'Tag added' })
    
    showForm.value = false
    note.value = ''
    tagValue.value = tagType.value === 'predefined' ? predefinedOptions[0] : ''
    loadTags()
  } catch {
    // Handled by useApi
  }
}

async function handleDelete(id) {
  try {
    await executeDelete(() => api.delete(`/students/${props.studentId}/tags/${id}`), {
      showSuccess: true, successMsg: 'Tag removed'
    })
    loadTags()
  } catch {
    // Handled
  }
}

onMounted(() => {
  loadTags()
})
</script>

<template>
  <div class="mt-2">
    <div v-if="loading && !tags" class="text-xs text-on-surface-variant">Loading tags...</div>
    
    <div v-else class="flex flex-wrap items-center gap-2">
      <div v-for="tag in tags" :key="tag.id" class="group flex items-center relative">
        <StudentTagBadge :tag="tag" />
        <button 
          v-if="canManage"
          @click="handleDelete(tag.id)" 
          class="absolute -top-2 -right-2 bg-error-container text-on-error-container rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove tag"
        >
          <AppIcon name="close" :size="12" />
        </button>
      </div>
      
      <button 
        v-if="canManage && !showForm" 
        @click="showForm = true"
        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-outline border-dashed text-on-surface-variant hover:text-primary hover:border-primary transition-colors bg-surface-container-lowest"
      >
        <AppIcon name="add" :size="14" class="mr-0.5" /> Add
      </button>
    </div>
    
    <!-- Add Tag Form -->
    <div v-if="showForm" class="mt-3 p-3 bg-surface-container-lowest border border-outline-variant rounded-lg max-w-sm">
      <div class="flex justify-between items-center mb-3">
        <h4 class="font-label-sm text-label-sm">Add Tag</h4>
        <button @click="showForm = false" class="text-on-surface-variant hover:text-black">
          <AppIcon name="close" :size="16" />
        </button>
      </div>
      
      <div class="flex gap-2 mb-3">
        <label class="flex items-center gap-1 text-sm cursor-pointer">
          <input type="radio" v-model="tagType" value="predefined" @change="tagValue = predefinedOptions[0]" class="text-primary focus:ring-primary" />
          Predefined
        </label>
        <label class="flex items-center gap-1 text-sm cursor-pointer">
          <input type="radio" v-model="tagType" value="free_text" @change="tagValue = ''" class="text-primary focus:ring-primary" />
          Custom
        </label>
      </div>
      
      <div class="mb-3">
        <select v-if="tagType === 'predefined'" v-model="tagValue" class="w-full text-sm p-1.5 border border-outline-variant rounded bg-surface">
          <option v-for="opt in predefinedOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <input v-else v-model="tagValue" type="text" placeholder="Custom tag name" class="w-full text-sm p-1.5 border border-outline-variant rounded bg-surface" />
      </div>
      
      <div class="mb-3">
        <textarea v-model="note" placeholder="Optional note (max 500 chars)" rows="2" maxlength="500" class="w-full text-sm p-1.5 border border-outline-variant rounded bg-surface resize-none"></textarea>
      </div>
      
      <div class="flex justify-end">
        <button 
          @click="handleAdd" 
          :disabled="!tagValue || adding"
          class="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary-dark disabled:opacity-50"
        >
          {{ adding ? 'Saving...' : 'Save Tag' }}
        </button>
      </div>
    </div>
  </div>
</template>
