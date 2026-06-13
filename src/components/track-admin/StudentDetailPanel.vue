<script setup>
import AppIcon from '@/components/shared/AppIcon.vue'
import TagManager from '@/components/shared/TagManager.vue'

defineProps({
  student: {
    type: Object,
    required: true
  },
  studentLedger: {
    type: Object,
    default: null
  },
  ledgerLoading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close'])
</script>

<template>
  <div class="bg-surface border border-outline-variant rounded-xl p-6 shadow-md space-y-6 relative transition-all duration-300">
    <!-- Close Button -->
    <button 
      @click="$emit('close')" 
      class="absolute top-4 right-4 text-secondary hover:text-black p-1 hover:bg-surface-container rounded-full"
    >
      <AppIcon name="close" />
    </button>

    <!-- Student Title -->
    <div>
      <h3 class="font-headline-sm text-xl text-black pr-8">{{ student.name }}</h3>
      <p class="text-xs text-on-surface-variant mt-1">{{ student.email }}</p>
    </div>

    <hr class="border-outline-variant" />

    <!-- Student Tags (Integrated TagManager) -->
    <div>
      <h4 class="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant mb-2">Student Tags</h4>
      <TagManager :studentId="student.id" />
    </div>

    <hr class="border-outline-variant" />

    <!-- Attendance Ledger -->
    <div>
      <h4 class="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant mb-3">Attendance Ledger</h4>
      
      <div v-if="ledgerLoading" class="py-4 flex justify-center">
        <span class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></span>
      </div>

      <div v-else-if="studentLedger" class="space-y-4">
        <!-- Balance Card -->
        <div 
          class="p-4 rounded-xl flex items-center justify-between border"
          :class="studentLedger.balance >= 150 ? 'bg-[#A9CFE0]/15 border-primary/30 text-[#345968]' : 'bg-[#ffdad6] border-[#ba1a1a]/30 text-on-error-container'"
        >
          <div>
            <span class="text-xs uppercase font-semibold">Ledger Balance</span>
            <div class="text-3xl font-bold mt-1">{{ studentLedger.balance }} points</div>
          </div>
          <AppIcon :name="studentLedger.balance >= 150 ? 'check_circle' : 'warning'" class="text-2xl" />
        </div>

        <!-- Transaction History -->
        <div>
          <span class="text-xs font-semibold text-on-surface-variant uppercase block mb-2">History of Deductions</span>
          
          <div v-if="!studentLedger.history || studentLedger.history.length === 0" class="text-xs text-on-surface-variant py-2 italic bg-surface-container rounded-lg p-3 text-center">
            No ledger events or deductions recorded.
          </div>
          
          <div v-else class="max-h-48 overflow-y-auto space-y-2 border border-outline-variant rounded-lg p-2 bg-surface-container-low">
            <div 
              v-for="(event, idx) in studentLedger.history" 
              :key="idx" 
              class="flex justify-between items-center text-xs p-2.5 bg-surface border border-outline-variant rounded-lg"
            >
              <div>
                <span class="font-semibold text-black capitalize">{{ event.event.replace('_', ' ') }}</span>
                <span class="text-[10px] text-on-surface-variant block mt-0.5">{{ event.session_date }}</span>
              </div>
              <span 
                class="font-bold rounded px-1.5 py-0.5"
                :class="event.deduction < 0 ? 'bg-error-container text-on-error-container' : 'bg-[#A9CFE0]/20 text-[#345968]'"
              >
                {{ event.deduction > 0 ? '+' : '' }}{{ event.deduction }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <hr class="border-outline-variant" />
    
    <!-- Grades quick link -->
    <div class="pt-2">
      <router-link 
        to="/admin/grades" 
        class="w-full flex items-center justify-center gap-2 py-2.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-[#345968] font-bold text-sm rounded-lg transition-colors"
      >
        <AppIcon name="grade" /> Open Gradebook
      </router-link>
    </div>
  </div>
</template>
