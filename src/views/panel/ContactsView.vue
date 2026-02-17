<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'

const contacts = ref([])
const newsletter = ref([])
const loading = ref(true)

onMounted(async () => {
  const [cRes, nRes] = await Promise.all([
    supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
    supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false })
  ])
  if (!cRes.error) contacts.value = cRes.data || []
  if (!nRes.error) newsletter.value = nRes.data || []
  loading.value = false
})

function formatDate(d) {
  return d ? new Date(d).toLocaleString('en-US') : '-'
}
</script>

<template>
  <div class="contacts-admin">
    <h2>Contacts & Newsletter</h2>

    <h5 class="mt-4">Contact Form Submissions</h5>
    <div v-if="loading">Loading...</div>
    <div v-else-if="contacts.length === 0" class="text-muted">No contact submissions yet.</div>
    <div v-else class="table-responsive mb-4">
      <table class="table">
        <thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Message</th></tr></thead>
        <tbody>
          <tr v-for="c in contacts" :key="c.id">
            <td>{{ formatDate(c.created_at) }}</td>
            <td>{{ c.name }}</td>
            <td><a :href="'mailto:' + c.email">{{ c.email }}</a></td>
            <td class="text-break">{{ c.message }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h5>Newsletter Subscribers</h5>
    <div v-if="newsletter.length === 0" class="text-muted">No newsletter subscribers yet.</div>
    <div v-else class="table-responsive">
      <table class="table">
        <thead><tr><th>Date</th><th>Email</th></tr></thead>
        <tbody>
          <tr v-for="n in newsletter" :key="n.id">
            <td>{{ formatDate(n.created_at) }}</td>
            <td><a :href="'mailto:' + n.email">{{ n.email }}</a></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
