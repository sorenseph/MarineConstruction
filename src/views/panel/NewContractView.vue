<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { supabase } from '../../lib/supabase'
import { generateContractPdf, generateContractIdForNew } from '../../lib/contractPdf'
import logoWhiteSrc from '../../assets/img/rubens-white.svg?url'

const router = useRouter()
const { currentUser } = useAuth()

const CONTRACT_TYPES = [
  { value: 'construction', label: 'Construction', labelEs: 'Construcción' },
  { value: 'repair', label: 'Repair', labelEs: 'Reparación' },
  { value: 'remodeling', label: 'Remodeling', labelEs: 'Remodelación' },
  { value: 'maintenance', label: 'Maintenance', labelEs: 'Mantenimiento' },
  { value: 'inspection', label: 'Inspection', labelEs: 'Inspección' }
]

const today = new Date().toISOString().split('T')[0]
const form = ref({
  contractId: '',
  issueDate: today,
  effectiveDate: today,
  companyName: '',
  legalName: '',
  contractorLegalName: 'Ruben\'s Construction & Repair',
  residence: '',
  contractorResidence: 'PO BOX 41, Ruskin, FL 33575',
  contractType: 'construction',
  contractDate: today,
  language: 'en',
  projectDescription: '',
  paymentTerms: 'Initial Deposit: As agreed | Progress Payments: As agreed upon milestones | Final Payment: Upon substantial completion.',
  items: [{ description: '', price: 0 }],
  contractorSignatureName: '',
  clientSignatureName: '',
  skipContractorSignature: false,
  skipClientSignature: false
})

onMounted(() => {
  form.value.contractId = generateContractIdForNew()
})

const showPreview = ref(false)
const isDrawing = ref(false)
const canvasRef = ref(null)
const contractorSignature = ref(null)
const clientSignature = ref(null)
const saving = ref(false)
const activeSignature = ref(null)

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

const contractText = computed(() => {
  const t = form.value.contractType
  const type = CONTRACT_TYPES.find(x => x.value === t)
  const typeLabel = type?.label || t
  const typeLabelEs = type?.labelEs || typeLabel
  const lang = form.value.language
  if (lang === 'es') {
    return `CONTRATO DE ${typeLabelEs.toUpperCase()} MARINO

Por medio del presente documento, el CONTRATISTA ${form.value.contractorLegalName}, con domicilio en ${form.value.contractorResidence}, y el CLIENTE ${form.value.companyName || form.value.legalName}, representado por ${form.value.legalName}, con domicilio en ${form.value.residence}, convienen en celebrar el presente contrato para la realización de trabajos de ${typeLabelEs.toLowerCase()} en bienes inmuebles marinos.

Fecha del contrato: ${form.value.contractDate}

El Contratista se compromete a realizar los trabajos descritos en el desglose adjunto, utilizando materiales de primera calidad y siguiendo las normas de la industria. El Cliente se compromete a realizar los pagos según los términos acordados.

El total del contrato asciende a la cantidad de $${totalAmount.value.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD.

Ambas partes acuerdan que este contrato constituye el acuerdo completo entre las mismas.`
  }
  return `MARINE ${typeLabel.toUpperCase()} CONTRACT

This Agreement is entered into between the CONTRACTOR ${form.value.contractorLegalName}, with address at ${form.value.contractorResidence}, and the CLIENT ${form.value.companyName || form.value.legalName}, represented by ${form.value.legalName}, with address at ${form.value.residence}, for the performance of ${typeLabel.toLowerCase()} work on marine property.

Contract Date: ${form.value.contractDate}

The Contractor agrees to perform the work described in the attached itemized list, using quality materials and following industry standards. The Client agrees to make payments according to the agreed terms.

The total contract amount is $${totalAmount.value.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD.

Both parties agree that this contract constitutes the complete agreement between them.`
})

function startDrawing(e) {
  if (!activeSignature.value) return
  isDrawing.value = true
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const ctx = canvas.getContext('2d')
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
}

function draw(e) {
  if (!isDrawing.value || !activeSignature.value) return
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const ctx = canvas.getContext('2d')
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
  ctx.stroke()
}

function stopDrawing() {
  if (isDrawing.value && activeSignature.value) {
    const canvas = canvasRef.value
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png')
      if (activeSignature.value === 'contractor') contractorSignature.value = dataUrl
      else clientSignature.value = dataUrl
    }
  }
  isDrawing.value = false
}

function clearSignature(which) {
  if (which === 'contractor') contractorSignature.value = null
  else clientSignature.value = null
  activeSignature.value = which
  setTimeout(() => {
    const canvas = canvasRef.value
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, 50)
}

function startSign(which) {
  activeSignature.value = which
}

watch(activeSignature, async (val) => {
  if (val) {
    await nextTick()
    const canvas = canvasRef.value
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
    }
  }
})

