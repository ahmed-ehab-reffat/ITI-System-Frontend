<script setup>
import { ref, computed, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  roster: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'excused', label: 'Excused' },
]

const studentId = ref('')
const status = ref('present')

// Reset the form whenever the modal is opened
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      studentId.value = ''
      status.value = 'present'
    }
  }
)

const canSubmit = computed(() => !!studentId.value && !!status.value)

function close() {
  emit('update:modelValue', false)
}

function submit() {
  if (!canSubmit.value) return
  emit('submit', { student_id: studentId.value, status: status.value })
}
</script>

<template>
  <Modal
    :model-value="modelValue"
    title="Add Attendance Record"
    size="sm"
    @update:model-value="(v) => emit('update:modelValue', v)"
  >
    <div class="space-y-4">
      <div>
        <label class="mb-1 block text-sm font-medium text-neutral-700">Student</label>
        <select
          v-model="studentId"
          class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          <option value="" disabled>Select a student…</option>
          <option v-for="student in roster" :key="student.student_id" :value="student.student_id">
            {{ student.student_name }}
          </option>
        </select>
        <p v-if="roster.length === 0" class="mt-1 text-xs text-neutral-500">
          No students found for this session.
        </p>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-neutral-700">Status</label>
        <select
          v-model="status"
          class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          <option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <template #footer>
      <Button variant="outline" @click="close">Cancel</Button>
      <Button :disabled="!canSubmit" :loading="loading" @click="submit">Save Record</Button>
    </template>
  </Modal>
</template>