<script setup>
import { ref, watch } from 'vue'
import AppIcon from '@/components/shared/AppIcon.vue'

const props = defineProps({
  initialTitle: {
    type: String,
    default: ''
  },
  initialBody: {
    type: String,
    default: ''
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'cancel'])

const title = ref(props.initialTitle)
const body = ref(props.initialBody)

watch(() => [props.initialTitle, props.initialBody], ([newTitle, newBody]) => {
  title.value = newTitle
  body.value = newBody
})

function handleSubmit() {
  emit('save', { title: title.value, body: body.value })
}
</script>

<template>
  <div class="bg-surface border border-outline-variant rounded-xl p-6 shadow-md space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="font-headline-sm text-lg text-black">
        {{ isEditing ? 'Edit Announcement' : 'Post Announcement' }}
      </h2>
      <button @click="$emit('cancel')" class="text-secondary hover:text-black">
        <AppIcon name="close" />
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Title</label>
        <input 
          v-model="title" 
          type="text" 
          placeholder="e.g. Schedule Update" 
          class="w-full text-sm p-2.5 border border-outline-variant rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Body</label>
        <textarea 
          v-model="body" 
          rows="6" 
          placeholder="Write announcement body..." 
          class="w-full text-sm p-2.5 border border-outline-variant rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        ></textarea>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button type="button" @click="$emit('cancel')" class="px-4 py-2 border border-outline text-secondary text-sm rounded-lg hover:bg-surface-container">Cancel</button>
        <button 
          type="submit"
          :disabled="!title || !body || loading"
          class="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark disabled:opacity-50"
        >
          {{ loading ? 'Posting...' : (isEditing ? 'Save Changes' : 'Post Announcement') }}
        </button>
      </div>
    </form>
  </div>
</template>
