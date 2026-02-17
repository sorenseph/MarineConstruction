<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import AppHeader from '../components/AppHeader.vue'

const vacancies = ref([])
const loading = ref(true)
const selectedJob = ref(null)
const form = ref({
  vacancy_id: '',
  applicant_name: '',
  applicant_email: '',
  applicant_phone: '',
  cover_letter: ''
})
const submitted = ref(false)
const submitting = ref(false)
const formRef = ref(null)

onMounted(async () => {
  const { data, error } = await supabase
    .from('job_vacancies')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
  if (!error) vacancies.value = data || []
  loading.value = false
})

function applyForJob(vacancy) {
  selectedJob.value = vacancy
  form.value = {
    vacancy_id: vacancy?.id || '',
    applicant_name: '',
    applicant_email: '',
    applicant_phone: '',
    cover_letter: ''
  }
  submitted.value = false
  setTimeout(() => formRef.value?.scrollIntoView({ behavior: 'smooth' }), 100)
}

async function submitApplication(e) {
  e.preventDefault()
  if (!form.value.applicant_name?.trim() || !form.value.applicant_email?.trim()) {
    alert('Please fill in name and email.')
    return
  }
  submitting.value = true
  const vacancyId = form.value.vacancy_id || null
  const { error } = await supabase.from('job_applications').insert({
    vacancy_id: vacancyId,
    applicant_name: form.value.applicant_name.trim(),
    applicant_email: form.value.applicant_email.trim(),
    applicant_phone: form.value.applicant_phone?.trim() || null,
    cover_letter: form.value.cover_letter?.trim() || null
  })
  submitting.value = false
  if (error) {
    alert('Error: ' + error.message)
    return
  }
  submitted.value = true
  selectedJob.value = null
  form.value = { vacancy_id: '', applicant_name: '', applicant_email: '', applicant_phone: '', cover_letter: '' }
}
</script>

<template>
  <div class="careers-page">
    <AppHeader />

    <main class="main">
    <section class="section light-background py-5">
    <div class="container">
      <h1>Careers - Ruben's Construction</h1>
      <p class="lead">Join our team of marine construction professionals</p>

      <section class="vacancies-section mt-5">
        <h2>Open Positions</h2>
        <div v-if="loading" class="text-center py-5">Loading...</div>
        <div v-else-if="vacancies.length === 0" class="alert alert-info">
          No open positions at the moment. Send us your profile and we'll contact you when we have opportunities.
        </div>
        <div v-else class="row g-3">
          <div v-for="v in vacancies" :key="v.id" class="col-md-6 col-lg-4">
            <div class="card h-100 job-card">
              <div class="card-body">
                <h5 class="card-title">{{ v.title }}</h5>
                <p v-if="v.location" class="text-muted mb-1"><i class="bi bi-geo-alt"></i> {{ v.location }}</p>
                <p v-if="v.description" class="card-text small">{{ v.description }}</p>
                <p v-if="v.requirements" class="small text-muted"><strong>Requirements:</strong> {{ v.requirements }}</p>
                <button class="btn btn-primary btn-sm mt-2" @click="applyForJob(v)">
                  <i class="bi bi-send"></i> Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref="formRef" class="application-section mt-5">
        <h2>Submit Your Application</h2>
        <p v-if="selectedJob" class="text-success"><strong>Applying for: {{ selectedJob.title }}</strong></p>
        <div v-if="submitted" class="alert alert-success">
          Thank you! Your application has been submitted. We'll be in touch.
        </div>
        <form v-else @submit="submitApplication" class="card p-4 mt-3">
          <div class="row g-3">
            <div class="col-md-6">
              <label>Full Name *</label>
              <input v-model="form.applicant_name" type="text" class="form-control" required placeholder="Your name" />
            </div>
            <div class="col-md-6">
              <label>Email *</label>
              <input v-model="form.applicant_email" type="email" class="form-control" required placeholder="email@example.com" />
            </div>
            <div class="col-md-6">
              <label>Phone</label>
              <input v-model="form.applicant_phone" type="tel" class="form-control" placeholder="(813) 555-1234" />
            </div>
            <div class="col-12">
              <label>Position of interest</label>
              <select v-model="form.vacancy_id" class="form-select">
                <option value="">Select (optional)</option>
                <option v-for="v in vacancies" :key="v.id" :value="v.id">{{ v.title }}</option>
                <option value="">General application</option>
              </select>
            </div>
            <div class="col-12">
              <label>Cover Letter / Experience</label>
              <textarea v-model="form.cover_letter" class="form-control" rows="4" placeholder="Tell us about your experience and why you'd like to join our team"></textarea>
            </div>
            <div class="col-12">
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                {{ submitting ? 'Submitting...' : 'Submit Application' }}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
    </section>
    </main>
  </div>
</template>

<style scoped>
.careers-page .main { min-height: 60vh; }
.btn-primary { background: var(--accent-color, #ff5821); border-color: var(--accent-color); }
.job-card { transition: box-shadow 0.2s; border: 1px solid rgba(0,0,0,.08); }
.job-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
</style>
