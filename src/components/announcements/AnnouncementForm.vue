<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit'])

const title = ref('')
const body = ref('')

const titleCharsLeft = computed(() => 150 - title.value.length)
const isTitleValid = computed(() => title.value.length > 0 && title.value.length <= 150)
const isBodyValid = computed(() => body.value.length > 0)
const isFormValid = computed(() => isTitleValid.value && isBodyValid.value && !props.loading)

function handleSubmit() {
  if (!isFormValid.value) return
  emit('submit', { title: title.value, body: body.value })
  // Form reset handles by parent after success if needed
}

defineExpose({
  reset: () => {
    title.value = ''
    body.value = ''
  }
})
</script>

<template>
  <form @submit.prevent="handleSubmit" class="bg-surface border border-outline-variant rounded-xl p-6 mb-8">
    <h3 class="font-headline-sm text-headline-sm mb-4">Create Announcement</h3>
    
    <div class="mb-4">
      <label for="title" class="block font-label-md text-label-md mb-1">Title</label>
      <input
        id="title"
        v-model="title"
        type="text"
        placeholder="Announcement title"
        class="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-input focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        :class="{ 'border-error': titleCharsLeft < 0 }"
      />
      <div class="flex justify-end mt-1 font-body-sm text-xs" :class="titleCharsLeft < 0 ? 'text-error' : 'text-on-surface-variant'">
        {{ titleCharsLeft }} characters remaining
      </div>
    </div>
    
    <div class="mb-4">
      <label for="body" class="block font-label-md text-label-md mb-1">Message</label>
      <textarea
        id="body"
        v-model="body"
        rows="4"
        placeholder="Type your message here..."
        class="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-input focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y"
      ></textarea>
    </div>
    
    <div class="flex justify-end">
      <button 
        type="submit" 
        :disabled="!isFormValid"
        class="px-6 py-2 bg-primary text-white rounded-input font-medium transition-colors"
        :class="isFormValid ? 'hover:bg-primary-dark cursor-pointer' : 'opacity-50 cursor-not-allowed'"
      >
        {{ loading ? 'Posting...' : 'Post Announcement' }}
      </button>
    </div>
  </form>
</template>
