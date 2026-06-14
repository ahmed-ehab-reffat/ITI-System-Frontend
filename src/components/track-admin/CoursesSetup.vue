<script setup>
import { ref, computed, watch } from 'vue'
import AppIcon from '@/components/shared/AppIcon.vue'
import { useToast } from '@/composables/useToast'
import { useApi } from '@/composables/useApi'
import { useCoursesStore } from '@/stores/courses'

const props = defineProps({
  cohortId: {
    type: [String, Number],
    required: true
  }
})

const coursesStore = useCoursesStore()
const { show: showToast } = useToast()

const showAddCourseForm = ref(false)
const courseName = ref('')
const courseLabWeight = ref(40)
const courseExamWeight = ref(60)
const editingCourseId = ref(null)

const { loading: actionLoading, execute: executeAction } = useApi()
const { loading: listLoading, execute: executeFetch } = useApi()

const courseWeightError = computed(() => {
  const sum = Number(courseLabWeight.value) + Number(courseExamWeight.value)
  return sum !== 100 ? 'Weights must sum to exactly 100%.' : null
})

async function fetchCourses() {
  if (!props.cohortId) return
  await executeFetch(() => coursesStore.fetchForCohort(props.cohortId))
}

watch(() => props.cohortId, (newId) => {
  if (newId) {
    fetchCourses()
    resetCourseForm()
  }
}, { immediate: true })

async function handleSaveCourse() {
  if (courseWeightError.value || !props.cohortId) return
  
  await executeAction(async () => {
    const payload = {
      name: courseName.value,
      lab_weight: Number(courseLabWeight.value),
      exam_weight: Number(courseExamWeight.value)
    }
    
    if (editingCourseId.value) {
      await coursesStore.update(props.cohortId, editingCourseId.value, payload)
      showToast('Course updated successfully!', 'success')
    } else {
      await coursesStore.create(props.cohortId, payload)
      showToast('Course created successfully!', 'success')
    }
    
    resetCourseForm()
  })
}

function startEditCourse(course) {
  editingCourseId.value = course.id
  courseName.value = course.name
  courseLabWeight.value = course.lab_weight
  courseExamWeight.value = course.exam_weight
  showAddCourseForm.value = true
}

async function handleDeleteCourse(courseId) {
  if (!confirm('Are you sure you want to delete this course?')) return
  await executeAction(async () => {
    await coursesStore.destroy(props.cohortId, courseId)
    showToast('Course deleted successfully!', 'success')
  })
}

function resetCourseForm() {
  editingCourseId.value = null
  courseName.value = ''
  courseLabWeight.value = 40
  courseExamWeight.value = 60
  showAddCourseForm.value = false
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="font-headline-sm text-headline-sm">Course Structure</h3>
      <button
        v-if="!showAddCourseForm"
        @click="showAddCourseForm = true"
        class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
      >
        <AppIcon name="add" /> Add Course
      </button>
    </div>

    <!-- Add/Edit Course Form -->
    <div v-if="showAddCourseForm" class="bg-surface border border-outline-variant p-6 rounded-xl space-y-4 max-w-lg">
      <h4 class="font-title-md text-title-md">{{ editingCourseId ? 'Edit Course' : 'Create Course' }}</h4>
      <div class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Course Name</label>
          <input
            v-model="courseName"
            type="text"
            placeholder="e.g. Laravel Backend"
            class="w-full text-sm p-2.5 border border-outline-variant rounded-lg bg-surface"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Lab Weight (%)</label>
            <input
              v-model="courseLabWeight"
              type="number"
              min="0"
              max="100"
              class="w-full text-sm p-2.5 border border-outline-variant rounded-lg bg-surface"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Exam Weight (%)</label>
            <input
              v-model="courseExamWeight"
              type="number"
              min="0"
              max="100"
              class="w-full text-sm p-2.5 border border-outline-variant rounded-lg bg-surface"
            />
          </div>
        </div>

        <p v-if="courseWeightError" class="text-xs text-error font-medium">{{ courseWeightError }}</p>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button @click="resetCourseForm" class="px-4 py-2 border border-outline text-secondary text-sm rounded-lg hover:bg-surface-container">Cancel</button>
        <button
          @click="handleSaveCourse"
          :disabled="!courseName || courseWeightError || actionLoading"
          class="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark disabled:opacity-50"
        >
          {{ actionLoading ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>

    <div v-if="listLoading" class="py-8 flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Courses Table -->
    <div v-else-if="coursesStore.courses.length === 0" class="py-8 text-center text-on-surface-variant text-sm">
      No courses configured. Add a course to start.
    </div>
    
    <div v-else class="overflow-hidden border border-outline-variant rounded-xl bg-surface">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-container border-b border-outline-variant text-xs font-semibold text-on-surface-variant">
            <th class="py-3 px-4">Course Name</th>
            <th class="py-3 px-4">Lab Weight</th>
            <th class="py-3 px-4">Exam Weight</th>
            <th class="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <tr v-for="course in coursesStore.courses" :key="course.id" class="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
            <td class="py-3 px-4 font-medium text-black">{{ course.name }}</td>
            <td class="py-3 px-4">
              <span v-if="course.has_grades || course.grades_count > 0" class="text-secondary opacity-65 flex items-center gap-1" title="Cannot edit weights after grades exist.">
                {{ course.lab_weight }}% <AppIcon name="lock" :size="14" />
              </span>
              <span v-else>{{ course.lab_weight }}%</span>
            </td>
            <td class="py-3 px-4">
              <span v-if="course.has_grades || course.grades_count > 0" class="text-secondary opacity-65 flex items-center gap-1" title="Cannot edit weights after grades exist.">
                {{ course.exam_weight }}% <AppIcon name="lock" :size="14" />
              </span>
              <span v-else>{{ course.exam_weight }}%</span>
            </td>
            <td class="py-3 px-4 text-right space-x-2">
              <button @click="startEditCourse(course)" class="text-[#345968] hover:text-black hover:bg-surface-container p-1 rounded">
                <AppIcon name="edit" />
              </button>
              <button @click="handleDeleteCourse(course.id)" class="text-[#ba1a1a] hover:bg-[#ffdad6] p-1 rounded">
                <AppIcon name="delete" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