async function saveContract() {
  saving.value = true
  try {
    const clientName = (form.value.companyName || form.value.legalName || '').trim()
    if (!clientName) {
      alert('Please enter Company/Client name or Legal name.')
      saving.value = false
      return
    }

    const userId = null
    const base = {
      user_id: userId,
      client_name: clientName,
      company_name: form.value.companyName || null,
      client_address: form.value.residence || null,
      contract_type: form.value.contractType,
      contract_date: form.value.contractDate,
      language: form.value.language,
      items: form.value.items,
      total_amount: totalAmount.value,
      contractor_signature_name: form.value.contractorSignatureName || null,
      contractor_signature_data: form.value.skipContractorSignature ? null : (contractorSignature.value || null),
      client_signature_name: form.value.clientSignatureName || null,
      client_signature_data: form.value.skipClientSignature ? null : (clientSignature.value || null),
      skip_contractor_signature: form.value.skipContractorSignature,
      skip_client_signature: form.value.skipClientSignature,
      status: 'saved',
      progress_percent: 0
    }

    const fullPayload = {
      ...base,
      contract_id: form.value.contractId || null,
      issue_date: form.value.issueDate || null,
      effective_date: form.value.effectiveDate || null,
      project_description: form.value.projectDescription || null,
      payment_terms: form.value.paymentTerms || null
    }

    let { error } = await supabase.from('contracts').insert(fullPayload)

    if (error && /column .* does not exist|relation .* does not exist|schema cache|Could not find .* column/i.test(error.message)) {
      const res = await supabase.from('contracts').insert(base)
      if (res.error) throw res.error
      console.warn('Schema: run "npm run db:push" for Contract ID, Issue/Effective Date, Payment Terms')
    } else if (error) {
      throw error
    }
    router.push('/panel/contracts')
  } catch (err) {
    console.error(err)
    const msg = err.message || ''
    alert('Error saving contract: ' + msg + '\n\nIf tables are missing, run: npm run db:push')
  } finally {
    saving.value = false
  }
}

async function downloadPDF() {
  try {
    const { loadLogoAsBase64 } = await import('../../lib/contractPdf')
    const logoBase64 = await loadLogoAsBase64(logoWhiteSrc)
    const doc = await generateContractPdf({
      form: form.value,
      totalAmount: totalAmount.value,
      contractorSignature: contractorSignature.value,
      clientSignature: clientSignature.value,
      contractId: form.value.contractId || generateContractIdForNew(),
      logoBase64
    })
    const safeName = (form.value.companyName || form.value.legalName || 'client').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || 'contract'
    doc.save(`contract-${form.value.contractId || form.value.contractDate}-${safeName}.pdf`)
  } catch (err) {
    console.error(err)
    alert('Error generating PDF: ' + (err.message || 'Unknown error'))
  }
}
</script>

