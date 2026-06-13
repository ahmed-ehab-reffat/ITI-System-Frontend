<script setup>
import { ref, onMounted } from 'vue'
import { useTracksStore } from '@/stores/tracks'
import { useToast } from '@/composables/useToast'
import AppButton from '@/components/ui/Button.vue'
import AppInput from '@/components/ui/Input.vue'
import AppModal from '@/components/ui/Modal.vue'
import AppSpinner from '@/components/ui/Spinner.vue'

const tracksStore = useTracksStore()
const toast = useToast()

const isModalOpen = ref(false)
const modalMode = ref('create')
const formData = ref({
  id: null,
  name: '',
  code: '',
})

onMounted(() => {
  tracksStore.fetchAll()
})

function openCreateModal() {
  modalMode.value = 'create'
  formData.value = { name: '', code: '' }
  isModalOpen.value = true
}

function openEditModal(track) {
  modalMode.value = 'edit'
  formData.value = { ...track }
  isModalOpen.value = true
}

async function handleSubmit() {
  try {
    if (modalMode.value === 'create') {
      await tracksStore.create(formData.value)
      toast.success('Track created successfully')
    } else {
      await tracksStore.update(formData.value.id, formData.value)
      toast.success('Track updated successfully')
    }
    isModalOpen.value = false
  } catch (e) {
    toast.error('Failed to save track')
  }
}
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-neutral-900">Tracks Management</h1>
      <AppButton @click="openCreateModal">Add New Track</AppButton>
    </div>

    <div class="bg-white rounded-lg border border-neutral-200">
      <div v-if="tracksStore.loading && !tracksStore.tracks.length" class="flex justify-center py-12">
        <AppSpinner />
      </div>
      <table v-else class="w-full text-left text-sm">
        <thead class="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold">
          <tr>
            <th class="px-6 py-3">Track Name</th>
            <th class="px-6 py-3">Code</th>
            <th class="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-200">
          <tr v-for="track in tracksStore.tracks" :key="track.id" class="hover:bg-neutral-50">
            <td class="px-6 py-4 font-bold text-secondary-700">{{ track.name }}</td>
            <td class="px-6 py-4">
              <code class="px-2 py-1 bg-neutral-100 rounded text-neutral-600 font-mono">{{ track.code }}</code>
            </td>
            <td class="px-6 py-4 text-right">
              <button @click="openEditModal(track)" class="text-secondary-600 hover:text-secondary-700 font-medium">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <AppModal
      :show="isModalOpen"
      :title="modalMode === 'create' ? 'Add New Track' : 'Edit Track'"
      @close="isModalOpen = false"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <AppInput
          label="Track Name"
          v-model="formData.name"
          placeholder="e.g. Open Source - PHP"
          required
        />
        <AppInput
          label="Track Code"
          v-model="formData.code"
          placeholder="e.g. PHP-44"
          required
        />

        <div class="flex justify-end gap-3 mt-6">
          <AppButton variant="secondary" @click="isModalOpen = false">Cancel</AppButton>
          <AppButton type="submit" :loading="tracksStore.loading">
            {{ modalMode === 'create' ? 'Create Track' : 'Save Changes' }}
          </AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>
