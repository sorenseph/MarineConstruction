<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'

const vacancies = ref([])
const applications = ref([])
const loading = ref(true)
const showVacancyForm = ref(false)
const vacancyForm = ref({ title: '', description: '', location: '', requirements: '', status: 'open' })
const saveError = ref('')

onMounted(async () => {
  const [vRes, aRes] = await Promise.all([
    supabase.from('job_vacancies').select('*').order('created_at', { ascending: false }),
    supabase.from('job_applications').select('*').order('created_at', { ascending: false })
  ])
  if (!vRes.error) vacancies.value = vRes.data || []
  if (!aRes.error) applications.value = aRes.data || []
  loading.value = false
})

async function saveVacancy(e) {
  e.preventDefault()
  saveError.value = ''
  const { error } = await supabase.from('job_vacancies').insert({
    title: vacancyForm.value.title,
    description: vacancyForm.value.description || null,
    location: vacancyForm.value.location || null,
    requirements: vacancyForm.value.requirements || null,
    status: vacancyForm.value.status
  })
  if (error) {
    saveError.value = error.message + (error.message.includes('job_vacancies') ? ' Run supabase-tables.sql in Supabase SQL Editor.' : '')
    return
  }
  showVacancyForm.value = false
  vacancyForm.value = { title: '', description: '', location: '', requirements: '', status: 'open' }
  const { data } = await supabase.from('job_vacancies').select('*').order('created_at', { ascending: false })
  vacancies.value = data || []
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : '-'
}

function vacancyTitle(id) {
  const v = vacancies.value.find(x => x.id === id)
  return v?.title || (id ? 'Position' : '-')
}

async function deleteVacancy(v) {
  if (!confirm(`Delete vacancy "${v.title}"?`)) return
  const { error } = await supabase.from('job_vacancies').delete().eq('id', v.id)
  if (!error) {
    vacancies.value = vacancies.value.filter(x => x.id !== v.id)
  } else {
    alert('Error deleting: ' + error.message)
  }
}
</script>

<template>
  <div class="jobs-admin">
    <div class="page-header">
      <h2>Jobs & Careers</h2>
      <button class="btn btn-primary" @click="showVacancyForm = true">
        <i class="bi bi-plus"></i> New Vacancy
      </button>
    </div>

    <div v-if="showVacancyForm" class="card mb-4">
      <div class="card-body">
        <h5>New Job Vacancy</h5>
        <div v-if="saveError" class="alert alert-danger">{{ saveError }}</div>
        <form @submit="saveVacancy">
          <div class="row g-2">
            <div class="col-md-6"><label>Title</label><input v-model="vacancyForm.title" class="form-control" required /></div>
            <div class="col-md-6"><label>Location</label><input v-model="vacancyForm.location" class="form-control" /></div>
          </div>
          <div class="form-group mt-2">
            <label>Description</label>
            <textarea v-model="vacancyForm.description" class="form-control" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Requirements</label>
            <textarea v-model="vacancyForm.requirements" class="form-control" rows="2"></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Publish</button>
          <button type="button" class="btn btn-outline-secondary ms-2" @click="showVacancyForm = false">Cancel</button>
        </form>
      </div>
    </div>

    <h5>Open Positions</h5>
    <div v-if="loading">Loading...</div>
    <div v-else class="list-group mb-4">
      <div v-for="v in vacancies" :key="v.id" class="list-group-item d-flex justify-content-between align-items-start">
        <div>
          <strong>{{ v.title }}</strong>
          <span v-if="v.location" class="text-muted ms-2">{{ v.location }}</span>
          <span :class="['badge ms-2', v.status === 'open' ? 'bg-success' : 'bg-secondary']">{{ v.status }}</span>
          <p v-if="v.description" class="small mt-1 mb-0">{{ v.description }}</p>
        </div>
        <button class="btn btn-outline-danger btn-sm" @click="deleteVacancy(v)" title="Delete vacancy">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>

    <h5>Applications</h5>
    <div class="table-responsive">
      <table class="table">
        <thead><tr><th>Name</th><th>Email</th><th>Position</th><th>Date</th></tr></thead>
        <tbody>
          <tr v-for="a in applications" :key="a.id">
            <td>{{ a.applicant_name }}</td>
            <td>{{ a.applicant_email }}</td>
            <td>{{ vacancyTitle(a.vacancy_id) }}</td>
            <td>{{ formatDate(a.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.form-group { margin-bottom: 12px; }
.form-group label { display: block; margin-bottom: 4px; }
</style>