<template>
  <div class="contract-form-page">
    <div class="page-header">
      <h2>New Contract</h2>
      <router-link to="/panel/contracts" class="btn btn-outline-secondary">Back</router-link>
    </div>

    <div v-if="!showPreview" class="form-section card">
      <div class="card-body">
        <h5>Contract Details</h5>
        <div class="row g-3">
          <div class="col-md-4">
            <label>Contract ID</label>
            <input v-model="form.contractId" type="text" class="form-control" readonly placeholder="MC-2026-XXXX" />
            <small class="text-muted">Auto-generated unique ID</small>
          </div>
          <div class="col-md-4">
            <label>Issue Date</label>
            <input v-model="form.issueDate" type="date" class="form-control" />
          </div>
          <div class="col-md-4">
            <label>Effective Date</label>
            <input v-model="form.effectiveDate" type="date" class="form-control" />
          </div>
          <div class="col-md-6">
            <label>Company / Client Name</label>
            <input v-model="form.companyName" type="text" class="form-control" placeholder="Company or client name" />
          </div>
          <div class="col-md-6">
            <label>Legal Name (Person signing)</label>
            <input v-model="form.legalName" type="text" class="form-control" placeholder="Full legal name" />
          </div>
          <div class="col-12">
            <label>Client Address / Residence</label>
            <input v-model="form.residence" type="text" class="form-control" placeholder="Address, City, State, ZIP" />
          </div>
          <div class="col-12">
            <label>Project Description (Scope of Work)</label>
            <textarea v-model="form.projectDescription" class="form-control" rows="3" placeholder="Dock construction, seawall installation, pile driving, marine foundation work, coastal reinforcement, etc."></textarea>
          </div>
          <div class="col-md-6">
            <label>Contract Type</label>
            <select v-model="form.contractType" class="form-select">
              <option v-for="t in CONTRACT_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
          </div>
          <div class="col-md-6">
            <label>Contract Date</label>
            <input v-model="form.contractDate" type="date" class="form-control" />
          </div>
          <div class="col-md-6">
            <label>Contract Language (for final section)</label>
            <select v-model="form.language" class="form-select">
              <option value="en">English</option>
              <option value="es">Spanish</option>
            </select>
          </div>
        </div>

        <h5 class="mt-4">Payment Terms</h5>
        <textarea v-model="form.paymentTerms" class="form-control mb-3" rows="2" placeholder="Initial Deposit: As agreed | Progress Payments: As agreed upon milestones | Final Payment: Upon substantial completion."></textarea>

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

        <h5 class="mt-4">Signatures</h5>
        <div class="row g-3">
          <div class="col-md-6">
            <label>Contractor Name (for signature)</label>
            <input v-model="form.contractorSignatureName" type="text" class="form-control" placeholder="Name" />
            <label class="mt-2">
              <input v-model="form.skipContractorSignature" type="checkbox" /> Skip signature (leave blank for manual)
            </label>
          </div>
          <div class="col-md-6">
            <label>Client Name (for signature)</label>
            <input v-model="form.clientSignatureName" type="text" class="form-control" placeholder="Name" />
            <label class="mt-2">
              <input v-model="form.skipClientSignature" type="checkbox" /> Skip signature (leave blank for manual)
            </label>
          </div>
        </div>

        <div class="mt-4">
          <button class="btn btn-primary" @click="showPreview = true">Preview Contract</button>
        </div>
      </div>
    </div>

    <div v-else class="preview-section">
      <div class="card">
        <div class="card-body">
          <h5>Contract Preview</h5>
          <div class="preview-content">
            <pre>{{ contractText }}</pre>
            <table class="table table-bordered mt-3">
              <thead><tr><th>Description</th><th>Amount ($)</th></tr></thead>
              <tbody>
                <tr v-for="(item, i) in form.items" :key="i">
                  <td>{{ item.description || '-' }}</td>
                  <td>${{ parseFloat(item.price || 0).toFixed(2) }}</td>
                </tr>
              </tbody>
              <tfoot><tr><th>Total</th><th>${{ totalAmount.toFixed(2) }}</th></tr></tfoot>
            </table>
          </div>

          <div v-if="!form.skipContractorSignature || !form.skipClientSignature" class="signature-area mt-4">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label>Contractor Signature</label>
                <div v-if="!form.skipContractorSignature">
                  <div v-if="contractorSignature" class="sig-preview">
                    <img :src="contractorSignature" alt="Signature" style="max-width:200px; height:50px; border:1px solid #ddd;" />
                    <button type="button" class="btn btn-sm btn-link" @click="clearSignature('contractor')">Clear</button>
                  </div>
                  <button v-else type="button" class="btn btn-sm btn-outline-secondary" @click="startSign('contractor')">
                    Sign here
                  </button>
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <label>Client Signature</label>
                <div v-if="!form.skipClientSignature">
                  <div v-if="clientSignature" class="sig-preview">
                    <img :src="clientSignature" alt="Signature" style="max-width:200px; height:50px; border:1px solid #ddd;" />
                    <button type="button" class="btn btn-sm btn-link" @click="clearSignature('client')">Clear</button>
                  </div>
                  <button v-else type="button" class="btn btn-sm btn-outline-secondary" @click="startSign('client')">
                    Sign here
                  </button>
                </div>
              </div>
            </div>
            <div v-if="activeSignature" class="signature-pad mt-2">
              <p class="small">Draw {{ activeSignature === 'contractor' ? 'contractor' : 'client' }} signature below:</p>
              <canvas
                ref="canvasRef"
                width="300"
                height="80"
                class="signature-canvas"
                @mousedown="startDrawing"
                @mousemove="draw"
                @mouseup="stopDrawing"
                @mouseleave="stopDrawing"
              ></canvas>
              <button type="button" class="btn btn-sm btn-outline-secondary mt-2" @click="activeSignature = null">Done</button>
            </div>
          </div>

          <div class="d-flex gap-2 mt-4">
            <button class="btn btn-outline-secondary" @click="showPreview = false">Back to Edit</button>
            <button class="btn btn-outline-primary" @click="downloadPDF">Download PDF</button>
            <button class="btn btn-primary" @click="saveContract" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Contract' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contract-form-page .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.form-control, .form-select { padding: 8px 12px; }
.signature-canvas { border: 1px solid #ccc; border-radius: 4px; cursor: crosshair; display: block; }
.sig-preview { margin-top: 8px; }
.preview-content pre { white-space: pre-wrap; font-size: 13px; }
</style>
