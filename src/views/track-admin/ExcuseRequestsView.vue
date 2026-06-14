<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useExcuseRequestsStore } from '@/stores/excuseRequests'
import { useToast } from '@/composables/useToast'

import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'

const store = useExcuseRequestsStore()
const toast = useToast()

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'requested', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

const activeTab = ref('all')
const expandedId = ref(null)
const reviewState = reactive({})

const filteredRequests = computed(() => {
  if (activeTab.value === 'all') return store.requests
  return store.requests.filter((r) => r.status === activeTab.value)
})

const tabCounts = computed(() => ({
  all: store.requests.length,
  requested: store.pending.length,
  approved: store.approved.length,
  rejected: store.rejected.length,
}))

onMounted(async () => {
  try {
    await store.fetchAll()
  } catch {
    toast.error('Could not load excuse requests.')
  }
})

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
}

function openReview(id, mode) {
  reviewState[id] = { mode, note: '', submitting: false }
}

function cancelReview(id) {
  delete reviewState[id]
}

async function submitApprove(request) {
  const review = reviewState[request.id]
  if (!review || !review.note.trim()) return

  review.submitting = true
  try {
    const updated = await store.approve(request.id, review.note.trim())
    const refund = typeof updated.ledger_delta === 'number' ? updated.ledger_delta : 20
    toast.success(`Excuse approved — +${refund} points refunded to ledger.`)
    delete reviewState[request.id]
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to approve excuse request.')
    review.submitting = false
  }
}

async function submitReject(request) {
  const review = reviewState[request.id]
  if (!review || !review.note.trim()) return

  review.submitting = true
  try {
    await store.reject(request.id, review.note.trim())
    toast.success('Excuse request rejected.')
    delete reviewState[request.id]
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to reject excuse request.')
    review.submitting = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Filter tabs -->
    <div class="flex gap-1 border-b border-neutral-200">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        class="border-b-2 px-4 py-2 text-sm font-medium transition-colors"
        :class="
          activeTab === tab.key
            ? 'border-secondary-600 text-secondary-700'
            : 'border-transparent text-neutral-500 hover:text-neutral-700'
        "
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <span class="ml-1 text-xs text-neutral-400">({{ tabCounts[tab.key] }})</span>
      </button>
    </div>

    <!-- Loading / empty states -->
    <div v-if="store.loading" class="py-12 text-center text-sm text-neutral-400">
      Loading excuse requests…
    </div>
    <div v-else-if="filteredRequests.length === 0" class="py-12 text-center text-sm text-neutral-400">
      No excuse requests in this category.
    </div>

    <!-- Request list -->
    <div v-else class="space-y-2">
      <div
        v-for="request in filteredRequests"
        :key="request.id"
        class="rounded-lg border border-neutral-200 bg-white"
      >
        <!-- Row header -->
        <button
          class="flex w-full items-center justify-between px-4 py-3 text-left"
          @click="toggleExpand(request.id)"
        >
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-neutral-800">{{ request.student_name ?? '—' }}</span>
            <span class="text-sm text-neutral-400">{{ formatDate(request.session_date ?? request.created_at) }}</span>
          </div>
          <div class="flex items-center gap-3">
            <Badge :status="request.status" />
            <svg
              class="h-4 w-4 text-neutral-400 transition-transform"
              :class="{ 'rotate-180': expandedId === request.id }"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </button>

        <!-- Expanded details -->
        <div v-if="expandedId === request.id" class="border-t border-neutral-100 px-4 py-4">
          <dl class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt class="text-xs font-medium uppercase text-neutral-400">Student</dt>
              <dd class="text-sm text-neutral-700">{{ request.student_name ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase text-neutral-400">Session Date</dt>
              <dd class="text-sm text-neutral-700">{{ formatDate(request.session_date ?? request.created_at) }}</dd>
            </div>
            <div class="sm:col-span-2">
              <dt class="text-xs font-medium uppercase text-neutral-400">Reason</dt>
              <dd class="text-sm text-neutral-700">{{ request.reason }}</dd>
            </div>
            <div v-if="request.attachment_path">
  <dt class="text-xs font-medium uppercase text-neutral-400">Attachment</dt>
  <dd class="text-sm">
    <a
      :href="`/storage/${request.attachment_path}`"
      target="_blank"
      class="text-primary-600 underline hover:text-primary-700"
    >
      View attachment
    </a>
  </dd>
</div>
            <div v-if="request.review_note">
              <dt class="text-xs font-medium uppercase text-neutral-400">Reviewer Note</dt>
              <dd class="text-sm text-neutral-700">{{ request.review_note }}</dd>
            </div>
          </dl>

          <!-- Review actions: only for pending requests -->
          <div v-if="request.status === 'requested'" class="mt-4 border-t border-neutral-100 pt-4">
            <!-- Action buttons (shown when no review form is open) -->
            <div v-if="!reviewState[request.id]" class="flex gap-2">
              <Button variant="primary" size="sm" @click="openReview(request.id, 'approve')">
                Approve
              </Button>
              <Button variant="danger" size="sm" @click="openReview(request.id, 'reject')">
                Reject
              </Button>
            </div>

            <!-- Inline note form -->
            <div v-else class="space-y-2">
              <label class="block text-sm font-medium text-neutral-700">
                {{ reviewState[request.id].mode === 'approve' ? 'Approval note' : 'Rejection note' }}
                <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="reviewState[request.id].note"
                rows="3"
                placeholder="Explain the decision for the student's record…"
                class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <div class="flex gap-2">
                <Button
                  v-if="reviewState[request.id].mode === 'approve'"
                  variant="primary"
                  size="sm"
                  :disabled="!reviewState[request.id].note.trim()"
                  :loading="reviewState[request.id].submitting"
                  @click="submitApprove(request)"
                >
                  Confirm Approval
                </Button>
                <Button
                  v-else
                  variant="danger"
                  size="sm"
                  :disabled="!reviewState[request.id].note.trim()"
                  :loading="reviewState[request.id].submitting"
                  @click="submitReject(request)"
                >
                  Confirm Rejection
                </Button>
                <Button variant="outline" size="sm" @click="cancelReview(request.id)">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>