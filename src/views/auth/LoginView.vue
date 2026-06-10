<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getDashboardRoute } from '@/router'

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

/**
 * Clears all error state before a new submission attempt.
 */
function clearErrors() {
  errorMessage.value = ''
  errors.email = []
  errors.password = []
}

/**
 * Handles form submission by calling the auth store login action.
 * On success, redirects to the user's role-specific dashboard.
 * On failure, populates error state from the API response.
 */
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
      // Laravel validation errors
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
  <section>
    <h1>Login</h1>

    <div v-if="errorMessage" role="alert">
      <p>{{ errorMessage }}</p>
    </div>

    <form @submit.prevent="handleLogin">
      <div>
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="Enter your email"
          required
          autocomplete="email"
        />
        <ul v-if="errors.email.length">
          <li v-for="(err, index) in errors.email" :key="index">{{ err }}</li>
        </ul>
      </div>

      <div>
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Enter your password"
          required
          autocomplete="current-password"
        />
        <ul v-if="errors.password.length">
          <li v-for="(err, index) in errors.password" :key="index">{{ err }}</li>
        </ul>
      </div>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
  </section>
</template>
