<script setup>
import { ref } from 'vue'
import { useAuth } from '../../composables/useAuth'

const { currentUser, changePassword } = useAuth()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const message = ref('')
const messageType = ref('')
const loading = ref(false)

async function handleChangePassword(e) {
  e.preventDefault()
  message.value = ''
  if (!currentPassword.value) {
    message.value = 'Please enter your current password'
    messageType.value = 'error'
    return
  }
  if (!newPassword.value || newPassword.value.length < 6) {
    message.value = 'New password must be at least 6 characters'
    messageType.value = 'error'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    message.value = 'Passwords do not match'
    messageType.value = 'error'
    return
  }
  loading.value = true
  const result = await changePassword(
    currentUser.value.username,
    currentPassword.value,
    newPassword.value
  )
  loading.value = false
  if (result.success) {
    message.value = 'Password changed successfully'
    messageType.value = 'success'
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } else {
    message.value = result.error || 'Failed to change password'
    messageType.value = 'error'
  }
}
</script>

<template>
  <div class="profile-page">
    <h2>Change Password</h2>
    <div class="card profile-card">
      <div class="card-body">
        <form @submit="handleChangePassword">
          <div v-if="message" :class="['alert', messageType === 'success' ? 'alert-success' : 'alert-danger']">
            {{ message }}
          </div>
          <div class="form-group">
            <label>Current Password</label>
            <input v-model="currentPassword" type="password" class="form-control" required />
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input v-model="newPassword" type="password" class="form-control" minlength="6" required />
          </div>
          <div class="form-group">
            <label>Confirm New Password</label>
            <input v-model="confirmPassword" type="password" class="form-control" required />
          </div>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Updating...' : 'Update Password' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page h2 { margin-bottom: 24px; }
.profile-card { max-width: 500px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 500; }
.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
}
.btn-primary {
  background: var(--accent-color, #ff5821);
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  cursor: pointer;
}
.alert-success { background: #d4edda; color: #155724; padding: 12px; border-radius: 6px; margin-bottom: 16px; }
.alert-danger { background: #f8d7da; color: #721c24; padding: 12px; border-radius: 6px; margin-bottom: 16px; }
</style>
