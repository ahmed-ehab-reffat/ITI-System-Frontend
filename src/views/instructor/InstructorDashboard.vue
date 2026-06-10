<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <section>
    <h1>Instructor Dashboard</h1>
    <p>Welcome, {{ authStore.user?.name }}.</p>
  </section>
</template>
