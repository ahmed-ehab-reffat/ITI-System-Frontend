<script setup>
import { ref, computed, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import { validateAttachment } from '@/stores/excuseRequests'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  // Only the student's own absent attendance records: [{ id, date, course_name }]
  absences: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const attendanceRecordId = ref('')
const reason = ref('')
const attachment = ref(null)
const fileError = ref('')
const fileInputRef = ref(null)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      attendanceRecordId.value = ''
      reason.value = ''
      attachment.value = null
      fileError.value = ''
      if (fileInputRef.value) fileInputRef.value.value = ''
    }
  }
)

const canSubmit = computed(
  () => !!attendanceRecordId.value && reason.value.trim().length > 0 && !fileError.value
)

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
}
function handleFileChange(event) {
  const file = event.target.files?.[0] ?? null
  fileError.value = ''
  attachment.value = null

  if (!file) return

  const error = validateAttachment(file)
  if (error) {
    fileError.value = error
    event.target.value = '' 
    return
  }

  attachment.value = file
}

function close() {
  emit('update:modelValue', false)
}

function submit() {
  if (!canSubmit.value) return
  emit('submit', {
    attendance_record_id: attendanceRecordId.value,
    reason: reason.value.trim(),
    attachment: attachment.value,
  })
}
</script>

<template>
  <Modal
    :model-value="modelValue"
    title="New Excuse Request"
    size="md"
    @update:model-value="(v) => emit('update:modelValue', v)"
  >
    <div class="space-y-4">
      <div>
        <label class="mb-1 block text-sm font-medium text-neutral-700">
          Absence <span class="text-red-500">*</span>
        </label>
        <select
          v-model="attendanceRecordId"
          class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          <option value="" disabled>Select the absence you're excusing…</option>
          <option v-for="record in absences" :key="record.id" :value="record.id">
            {{ formatDate(record.date ?? record.session_date) }} — {{ record.course_name || record.type }}
          </option>
        </select>
        <p v-if="absences.length === 0" class="mt-1 text-xs text-neutral-500">
          You have no absent sessions to excuse.
        </p>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-neutral-700">
          Reason <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="reason"
          rows="4"
          placeholder="Explain why you missed this session…"
          class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-neutral-700">
          Attachment <span class="text-neutral-400">(optional, PDF or image, max 1MB)</span>
        </label>
        <input
          ref="fileInputRef"
          type="file"
          accept=".pdf,image/*"
          class="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-neutral-700 hover:file:bg-neutral-200"
          @change="handleFileChange"
        />
        <p v-if="fileError" class="mt-1 text-xs text-red-600">{{ fileError }}</p>
        <p v-else-if="attachment" class="mt-1 text-xs text-green-600">
          {{ attachment.name }} ready to upload.
        </p>
      </div>
    </div>

    <template #footer>
      <Button variant="outline" @click="close">Cancel</Button>
      <Button :disabled="!canSubmit" :loading="loading" @click="submit">Submit Request</Button>
    </template>
  </Modal>
</template>