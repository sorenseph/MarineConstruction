<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import AppHeader from '../components/AppHeader.vue'

const posts = ref([])
const loading = ref(true)

onMounted(async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
  if (!error) posts.value = data || []
  loading.value = false
})

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : '-'
}
</script>

<template>
  <div class="blog-public">
    <AppHeader />

    <main class="main">
    <section class="section light-background py-5 blog-section">
    <div class="container section-title">
      <h2>Blog</h2>
      <p>News and updates from Ruben's Construction & Repair</p>
    </div>
    <div class="container">
      <div v-if="loading" class="text-center py-5">Loading...</div>
      <div v-else-if="posts.length === 0" class="text-center py-5 text-muted">No posts yet.</div>
      <div v-else class="row g-4">
        <article v-for="p in posts" :key="p.id" class="col-md-6 col-lg-4">
          <router-link :to="'/blog-public/' + (p.slug || p.id)" class="card h-100 blog-card text-decoration-none">
            <img v-if="p.cover_image" :src="p.cover_image" class="card-img-top" alt="" style="height:200px;object-fit:cover" />
            <div v-else class="card-img-top bg-secondary d-flex align-items-center justify-content-center" style="height:200px">
              <i class="bi bi-newspaper text-white" style="font-size:48px"></i>
            </div>
            <div class="card-body">
              <h5 class="card-title">{{ p.title }}</h5>
              <p class="text-muted small">{{ formatDate(p.created_at) }}</p>
              <p class="card-text text-dark">{{ p.excerpt || (p.content?.replace(/<[^>]+>/g,'').slice(0, 150) + '...') }}</p>
            </div>
          </router-link>
        </article>
      </div>
    </div>
    </section>
    </main>
  </div>
</template>

<style scoped>
.blog-public .main { min-height: 60vh; }
.blog-section .section-title { padding-bottom: 30px; }
.blog-section .section-title h2 { font-size: 32px; font-weight: 700; }
.blog-card {
  border: 1px solid rgba(0,0,0,.08);
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  transition: box-shadow 0.3s, transform 0.2s;
  border-radius: 8px;
  overflow: hidden;
}
.blog-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  transform: translateY(-2px);
}
.blog-card .card-title { color: var(--heading-color); }
.blog-card .card-title:hover { color: var(--accent-color); }
</style>
