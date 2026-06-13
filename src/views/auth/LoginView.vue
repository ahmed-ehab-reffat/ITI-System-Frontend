<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getDashboardRoute } from '@/router'
import AppIcon from '@/components/shared/AppIcon.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const errors = reactive({
  email: [],
  password: [],
})
const isLoading = ref(false)

function clearErrors() {
  errorMessage.value = ''
  errors.email = []
  errors.password = []
}

async function handleLogin() {
  clearErrors()
  isLoading.value = true

  try {
    const user = await authStore.login({
      email: email.value,
      password: password.value,
    })

    router.push({ name: getDashboardRoute(user.role) })
  } catch (error) {
    const response = error.response

    if (response && response.status === 422) {
      const data = response.data
      errorMessage.value = data.message || 'Validation failed.'
      if (data.errors) {
        errors.email = data.errors.email || []
        errors.password = data.errors.password || []
      }
    } else if (response && response.status === 401) {
      errorMessage.value = response.data.message || 'Invalid credentials.'
    } else {
      errorMessage.value = 'An unexpected error occurred. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
        <AppIcon name="school" :size="36" class="text-primary-dark" />
      </div>
      <h2 class="font-display-lg text-display-lg text-black mb-2">Welcome to TrackIQ</h2>
      <p class="font-body-md text-body-md text-on-surface-variant">ITI Attendance & Grading Platform</p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-surface py-8 px-4 shadow-sm border border-outline-variant rounded-2xl sm:px-10">
        
        <div v-if="errorMessage" class="mb-6 p-4 rounded-lg bg-error-container border border-error-container flex items-start gap-3">
          <AppIcon name="error" class="text-on-error-container mt-0.5" :size="20" />
          <p class="text-sm text-on-error-container">{{ errorMessage }}</p>
        </div>

        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label for="email" class="block font-label-md text-label-md text-black mb-1">
              Email address
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="appearance-none block w-full px-4 py-3 border border-outline-variant rounded-input bg-surface-container-lowest placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                :class="{'border-error focus:ring-error focus:border-error': errors.email.length}"
                placeholder="instructor@iti.test"
              />
              <p v-if="errors.email.length" class="mt-2 text-xs text-error">
                {{ errors.email[0] }}
              </p>
            </div>
          </div>

          <div>
            <label for="password" class="block font-label-md text-label-md text-black mb-1">
              Password
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="appearance-none block w-full px-4 py-3 border border-outline-variant rounded-input bg-surface-container-lowest placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                :class="{'border-error focus:ring-error focus:border-error': errors.password.length}"
                placeholder="••••••••"
              />
              <p v-if="errors.password.length" class="mt-2 text-xs text-error">
                {{ errors.password[0] }}
              </p>
            </div>
          </div>

          <div class="pt-2">
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-input shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div v-if="isLoading" class="flex items-center gap-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Signing in...
              </div>
              <span v-else>Sign in to your account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
