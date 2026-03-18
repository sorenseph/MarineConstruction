<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { generateQuotePdf, loadLogoAsBase64 } from '../../lib/quotePdf'
import logoWhiteSrc from '../../assets/img/rubens-white.svg?url'

const router = useRouter()
const quotes = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) quotes.value = data || []
  } catch {
    quotes.value = []
  }
  loading.value = false
})

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('en-US')
}

function formatCurrency(n) {
  return '$' + parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })
}

async function downloadQuotePDF(q) {
  try {
    const logoBase64 = await loadLogoAsBase64(logoWhiteSrc)
    const doc = await generateQuotePdf({
      clientName: q.client_name,
      companyName: q.company_name,
      clientAddress: q.client_address,
      preparedBy: q.prepared_by,
      items: Array.isArray(q.items) ? q.items : [],
      totalAmount: parseFloat(q.total_amount) || 0,
      disclaimer: q.disclaimer,
      quoteId: q.quote_id,
      quoteDate: q.quote_date,
      validUntil: q.valid_until,
      logoBase64
    })
    const safeName = (q.client_name || 'quote').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || q.id
    doc.save(`quote-${q.quote_id || q.quote_date}-${safeName}.pdf`)
  } catch (err) {
    console.error(err)
    alert('Error generating PDF: ' + (err.message || 'Unknown error'))
  }
}

async function deleteQuote(q) {
  if (!confirm(`Delete quote for "${q.client_name}"?`)) return
  const { error } = await supabase.from('quotes').delete().eq('id', q.id)
  if (error) {
    alert('Error: ' + error.message)
    return
  }
  quotes.value = quotes.value.filter((x) => x.id !== q.id)
}
</script>

<template>
  <div class="quotes-page">
    <div class="page-header">
      <h2>Quotes</h2>
      <router-link to="/panel/quotes/new" class="btn btn-primary">
        <i class="bi bi-plus"></i> New Quote
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-5">Loading...</div>
    <div v-else-if="quotes.length === 0" class="card">
      <div class="card-body text-center py-5">
        <p class="text-muted">No quotes yet.</p>
        <router-link to="/panel/quotes/new" class="btn btn-primary">Create your first quote</router-link>
      </div>
    </div>
    <div v-else class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Client</th>
            <th>Company</th>
            <th>Date</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="q in quotes" :key="q.id">
            <td>{{ q.client_name }}</td>
            <td>{{ q.company_name || '-' }}</td>
            <td>{{ formatDate(q.quote_date) }}</td>
            <td>{{ formatCurrency(q.total_amount) }}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary" @click="downloadQuotePDF(q)">PDF</button>
              <button class="btn btn-sm btn-outline-danger" @click="deleteQuote(q)" title="Delete">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}
.btn-primary {
  background: var(--accent-color, #ff5821);
  border-color: var(--accent-color);
}
</style>
