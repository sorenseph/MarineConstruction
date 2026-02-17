<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'

const contracts = ref([])
const loading = ref(true)
const savingId = ref(null)

onMounted(async () => {
  const { data, error } = await supabase.from('contracts').select('*').order('created_at', { ascending: false })
  if (!error) contracts.value = data || []
  loading.value = false
})

const clients = computed(() => {
  const map = new Map()
  contracts.value.forEach(c => {
    const key = (c.client_name || c.company_name || '').trim().toLowerCase()
    if (!key) return
    if (!map.has(key)) {
      map.set(key, {
        name: c.client_name || c.company_name,
        company: c.company_name,
        address: c.client_address,
        contracts: [],
        progress: 0
      })
    }
    const client = map.get(key)
    client.contracts.push(c)
    const totalProg = client.contracts.reduce((s, x) => s + (x.progress_percent || 0), 0)
    client.progress = Math.round(totalProg / client.contracts.length)
  })
  return Array.from(map.values())
})

async function saveProgress(contract, value) {
  savingId.value = contract.id
  await supabase
    .from('contracts')
    .update({ progress_percent: value, updated_at: new Date().toISOString() })
    .eq('id', contract.id)
  contract.progress_percent = value
  savingId.value = null
}
</script>

<template>
  <div class="clients-page">
    <h2>Clients & Projects</h2>
    <p class="text-muted">Clients from your contracts. Drag the progress bar and it saves automatically.</p>

    <div v-if="loading" class="text-center py-5">Loading...</div>
    <div v-else-if="clients.length === 0" class="card">
      <div class="card-body text-center py-5 text-muted">No clients yet. Create a contract first.</div>
    </div>
    <div v-else class="row g-3">
      <div v-for="client in clients" :key="client.name" class="col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ client.name }}</h5>
            <p v-if="client.company" class="card-text small">{{ client.company }}</p>
            <p v-if="client.address" class="card-text small text-muted">{{ client.address }}</p>
            <div v-for="con in client.contracts" :key="con.id" class="mt-3 border-top pt-2">
              <div class="d-flex justify-content-between small mb-1">
                <span>Contract {{ con.contract_date || con.id?.slice(0, 8) }}</span>
                <span>{{ con.progress_percent ?? 0 }}%</span>
              </div>
              <div class="d-flex align-items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  :value="con.progress_percent ?? 0"
                  class="form-range flex-grow-1"
                  @input="saveProgress(con, parseInt($event.target.value))"
                />
                <span v-if="savingId === con.id" class="text-muted small">Saving...</span>
              </div>
            </div>
            <p class="small mt-2 text-muted">Contracts: {{ client.contracts.length }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
