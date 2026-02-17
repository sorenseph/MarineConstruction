<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabase'
import AppHeader from '../components/AppHeader.vue'

const route = useRoute()
const post = ref(null)
const loading = ref(true)

onMounted(async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', route.params.slug)
    .eq('published', true)
    .single()
  if (!error) post.value = data
  loading.value = false
})

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : '-'
}
</script>

<template>
  <div class="blog-post-page">
    <AppHeader />

    <main class="main">
    <section class="section light-background py-5 blog-detail-section">
    <div class="container">
      <div v-if="loading" class="text-center py-5">Loading...</div>
      <article v-else-if="post" class="blog-article">
        <router-link to="/blog-public" class="btn btn-link mb-3">← Back to blog</router-link>
        <h1>{{ post.title }}</h1>
        <p class="text-muted">{{ formatDate(post.created_at) }}</p>
        <img v-if="post.cover_image" :src="post.cover_image" alt="" class="img-fluid rounded mb-4" style="max-height:400px;object-fit:cover;width:100%" />
        <div class="blog-content" v-html="post.content"></div>
      </article>
      <div v-else class="text-center py-5">
        <p class="text-muted">Post not found.</p>
        <router-link to="/blog-public" class="btn btn-primary">View blog</router-link>
      </div>
    </div>
    </section>
    </main>
  </div>
</template>

<style scoped>
.blog-post-page .main { min-height: 60vh; }
.blog-detail-section { background-color: var(--surface-color, #fff); }
.blog-article h1 { font-size: 2rem; margin-bottom: 0.5rem; color: var(--heading-color); }
.blog-content :deep(h2) { font-size: 1.5rem; margin-top: 1.5rem; color: var(--heading-color); }
.blog-content :deep(h3) { font-size: 1.25rem; margin-top: 1.25rem; }
.blog-content :deep(h4), .blog-content :deep(h5) { font-size: 1.1rem; margin-top: 1rem; }
.blog-content :deep(ul), .blog-content :deep(ol) { margin: 1rem 0; padding-left: 1.5rem; }
.blog-content :deep(img) { max-width: 100%; height: auto; border-radius: 8px; }
.blog-content :deep(p) { margin-bottom: 1rem; }
.btn-primary { background: var(--accent-color, #ff5821); border-color: var(--accent-color); }
</style>
