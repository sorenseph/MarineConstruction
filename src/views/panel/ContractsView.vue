<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { generateContractPdf, loadLogoAsBase64 } from '../../lib/contractPdf'
import logoWhiteSrc from '../../assets/img/rubens-white.svg?url'

const router = useRouter()
const contracts = ref([])
const loading = ref(true)

onMounted(async () => {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .order('created_at', { ascending: false })
  if (!error) contracts.value = data || []
  loading.value = false
})

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('en-US')
}

function formatCurrency(n) {
  return '$' + parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })
}

async function downloadContractPDF(c) {
  try {
    const form = {
      contractId: c.contract_id || `MC-${(c.contract_date || '').slice(0, 4)}-${String(c.id).slice(0, 4).toUpperCase()}`,
      issueDate: c.issue_date || c.contract_date,
      effectiveDate: c.effective_date || c.contract_date,
      contractorLegalName: "Ruben's Construction & Repair",
      contractorResidence: 'PO BOX 41, Ruskin, FL 33575',
      companyName: c.company_name,
      legalName: c.client_name,
      residence: c.client_address,
      contractType: c.contract_type,
      contractDate: c.contract_date,
      projectDescription: c.project_description,
      paymentTerms: c.payment_terms,
      items: Array.isArray(c.items) ? c.items : [],
      contractorSignatureName: c.contractor_signature_name,
      clientSignatureName: c.client_signature_name,
      skipContractorSignature: c.skip_contractor_signature,
      skipClientSignature: c.skip_client_signature
    }
    const logoBase64 = await loadLogoAsBase64(logoWhiteSrc)
    const doc = await generateContractPdf({
      form,
      totalAmount: parseFloat(c.total_amount) || 0,
      contractorSignature: c.contractor_signature_data,
      clientSignature: c.client_signature_data,
      contractId: form.contractId,
      logoBase64
    })
    const safeName = (c.client_name || 'contract').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || c.id
    doc.save(`contract-${form.contractId}-${safeName}.pdf`)
  } catch (err) {
    console.error(err)
    alert('Error generating PDF: ' + (err.message || 'Unknown error'))
  }
}

async function deleteContract(c) {
  if (!confirm(`Delete contract for "${c.client_name}"? This cannot be undone.`)) return
  const { error } = await supabase.from('contracts').delete().eq('id', c.id)
  if (error) {
    alert('Error deleting: ' + error.message)
    return
  }
  contracts.value = contracts.value.filter(x => x.id !== c.id)
}
</script>

<template>
  <div class="contracts-page">
    <div class="page-header">
      <h2>Contracts</h2>
      <router-link to="/panel/contracts/new" class="btn btn-primary">
        <i class="bi bi-plus"></i> New Contract
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-5">Loading...</div>
    <div v-else-if="contracts.length === 0" class="card">
      <div class="card-body text-center py-5">
        <p class="text-muted">No contracts yet.</p>
        <router-link to="/panel/contracts/new" class="btn btn-primary">Create your first contract</router-link>
      </div>
    </div>
    <div v-else class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Client / Company</th>
            <th>Type</th>
            <th>Date</th>
            <th>Total</th>
            <th>Progress</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in contracts" :key="c.id">
            <td>{{ c.client_name }}</td>
            <td>{{ c.contract_type }}</td>
            <td>{{ formatDate(c.contract_date) }}</td>
            <td>{{ formatCurrency(c.total_amount) }}</td>
            <td>
              <div class="progress" style="height:20px; width:80px;">
                <div class="progress-bar" :style="{ width: (c.progress_percent || 0) + '%' }"></div>
              </div>
            </td>
            <td>
              <button class="btn btn-sm btn-outline-primary" @click="downloadContractPDF(c)">PDF</button>
              <router-link :to="`/panel/contracts/${c.id}`" class="btn btn-sm btn-outline-secondary">Edit</router-link>
              <button class="btn btn-sm btn-outline-danger" @click="deleteContract(c)" title="Delete">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.btn-primary { background: var(--accent-color, #ff5821); border-color: var(--accent-color); }
</style>
