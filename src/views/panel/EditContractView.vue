<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { generateContractPdf, loadLogoAsBase64 } from '../../lib/contractPdf'
import logoWhiteSrc from '../../assets/img/rubens-white.svg?url'

const route = useRoute()
const router = useRouter()
const contract = ref(null)
const loading = ref(true)
const saving = ref(false)
const progress = ref(0)

onMounted(async () => {
  const { data, error } = await supabase.from('contracts').select('*').eq('id', route.params.id).single()
  if (error || !data) {
    router.push('/panel/contracts')
    return
  }
  contract.value = data
  progress.value = data.progress_percent || 0
  loading.value = false
})

async function updateProgress() {
  if (!contract.value) return
  saving.value = true
  await supabase.from('contracts').update({ progress_percent: progress.value, updated_at: new Date().toISOString() }).eq('id', contract.value.id)
  contract.value.progress_percent = progress.value
  saving.value = false
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-US') : '-'
}
function formatCurrency(n) {
  return '$' + parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })
}

async function downloadPDF() {
  const c = contract.value
  if (!c) return
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
    doc.save(`contract-${form.contractId}.pdf`)
  } catch (err) {
    console.error(err)
    alert('Error generating PDF: ' + (err.message || 'Unknown error'))
  }
}
</script>

<template>
  <div class="edit-contract-page" v-if="contract">
    <div class="page-header">
      <h2>Contract: {{ contract.client_name }}</h2>
      <div class="d-flex gap-2">
        <router-link to="/panel/contracts" class="btn btn-outline-secondary">Back</router-link>
        <button class="btn btn-primary" @click="downloadPDF">Download PDF</button>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <p><strong>Client:</strong> {{ contract.client_name }}</p>
        <p><strong>Type:</strong> {{ contract.contract_type }}</p>
        <p><strong>Date:</strong> {{ formatDate(contract.contract_date) }}</p>
        <p><strong>Total:</strong> {{ formatCurrency(contract.total_amount) }}</p>

        <div class="mt-4">
          <label>Project Progress (%)</label>
          <div class="d-flex align-items-center gap-2">
            <input v-model.number="progress" type="range" min="0" max="100" class="form-range" style="width:200px" />
            <span>{{ progress }}%</span>
            <button class="btn btn-sm btn-primary" @click="updateProgress" :disabled="saving">Update</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
