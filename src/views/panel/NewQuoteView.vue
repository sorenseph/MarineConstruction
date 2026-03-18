<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { supabase } from '../../lib/supabase'
import { generateQuotePdf, generateQuoteId, loadLogoAsBase64 } from '../../lib/quotePdf'
import logoWhiteSrc from '../../assets/img/rubens-white.svg?url'

const router = useRouter()
const { currentUser } = useAuth()

const today = new Date().toISOString().split('T')[0]
const form = ref({
  quoteId: '',
  quoteDate: today,
  validUntil: '',
  clientName: '',
  companyName: '',
  clientAddress: '',
  preparedBy: '',
  items: [{ description: '', price: 0 }],
  disclaimer:
    "This quote is valid for 30 days from the date of issue unless otherwise specified. Prices may be subject to change based on material availability and project scope. This is an estimate and not a binding contract until both parties have signed a formal agreement."
})

onMounted(() => {
  form.value.quoteId = generateQuoteId()
  const d = new Date()
  d.setDate(d.getDate() + 30)
  form.value.validUntil = d.toISOString().split('T')[0]
})

const totalAmount = computed(() => {
  return form.value.items.reduce((sum, item) => {
    const p = parseFloat(item.price) || 0
    return sum + p
  }, 0)
})

function addItem() {
  form.value.items.push({ description: '', price: 0 })
}

function removeItem(index) {
  if (form.value.items.length > 1) {
    form.value.items.splice(index, 1)
  }
}

const saving = ref(false)

async function saveQuote() {
  const clientName = (form.value.clientName || form.value.companyName || '').trim()
  if (!clientName) {
    alert('Please enter Client name or Company name.')
    return
  }

  saving.value = true
  try {
    const payload = {
      quote_id: form.value.quoteId,
      quote_date: form.value.quoteDate,
      valid_until: form.value.validUntil || null,
      client_name: clientName,
      company_name: form.value.companyName || null,
      client_address: form.value.clientAddress || null,
      prepared_by: form.value.preparedBy || (currentUser.value?.display_name || currentUser.value?.username) || null,
      items: form.value.items,
      total_amount: totalAmount.value,
      disclaimer: form.value.disclaimer || null
    }

    const { error } = await supabase.from('quotes').insert(payload)
    if (error) throw error
    router.push('/panel/quotes')
  } catch (err) {
    console.error(err)
    alert('Error saving quote: ' + (err.message || 'Unknown error'))
  } finally {
    saving.value = false
  }
}

async function downloadPDF() {
  try {
    const logoBase64 = await loadLogoAsBase64(logoWhiteSrc)
    const doc = await generateQuotePdf({
      clientName: form.value.clientName,
      companyName: form.value.companyName,
      clientAddress: form.value.clientAddress,
      preparedBy: form.value.preparedBy || currentUser.value?.display_name || currentUser.value?.username,
      items: form.value.items,
      totalAmount: totalAmount.value,
      disclaimer: form.value.disclaimer,
      quoteId: form.value.quoteId,
      quoteDate: form.value.quoteDate,
      validUntil: form.value.validUntil,
      logoBase64
    })
    const safeName = (form.value.clientName || form.value.companyName || 'quote').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || 'quote'
    doc.save(`quote-${form.value.quoteId}-${safeName}.pdf`)
  } catch (err) {
    console.error(err)
    alert('Error generating PDF: ' + (err.message || 'Unknown error'))
  }
}
</script>

<template>
  <div class="quote-form-page">
    <div class="page-header">
      <h2>New Quote</h2>
      <router-link to="/panel/quotes" class="btn btn-outline-secondary">Back</router-link>
    </div>

    <div class="card">
      <div class="card-body">
        <h5>Quote Details</h5>
        <div class="row g-3">
          <div class="col-md-4">
            <label>Quote ID</label>
            <input v-model="form.quoteId" type="text" class="form-control" readonly placeholder="QT-2026-XXXX" />
          </div>
          <div class="col-md-4">
            <label>Date</label>
            <input v-model="form.quoteDate" type="date" class="form-control" />
          </div>
          <div class="col-md-4">
            <label>Valid Until</label>
            <input v-model="form.validUntil" type="date" class="form-control" />
          </div>
          <div class="col-md-6">
            <label>Client Name</label>
            <input v-model="form.clientName" type="text" class="form-control" placeholder="Full name" />
          </div>
          <div class="col-md-6">
            <label>Company Name (optional)</label>
            <input v-model="form.companyName" type="text" class="form-control" placeholder="Company" />
          </div>
          <div class="col-12">
            <label>Client Address</label>
            <input v-model="form.clientAddress" type="text" class="form-control" placeholder="Address, City, State, ZIP" />
          </div>
          <div class="col-12">
            <label>Prepared by</label>
            <input v-model="form.preparedBy" type="text" class="form-control" :placeholder="currentUser?.display_name || 'Your name'" />
          </div>
        </div>

        <h5 class="mt-4">Items & Pricing</h5>
        <div v-for="(item, i) in form.items" :key="i" class="row g-2 mb-2 align-items-end">
          <div class="col-md-7">
            <label>Description</label>
            <input v-model="item.description" type="text" class="form-control" placeholder="Work description" />
          </div>
          <div class="col-md-3">
            <label>Price ($)</label>
            <input v-model.number="item.price" type="number" step="0.01" min="0" class="form-control" placeholder="0.00" />
          </div>
          <div class="col-md-2">
            <button type="button" class="btn btn-outline-danger btn-sm" @click="removeItem(i)" :disabled="form.items.length === 1">
              Remove
            </button>
          </div>
        </div>
        <button type="button" class="btn btn-outline-primary" @click="addItem">
          <i class="bi bi-plus"></i> Add Item
        </button>

        <div class="mt-3">
          <strong>Total: ${{ totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</strong>
        </div>

        <h5 class="mt-4">Disclaimer</h5>
        <textarea v-model="form.disclaimer" class="form-control" rows="4" placeholder="Quote disclaimer text..."></textarea>

        <div class="d-flex gap-2 mt-4 flex-wrap">
          <button class="btn btn-outline-primary" @click="downloadPDF">Download PDF</button>
          <button class="btn btn-primary" @click="saveQuote" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save Quote' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quote-form-page .page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}
.form-control,
.form-select {
  padding: 8px 12px;
}
.btn-primary {
  background: var(--accent-color, #ff5821);
  border-color: var(--accent-color);
}
</style>
