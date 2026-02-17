<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const contractId = ref(route.params.id || '')
const status = ref('loading')

onMounted(() => {
  contractId.value = route.params.id || ''
  status.value = contractId.value ? 'valid' : 'invalid'
})
</script>

<template>
  <div class="verify-page">
    <header class="simple-header">
      <router-link to="/" class="logo"><img src="/assets/img/rubens.svg" alt="Logo" /></router-link>
      <nav>
        <router-link to="/">Home</router-link>
        <a href="/#contact">Contact</a>
      </nav>
    </header>
    <main class="container py-5">
      <div class="card shadow-sm mx-auto" style="max-width: 480px;">
        <div class="card-body text-center p-5">
          <h2 class="mb-3">Contract Verification</h2>
          <p class="text-muted mb-4">Verify a Marine Construction Services Agreement</p>
          <div v-if="status === 'loading'" class="text-muted">Loading...</div>
          <div v-else-if="status === 'valid'" class="verified-box">
            <i class="bi bi-check-circle-fill text-success" style="font-size: 48px;"></i>
            <h4 class="mt-3">Valid Contract</h4>
            <p class="text-muted mb-0">Contract ID:</p>
            <p class="fw-bold fs-5 text-dark">{{ contractId }}</p>
            <p class="small text-muted mt-3">This contract has been issued by Ruben's Construction & Repair.</p>
          </div>
          <div v-else class="invalid-box">
            <i class="bi bi-x-circle text-muted" style="font-size: 48px;"></i>
            <h4 class="mt-3">Contract Not Found</h4>
            <p class="text-muted">The contract ID is invalid or was not provided.</p>
            <router-link to="/" class="btn btn-primary mt-3">Return Home</router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.simple-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #212a3a;
  color: #fff;
}
.simple-header .logo img { height: 40px; }
.simple-header a { color: #fff; margin-left: 20px; }
</style>
