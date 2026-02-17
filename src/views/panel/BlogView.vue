<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import RichTextEditor from '../../components/RichTextEditor.vue'

const posts = ref([])
const loading = ref(true)
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ title: '', content: '', excerpt: '', cover_image: '', published: false })
const saveError = ref('')

onMounted(fetchPosts)

async function fetchPosts() {
  const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
  if (!error) posts.value = data || []
  loading.value = false
}

function slugify(s) {
  return String(s).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

async function savePost(e) {
  e.preventDefault()
  saveError.value = ''
  const slug = slugify(form.value.title) || 'post-' + Date.now()
  const payload = {
    title: form.value.title,
    slug,
    content: form.value.content,
    excerpt: form.value.excerpt,
    cover_image: form.value.cover_image?.trim() || null,
    published: form.value.published,
    updated_at: new Date().toISOString()
  }
  try {
    if (editingId.value) {
      const { error } = await supabase.from('blog_posts').update(payload).eq('id', editingId.value)
      if (error) throw error
    } else {
      const { error } = await supabase.from('blog_posts').insert(payload)
      if (error) throw error
    }
    showForm.value = false
    editingId.value = null
    form.value = { title: '', content: '', excerpt: '', cover_image: '', published: false }
    fetchPosts()
  } catch (err) {
    saveError.value = err.message || 'Error saving. Run supabase-tables.sql in Supabase if tables are missing.'
  }
}

function editPost(p) {
  editingId.value = p.id
  form.value = {
    title: p.title,
    content: p.content || '',
    excerpt: p.excerpt || '',
    cover_image: p.cover_image || '',
    published: p.published || false
  }
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editingId.value = null
  form.value = { title: '', content: '', excerpt: '', cover_image: '', published: false }
  saveError.value = ''
}

async function deletePost(p) {
  if (!confirm('Delete post "' + p.title + '"?')) return
  const { error } = await supabase.from('blog_posts').delete().eq('id', p.id)
  if (!error) fetchPosts()
  else alert('Error: ' + error.message)
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : '-'
}
</script>

<template>
  <div class="blog-admin">
    <div class="page-header">
      <h2>Blog</h2>
      <button class="btn btn-primary" @click="showForm = true; editingId = null; Object.assign(form, { title: '', content: '', excerpt: '', cover_image: '', published: false })">
        <i class="bi bi-plus"></i> New Post
      </button>
    </div>

    <div v-if="showForm" class="card mb-4">
      <div class="card-body">
        <h5>{{ editingId ? 'Edit Post' : 'New Post' }}</h5>
        <form @submit="savePost">
          <div v-if="saveError" class="alert alert-danger">{{ saveError }}</div>
          <div class="form-group">
            <label>Title</label>
            <input v-model="form.title" class="form-control" required />
          </div>
          <div class="form-group">
            <label>Cover Image (paste URL)</label>
            <input v-model="form.cover_image" type="url" class="form-control" placeholder="https://example.com/image.jpg" />
            <p class="small text-muted mt-1">Paste image URL from any website. Right-click image → Copy image address.</p>
            <img v-if="form.cover_image" :src="form.cover_image" alt="Preview" class="mt-2 rounded" style="max-height:120px" @error="$event.target.style.display='none'" />
          </div>
          <div class="form-group">
            <label>Excerpt (short summary)</label>
            <textarea v-model="form.excerpt" class="form-control" rows="2"></textarea>
          </div>
          <div class="form-group">
            <label>Content</label>
            <RichTextEditor v-model="form.content" />
          </div>
          <div class="form-group">
            <label><input v-model="form.published" type="checkbox" /> Published</label>
          </div>
          <button type="submit" class="btn btn-primary">Save</button>
          <button type="button" class="btn btn-outline-secondary ms-2" @click="cancelForm">Cancel</button>
        </form>
      </div>
    </div>

    <div v-if="loading">Loading...</div>
    <div v-else class="list-group">
      <div v-for="p in posts" :key="p.id" class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <strong>{{ p.title }}</strong>
          <span v-if="!p.published" class="badge bg-warning ms-2">Draft</span>
          <span class="text-muted small ms-2">{{ formatDate(p.created_at) }}</span>
        </div>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-primary" @click="editPost(p)">Edit</button>
          <button class="btn btn-sm btn-outline-danger" @click="deletePost(p)" title="Delete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 4px; }
</style>
