<script setup>
import { ref, computed, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import { validateAttachment } from '@/stores/excuseRequests'

const props = defineProps({
  modelValue: Boolean,
  absences: {
    type: Array,
    default: () => [],
  },
  loading: Boolean,
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
  () =>
    attendanceRecordId.value &&
    reason.value.trim().length > 0 &&
    !fileError.value
)

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function handleFileChange(event) {
  const file = event.target.files?.[0]
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
    :modelValue="modelValue"
    @update:modelValue="(v) => emit('update:modelValue', v)"
    title="New Excuse Request"
    size="lg"
  >
    <div class="space-y-6">

      <!-- Header Info Card -->
      <div class="rounded-lg border bg-slate-50 p-4">
        <p class="text-sm text-slate-600">
          Select an absent session and submit a justification request.
        </p>
        <p class="text-xs text-slate-400 mt-1">
          Only “absent” sessions are eligible for excuses.
        </p>
      </div>

      <!-- Absence Selection -->
      <div>
        <label class="mb-2 block text-sm font-medium text-slate-700">
          Absent Session <span class="text-red-500">*</span>
        </label>

        <select
          v-model="attendanceRecordId"
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="" disabled>Select a session</option>

          <option
            v-for="record in absences"
            :key="record.id"
            :value="record.id"
          >
            {{ formatDate(record.session_date) }} • {{ record.status }}
          </option>
        </select>

        <p v-if="absences.length === 0" class="mt-2 text-xs text-slate-500">
          No absent sessions available to excuse.
        </p>
      </div>

      <!-- Reason -->
      <div>
        <label class="mb-2 block text-sm font-medium text-slate-700">
          Reason <span class="text-red-500">*</span>
        </label>

        <textarea
          v-model="reason"
          rows="4"
          placeholder="Explain why you missed this session..."
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
      </div>

      <!-- File Upload -->
      <div>
        <label class="mb-2 block text-sm font-medium text-slate-700">
          Supporting Document
          <span class="text-xs text-slate-400">(optional)</span>
        </label>

        <div
          class="rounded-lg border-2 border-dashed border-slate-300 p-4 text-center hover:border-blue-400 transition"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept=".pdf,image/*"
            class="hidden"
            @change="handleFileChange"
          />

          <button
            type="button"
            class="text-sm font-medium text-blue-600 hover:underline"
            @click="fileInputRef?.click()"
          >
            Click to upload file
          </button>

          <p class="mt-1 text-xs text-slate-500">
            PDF or image, max 1MB
          </p>

          <p v-if="attachment" class="mt-2 text-xs text-green-600">
            ✔ {{ attachment.name }}
          </p>

          <p v-if="fileError" class="mt-2 text-xs text-red-600">
            {{ fileError }}
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <Button variant="outline" @click="close">
        Cancel
      </Button>

      <Button
        :loading="loading"
        :disabled="!canSubmit"
        @click="submit"
      >
        Submit Request
      </Button>
    </template>
  </Modal>
</template>