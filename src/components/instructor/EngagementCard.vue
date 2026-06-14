<script setup>
import { useRouter } from 'vue-router'
import AppIcon from '@/components/shared/AppIcon.vue'

const props = defineProps({
  engagement: {
    type: Object,
    required: true,
  }
})

const router = useRouter()

function goToGrades() {
  router.push({ name: 'instructor-grades', query: { engagement: props.engagement.engagement_id } })
}

function goToQr() {
  router.push({ name: 'qr-generate', params: { sessionId: 'select' }, query: { engagement: props.engagement.engagement_id } })
}
</script>

<template>
  <div class="bg-surface border border-outline-variant rounded-xl p-6 hover:border-primary transition-colors flex flex-col h-full">
    <div class="flex justify-between items-start mb-6">
      <h3 
        class="font-headline-sm text-headline-sm text-on-surface truncate pr-2 capitalize" 
        :title="engagement.lab_group || `${engagement.cohort_name} - ${engagement.type}`"
      >
        {{ engagement.lab_group || `${engagement.cohort_name} - ${engagement.type}` }}
      </h3>
      <AppIcon :name="engagement.type === 'lecture' ? 'menu_book' : 'group'" class="text-on-surface-variant flex-shrink-0" />
    </div>

    <!-- Lecture Info Placeholder -->
    <div v-if="engagement.type === 'lecture'" class="flex-1 flex flex-col justify-center items-center text-center p-6 border border-dashed border-outline-variant rounded-xl mb-6 bg-surface-container-lowest">
      <AppIcon name="menu_book" :size="32" class="text-[#345968] mb-2" />
      <span class="text-xs font-semibold text-on-surface uppercase tracking-wider">Lecture Engagement</span>
      <p class="text-[11px] text-on-surface-variant mt-2 max-w-[200px]">
        This is a cohort-wide lecture. Attendance and delivered hours ({{ engagement.delivered_hours }} hrs) are tracked, but lab submissions/grading are managed under lab groups.
      </p>
    </div>
    
    <template v-else>
      <div class="grid grid-cols-3 gap-2 mb-6">
        <div class="bg-surface-container-lowest p-2 rounded border border-surface-container-high text-center">
          <div class="text-[10px] text-on-surface-variant mb-1 uppercase tracking-wider">Students</div>
          <div class="font-headline-sm text-primary">{{ engagement.student_count }}</div>
        </div>
        <div class="bg-surface-container-lowest p-2 rounded border border-surface-container-high text-center">
          <div class="text-[10px] text-on-surface-variant mb-1 uppercase tracking-wider">Submits</div>
          <div class="font-headline-sm text-primary">{{ engagement.submissions }}</div>
        </div>
        <div class="bg-surface-container-lowest p-2 rounded border border-surface-container-high text-center">
          <div class="text-[10px] text-on-surface-variant mb-1 uppercase tracking-wider">Hrs Deliv</div>
          <div class="font-headline-sm text-primary">{{ engagement.delivered_hours }}</div>
        </div>
      </div>

      <!-- Grade Distribution -->
      <div class="mb-6">
        <h4 class="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Grade Distribution</h4>
        <div class="flex h-3 rounded-full overflow-hidden mb-1">
          <div class="bg-green-500" :style="{ width: `${(engagement.grade_distribution.above_90 / Math.max(1, engagement.student_count)) * 100}%` }" title="Above 90"></div>
          <div class="bg-blue-500" :style="{ width: `${(engagement.grade_distribution['70_to_90'] / Math.max(1, engagement.student_count)) * 100}%` }" title="70 to 90"></div>
          <div class="bg-yellow-500" :style="{ width: `${(engagement.grade_distribution['60_to_70'] / Math.max(1, engagement.student_count)) * 100}%` }" title="60 to 70"></div>
          <div class="bg-red-500" :style="{ width: `${(engagement.grade_distribution.below_60 / Math.max(1, engagement.student_count)) * 100}%` }" title="Below 60"></div>
        </div>
        <div class="flex justify-between text-[10px] text-on-surface-variant">
          <span>>90: {{ engagement.grade_distribution.above_90 }}</span>
          <span>70-90: {{ engagement.grade_distribution['70_to_90'] }}</span>
          <span>60-70: {{ engagement.grade_distribution['60_to_70'] }}</span>
          <span>&lt;60: {{ engagement.grade_distribution.below_60 }}</span>
        </div>
      </div>

      <!-- Submission Tracker Table -->
      <div class="mb-6 flex-1 overflow-y-auto max-h-40 border border-outline-variant rounded">
        <table class="w-full text-left text-sm">
          <thead class="bg-surface-container-low text-xs sticky top-0">
            <tr>
              <th class="p-2 font-medium">Student</th>
              <th class="p-2 font-medium text-center">Sub</th>
              <th class="p-2 font-medium text-center">Late</th>
              <th class="p-2 font-medium text-center">Grd</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant">
            <tr v-for="track in engagement.submission_tracker" :key="track.student_name">
              <td class="p-2 truncate max-w-[100px]" :title="track.student_name">{{ track.student_name }}</td>
              <td class="p-2 text-center text-green-600 font-bold">{{ track.submitted ? '✓' : '✗' }}</td>
              <td class="p-2 text-center" :class="track.days_late > 0 ? 'text-error font-medium' : 'text-on-surface-variant'">{{ track.days_late }}d</td>
              <td class="p-2 text-center text-blue-600 font-bold">{{ track.graded ? '✓' : '✗' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    
    <div class="flex gap-2 mt-auto pt-2">
      <!-- Grade: only makes sense for lab engagements -->
      <button
        v-if="engagement.type === 'lab'"
        @click="goToGrades"
        class="flex-1 bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm py-2 rounded transition-colors text-center border border-outline-variant flex items-center justify-center gap-1"
      >
        <AppIcon name="grade" :size="16" />
        Grade
      </button>
      <!-- QR: works for both lecture and lab (attendance is tracked for both) -->
      <button @click="goToQr" class="flex-1 bg-primary hover:bg-primary-dark text-white font-label-sm py-2 rounded transition-colors text-center flex items-center justify-center gap-1">
        <AppIcon name="qr_code" :size="16" />
        QR Attendance
      </button>
    </div>
  </div>
</template>
