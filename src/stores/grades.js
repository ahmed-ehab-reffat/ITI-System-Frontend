import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useGradesStore = defineStore('grades', {
  state: () => ({
    courseGrades: [],
    summary: null,
    overrides: [],
    loading: false,
    error: null,
  }),

  actions: {
    
     // GET /students/{id}/grades/summary
     
    async fetchSummary(studentId) {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.get(
          `/students/${studentId}/grades/summary`
        )

        this.summary = data.data ?? data

        return this.summary
      } catch (err) {
        this.error =
          err?.response?.data?.message ||
          'Failed to load grade summary.'

        throw err
      } finally {
        this.loading = false
      }
    },

     // GET /courses/{id}/grades
     
    async fetchCourseGrades(courseId, params = {}) {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.get(
          `/courses/${courseId}/grades`,
          { params }
        )

        this.courseGrades = data.data ?? data

        return this.courseGrades
      } catch (err) {
        this.error =
          err?.response?.data?.message ||
          'Failed to load course grades.'

        throw err
      } finally {
        this.loading = false
      }
    },

     // POST /courses/{id}/grades
     
    async enterExamGrade(courseId, payload) {
      this.error = null

      try {
        const { data } = await api.post(
          `/courses/${courseId}/grades`,
          payload
        )

        const grade = data.data ?? data

        const index = this.courseGrades.findIndex(
          (g) => g.student_id === grade.student_id
        )

        if (index !== -1) {
          this.courseGrades[index] = grade
        } else {
          this.courseGrades.push(grade)
        }

        return grade
      } catch (err) {
        this.error =
          err?.response?.data?.message ||
          'Failed to save exam grade.'

        throw err
      }
    },

     // POST /grades/{id}/override
     
    async overrideGrade(gradeId, payload) {
      this.error = null

      try {
        const { data } = await api.post(
          `/grades/${gradeId}/override`,
          payload
        )

        const override = data.data ?? data

        const grade = this.courseGrades.find(
          (g) => g.id === gradeId
        )

        if (grade) {
          grade.computed_score = payload.new_value
        }

        return override
      } catch (err) {
        this.error =
          err?.response?.data?.message ||
          'Failed to override grade.'

        throw err
      }
    },

     // GET /grades/{id}/overrides
     
    async fetchOverrides(gradeId) {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.get(
          `/grades/${gradeId}/overrides`
        )

        this.overrides = data.data ?? data

        return this.overrides
      } catch (err) {
        this.error =
          err?.response?.data?.message ||
          'Failed to load override history.'

        throw err
      } finally {
        this.loading = false
      }
    },

    clear() {
      this.courseGrades = []
      this.summary = null
      this.overrides = []
      this.error = null
    },
  },
})
