import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Landing', component: () => import('../views/LandingView.vue'), meta: { public: true } },
  { path: '/login', name: 'Login', component: () => import('../views/LoginView.vue'), meta: { public: true } },
  {
    path: '/panel',
    name: 'Panel',
    component: () => import('../views/PanelView.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/panel/contracts' },
      { path: 'contracts', name: 'Contracts', component: () => import('../views/panel/ContractsView.vue') },
      { path: 'contracts/new', name: 'NewContract', component: () => import('../views/panel/NewContractView.vue') },
      { path: 'contracts/:id', name: 'EditContract', component: () => import('../views/panel/EditContractView.vue') },
      { path: 'quotes', name: 'Quotes', component: () => import('../views/panel/QuotesView.vue') },
      { path: 'quotes/new', name: 'NewQuote', component: () => import('../views/panel/NewQuoteView.vue') },
      { path: 'clients', name: 'Clients', component: () => import('../views/panel/ClientsView.vue') },
      { path: 'blog', name: 'Blog', component: () => import('../views/panel/BlogView.vue') },
      { path: 'jobs', name: 'Jobs', component: () => import('../views/panel/JobsView.vue') },
      { path: 'profile', name: 'Profile', component: () => import('../views/panel/ProfileView.vue') },
      { path: 'contacts', name: 'Contacts', component: () => import('../views/panel/ContactsView.vue') }
    ]
  },
  { path: '/blog-public', name: 'BlogPublic', component: () => import('../views/BlogPublicView.vue'), meta: { public: true } },
  { path: '/blog-public/:slug', name: 'BlogPost', component: () => import('../views/BlogPostView.vue'), meta: { public: true } },
  { path: '/careers', name: 'Careers', component: () => import('../views/CareersView.vue'), meta: { public: true } },
  { path: '/verify/:id', name: 'VerifyContract', component: () => import('../views/VerifyContractView.vue'), meta: { public: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

function getStoredUser() {
  try {
    const s = localStorage.getItem('marine_user')
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

router.beforeEach((to, from, next) => {
  const user = getStoredUser()
  if (to.meta.requiresAuth && !user) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && user) {
    next({ name: 'Panel' })
  } else {
    next()
  }
})

export default router
