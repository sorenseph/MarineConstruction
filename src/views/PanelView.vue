<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const route = useRoute()
const { currentUser, logout } = useAuth()

const navItems = [
  { path: '/panel/contracts', label: 'Contracts', icon: 'bi-file-earmark-text' },
  { path: '/panel/clients', label: 'Clients', icon: 'bi-people' },
  { path: '/panel/blog', label: 'Blog', icon: 'bi-journal-text' },
  { path: '/panel/jobs', label: 'Careers', icon: 'bi-briefcase' },
  { path: '/panel/contacts', label: 'Contacts', icon: 'bi-envelope' },
  { path: '/panel/profile', label: 'Profile', icon: 'bi-person' }
]

function doLogout() {
  logout()
  router.push('/')
}
</script>

<template>
  <div class="panel-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <img src="/assets/img/rubens.svg" alt="Logo" class="logo" />
        <span>Marine Panel</span>
      </div>
      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: $route.path.startsWith(item.path) && (item.path !== '/panel' || $route.path === '/panel') }"
        >
          <i :class="['bi', item.icon]"></i>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <i class="bi bi-person-circle"></i>
          <span>{{ currentUser?.display_name || currentUser?.username }}</span>
        </div>
        <button @click="doLogout" class="btn-logout">
          <i class="bi bi-box-arrow-right"></i> Logout
        </button>
      </div>
    </aside>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.panel-layout {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 260px;
  background: #1d1918;
  color: #fff;
  display: flex;
  flex-direction: column;
}
.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.sidebar-header .logo {
  width: 50px;
}
.sidebar-nav {
  flex: 1;
  padding: 16px 0;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  transition: all 0.2s;
}
.nav-item:hover {
  background: rgba(255,255,255,0.05);
  color: #fff;
}
.nav-item.active {
  background: var(--accent-color, #ff5821);
  color: #fff;
}
.nav-item i {
  font-size: 18px;
}
.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
}
.btn-logout {
  width: 100%;
  padding: 10px;
  background: rgba(255,255,255,0.1);
  border: none;
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-logout:hover {
  background: rgba(255,255,255,0.2);
}
.main-content {
  flex: 1;
  padding: 24px;
  background: #f5f5f5;
  overflow-y: auto;
}
@media (max-width: 768px) {
  .sidebar {
    width: 70px;
  }
  .sidebar-header span,
  .nav-item span,
  .sidebar-footer span,
  .btn-logout span { display: none; }
  .nav-item { justify-content: center; }
}
</style>
