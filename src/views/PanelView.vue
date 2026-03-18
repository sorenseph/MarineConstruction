<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const route = useRoute()
const { currentUser, logout } = useAuth()

const sidebarOpen = ref(false)

const navItems = [
  { path: '/panel/contracts', label: 'Contracts', icon: 'bi-file-earmark-text' },
  { path: '/panel/quotes', label: 'Quotes', icon: 'bi-receipt' },
  { path: '/panel/clients', label: 'Clients', icon: 'bi-people' },
  { path: '/panel/blog', label: 'Blog', icon: 'bi-journal-text' },
  { path: '/panel/jobs', label: 'Careers', icon: 'bi-briefcase' },
  { path: '/panel/contacts', label: 'Contacts', icon: 'bi-envelope' },
  { path: '/panel/profile', label: 'Profile', icon: 'bi-person' }
]

// Cerrar sidebar al navegar (en móvil)
watch(() => route.path, () => {
  sidebarOpen.value = false
})

function doLogout() {
  logout()
  router.push('/')
}

function closeSidebar() {
  sidebarOpen.value = false
}
</script>

<template>
  <div class="panel-layout">
    <!-- Overlay para cerrar sidebar en móvil -->
    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      aria-hidden="true"
      @click="closeSidebar"
    />

    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <img src="/assets/img/rubens.svg" alt="Logo" class="logo" />
        <span>Marine Panel</span>
        <button type="button" class="btn-close-sidebar" aria-label="Cerrar menú" @click="closeSidebar">
          <i class="bi bi-x-lg"></i>
        </button>
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
      <button type="button" class="btn-menu-toggle" aria-label="Abrir menú" @click="sidebarOpen = true">
        <i class="bi bi-list"></i>
      </button>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.panel-layout {
  display: flex;
  min-height: 100vh;
  position: relative;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
}

.sidebar {
  width: 260px;
  min-width: 260px;
  background: #1d1918;
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  z-index: 1000;
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

.btn-close-sidebar {
  display: none;
  margin-left: auto;
  padding: 6px;
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.8);
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  border-radius: 4px;
}

.btn-close-sidebar:hover {
  color: #fff;
  background: rgba(255,255,255,0.1);
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
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
  min-width: 0;
  padding: 24px;
  padding-top: 64px;
  background: #f5f5f5;
  overflow-y: auto;
  position: relative;
}

.btn-menu-toggle {
  display: none;
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 100;
  width: 44px;
  height: 44px;
  padding: 0;
  background: var(--accent-color, #ff5821);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.5rem;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.btn-menu-toggle:hover {
  background: #e54d18;
  color: #fff;
}

.btn-menu-toggle i {
  font-size: 1.5rem;
}

/* Responsive: tablet y móvil */
@media (max-width: 991px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    box-shadow: none;
  }

  .sidebar.open {
    transform: translateX(0);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
  }

  .sidebar-overlay {
    display: block;
  }

  .sidebar.open + .main-content .btn-menu-toggle {
    opacity: 0;
    pointer-events: none;
  }

  .btn-close-sidebar {
    display: flex;
  }

  .btn-menu-toggle {
    display: flex;
  }

  .main-content {
    padding-top: 24px;
  }
}

@media (min-width: 992px) {
  .btn-menu-toggle {
    display: none !important;
  }
}
</style>
