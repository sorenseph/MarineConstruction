<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const route = useRoute()
const { login } = useAuth()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit(e) {
  e.preventDefault()
  error.value = ''
  if (!username.value.trim()) {
    error.value = 'Please enter your username'
    return
  }
  if (!password.value) {
    error.value = 'Please enter your password'
    return
  }
  loading.value = true
  const result = await login(username.value.trim(), password.value)
  loading.value = false
  if (result.success) {
    const redirect = route.query.redirect || '/panel'
    router.push(redirect)
  } else {
    error.value = result.error || 'Login failed'
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <img src="/assets/img/rubens.svg" alt="Ruben's Construction" class="logo" />
        <h1>Marine Construction</h1>
        <p>Sign in to access the panel</p>
      </div>
      <form @submit="handleSubmit" class="login-form">
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <div class="form-group">
          <label for="username">Usuario (rubenconstruction o israelcardenas)</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="form-control"
            placeholder="rubenconstruction"
            autocomplete="off"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-control"
            placeholder="Enter your password"
            autocomplete="current-password"
          />
        </div>
        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
      <p class="login-footer">
        <router-link to="/">Back to home</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1d1918 0%, #39312f 100%);
  padding: 20px;
}
.login-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  padding: 40px;
  max-width: 400px;
  width: 100%;
}
.login-header {
  text-align: center;
  margin-bottom: 30px;
}
.login-header .logo {
  max-width: 120px;
  margin-bottom: 16px;
}
.login-header h1 {
  font-size: 24px;
  color: #213547;
  margin-bottom: 8px;
}
.login-header p {
  color: #666;
  font-size: 14px;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #333;
}
.form-control {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}
.form-control:focus {
  outline: none;
  border-color: var(--accent-color, #ff5821);
  box-shadow: 0 0 0 2px rgba(255,88,33,0.2);
}
.btn-block {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border-radius: 8px;
  background: var(--accent-color, #ff5821);
  border: none;
  color: #fff;
  cursor: pointer;
  margin-top: 10px;
}
.btn-block:hover:not(:disabled) {
  background: #e04a18;
  color: #fff;
}
.btn-block:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.alert-danger {
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}
.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}
.login-footer a {
  color: var(--accent-color, #ff5821);
}
</style>
