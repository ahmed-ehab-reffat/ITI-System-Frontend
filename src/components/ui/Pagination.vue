<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  lastPage: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    default: 0
  },
  from: {
    type: Number,
    default: 0
  },
  to: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['change-page'])

const pages = computed(() => {
  const range = []
  const maxVisiblePages = 5
  
  let start = Math.max(1, props.currentPage - Math.floor(maxVisiblePages / 2))
  const end = Math.min(props.lastPage, start + maxVisiblePages - 1)

  if (end - start + 1 < maxVisiblePages) {
    start = Math.max(1, end - maxVisiblePages + 1)
  }

  for (let i = start; i <= end; i++) {
    range.push(i)
  }
  return range
})

function selectPage(page) {
  if (page < 1 || page > props.lastPage || page === props.currentPage || props.loading) return
  emit('change-page', page)
}
</script>

<template>
  <div class="flex items-center justify-between border-t border-neutral-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg">
    <!-- Mobile view -->
    <div class="flex flex-1 justify-between sm:hidden">
      <button
        @click="selectPage(currentPage - 1)"
        :disabled="currentPage === 1 || loading"
        class="relative inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      <button
        @click="selectPage(currentPage + 1)"
        :disabled="currentPage === lastPage || loading"
        class="relative ml-3 inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>

    <!-- Desktop view -->
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-neutral-700">
          Showing
          <span class="font-semibold">{{ from }}</span>
          to
          <span class="font-semibold">{{ to }}</span>
          of
          <span class="font-semibold">{{ total }}</span>
          results
        </p>
      </div>
      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <!-- Previous button -->
          <button
            @click="selectPage(currentPage - 1)"
            :disabled="currentPage === 1 || loading"
            class="relative inline-flex items-center rounded-l-md px-2 py-2 text-neutral-400 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span class="sr-only">Previous</span>
            <!-- Simple arrow icon -->
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- First page ellipsis if needed -->
          <template v-if="pages.length > 0 && pages[0] > 1">
            <button
              @click="selectPage(1)"
              class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-neutral-900 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 focus:z-20 focus:outline-offset-0 transition-colors"
            >
              1
            </button>
            <span v-if="pages[0] > 2" class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-neutral-700 ring-1 ring-inset ring-neutral-300 focus:outline-offset-0">
              ...
            </span>
          </template>

          <!-- Page numbers -->
          <button
            v-for="page in pages"
            :key="page"
            @click="selectPage(page)"
            :aria-current="page === currentPage ? 'page' : undefined"
            :class="[
              page === currentPage
                ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                : 'text-neutral-900 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 focus:outline-offset-0',
              'relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 transition-colors'
            ]"
          >
            {{ page }}
          </button>

          <!-- Last page ellipsis if needed -->
          <template v-if="pages.length > 0 && pages[pages.length - 1] < lastPage">
            <span v-if="pages[pages.length - 1] < lastPage - 1" class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-neutral-700 ring-1 ring-inset ring-neutral-300 focus:outline-offset-0">
              ...
            </span>
            <button
              @click="selectPage(lastPage)"
              class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-neutral-900 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 focus:z-20 focus:outline-offset-0 transition-colors"
            >
              {{ lastPage }}
            </button>
          </template>

          <!-- Next button -->
          <button
            @click="selectPage(currentPage + 1)"
            :disabled="currentPage === lastPage || loading"
            class="relative inline-flex items-center rounded-r-md px-2 py-2 text-neutral-400 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span class="sr-only">Next</span>
            <!-- Simple arrow icon -->
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
