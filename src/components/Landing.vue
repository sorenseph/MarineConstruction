<script setup>
import { ref, onMounted } from 'vue'
import Swiper from 'swiper/bundle'
import GLightbox from 'glightbox'

const faqs = ref([
  { q: 'How long does a typical dock construction project take?', a: 'Dock construction can vary, but most projects are completed within 4-8 weeks, depending on size and complexity.', open: true },
  { q: 'What maintenance is required for a boat lift?', a: 'Regular maintenance includes checking for rust, ensuring smooth operation of pulleys and belts, and inspecting cables.', open: false },
  { q: 'Are your marine flooring options suitable for all weather conditions?', a: 'Yes, our marine flooring solutions are designed to withstand harsh weather and marine environments.', open: false },
  { q: 'How do I get a quote for seaside infrastructure repairs?', a: 'Contact us for a free consultation. We’ll assess your needs and provide a custom quote based on the scope of work.', open: false },
  { q: 'Do you offer emergency repair services?', a: 'Yes, we offer emergency repair services to address urgent issues with docks, boat lifts, and other marine structures.', open: false }
])

function toggleFAQ(i) { faqs.value[i].open = !faqs.value[i].open }

const form = ref({ name: '', email: '', message: '' })
const sending = ref(false)

const newsletter = ref({ email: '' })
const sendingNewsletter = ref(false)
const toast = ref('')
const chatOpen = ref(false)
const chatMessages = ref([])

const questions = [
  { q: 'What services do you offer?', a: 'We offer dock construction and repair, boat lift installation and maintenance, marine flooring solutions, seawall repairs, and more.' },
  { q: 'How long does a typical project take?', a: 'Typical dock construction projects take 4-8 weeks, depending on size and complexity.' },
  { q: 'Do you offer emergency repairs?', a: 'Yes, we offer emergency repair services for docks, boat lifts, and marine structures.' },
  { q: 'How to get a quote?', a: 'Contact us for a free consultation. We’ll assess your needs and provide a custom quote.' },
  { q: 'Where are you located?', a: 'We are located in Ruskin, FL 33575. We serve areas like Tampa, Apollo Beach, Gibsonton, and surrounding areas.' },
  { q: 'Do you work with wood or composite?', a: 'We work with both materials. Wood is aesthetically pleasing, while composite is durable and low-maintenance.' },
  { q: 'Do you offer boat lift maintenance?', a: 'Yes, we install and maintain boat lifts, including routine inspections and repairs.' },
  { q: 'What areas do you cover?', a: 'We cover Tampa, Apollo Beach, Gibsonton, Ruskin, Riverview, South Shore, Bradenton, Lake Mango, and Lake Thonotosassa.' }
]

const services = ref([
  { img: '/assets/img/work/3.jpeg', title: 'Dock Repair', desc: 'Boat Docks and Dock Repair', gallery: 'Dock Repair', filter: 'filter-app', hasDetails: false },
  { img: '/assets/img/work/7.jpeg', title: 'Seawall Repair', desc: 'Repair or replace your residential, commercial, or industrial seawall', gallery: 'Seawall Repair', filter: 'filter-product', hasDetails: false },
  { img: '/assets/img/work/6.jpeg', title: 'Boat Lifts', desc: 'Install the perfect boat lift on your waterfront property', gallery: 'Boat Lifts', filter: 'filter-branding', hasDetails: false },
  { img: '/assets/img/work/41.jpeg', title: 'Boat Lifts', desc: 'Install the perfect boat lift on your waterfront property', gallery: 'Boat Lifts', filter: 'filter-app', hasDetails: false },
  { img: '/assets/img/work/19.jpeg', title: 'Deck Construction', desc: 'We have a tremendous amount of experience with new decks in the back of a residential house and sprawling decks around the pools and common areas of apartment complexes and resorts.', gallery: 'Deck Construction', filter: 'filter-product', hasDetails: true },
  { img: '/assets/img/work/34.jpeg', title: 'Wood Boat Docks', desc: 'Wood docks are an aesthetically pleasing, natural material to use in building your boat dock.', gallery: 'Wood Boat Docks', filter: 'filter-branding', hasDetails: false },
  { img: '/assets/img/work/1.jpeg', title: 'Composite Docks', desc: 'Ruben\'s Construction & Repair builds many boat docks with composite material every year in the South Shore area.', gallery: 'Composite Docks', filter: 'filter-app', hasDetails: false },
  { img: '/assets/img/work/5.jpeg', title: 'Bulk Heads', desc: 'Call Ruben\'s Construction & Repair if you need to repair or replace your residential, commercial, or industrial seawall. We have thirty years experience with bulkheads and seawalls all along Tampa Bay in Apollo Beach, Gibsonton, and Ruskin.', gallery: 'Bulk Heads', filter: 'filter-product', hasDetails: true },
  { img: '/assets/img/work/27.jpeg', title: 'Deck Construction', desc: 'Ruben\'s Construction & Repair will present a free estimate on all decks, big or small.', gallery: 'Deck Construction', filter: 'filter-branding', hasDetails: false }
])

function submit(e) {
  e.preventDefault()
  if (!form.value.name.trim()) {
    showToast('Por favor ingresa tu nombre.')
    return
  }
  if (!form.value.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    showToast('Por favor ingresa un correo electrónico válido.')
    return
  }
  if (!form.value.message.trim()) {
    showToast('Por favor ingresa un mensaje.')
    return
  }
  sending.value = true
  const formData = new FormData()
  formData.append('name', form.value.name)
  formData.append('email', form.value.email)
  formData.append('_replyto', form.value.email)
  formData.append('message', form.value.message)
  fetch('https://formspree.io/f/mqelnzrj', {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      sending.value = false
      showToast('Mensaje enviado exitosamente.')
      form.value = { name: '', email: '', message: '' }
    } else {
      throw new Error('Error en el envío')
    }
  })
  .catch((error) => {
    sending.value = false
    showToast('Error al enviar el mensaje: ' + error.message)
  })
}

function submitNewsletter(e) {
  e.preventDefault()
  if (!newsletter.value.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletter.value.email)) {
    showToast('Por favor ingresa un correo electrónico válido.')
    return
  }
  sendingNewsletter.value = true
  const formData = new FormData()
  formData.append('email', newsletter.value.email)
  formData.append('_replyto', newsletter.value.email)
  fetch('https://formspree.io/f/mqelnzrj', {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      sendingNewsletter.value = false
      showToast('Suscripción exitosa.')
      newsletter.value = { email: '' }
    } else {
      throw new Error('Error en la suscripción')
    }
  })
  .catch((error) => {
    sendingNewsletter.value = false
    showToast('Error al suscribir: ' + error.message)
  })
}

function showToast(message) {
  toast.value = message
  setTimeout(() => toast.value = '', 3000)
}

function toggleChat() {
  chatOpen.value = !chatOpen.value
}

function askQuestion(index) {
  const q = questions[index]
  chatMessages.value.push({ type: 'user', text: q.q })
  setTimeout(() => {
    chatMessages.value.push({ type: 'bot', text: q.a })
  }, 500)
}

function resetChat() {
  chatMessages.value = []
}

onMounted(() => {
  // Initialize Swiper
  document.querySelectorAll('.init-swiper').forEach(el => {
    const config = JSON.parse(el.getAttribute('data-config'))
    new Swiper(el, config)
  })

  // Initialize GLightbox
  GLightbox()

  // Hide preloader immediately
  const preloader = document.getElementById('preloader')
  if (preloader) preloader.style.display = 'none'

  // Mobile nav toggle
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle')
  const navmenu = document.getElementById('navmenu')
  if (mobileNavToggle && navmenu) {
    mobileNavToggle.addEventListener('click', () => {
      navmenu.classList.toggle('active')
    })
  }
})
</script>

<template>
  <div>
    <header id="header" class="header sticky-top">
      <div class="topbar d-flex align-items-center dark-background">
        <div class="container d-flex justify-content-center justify-content-md-between">
          <div class="contact-info d-flex align-items-center">
            <i class="bi bi-envelope d-flex align-items-center"><a href="mailto:rubenbalderas@yahoo.com">rubenbalderas@yahoo.com</a></i>
            <i class="bi bi-phone d-flex align-items-center ms-4"><a href="tel:8135456976"> 813 545 6976</a></i>
          </div>
          <div class="social-links d-none d-md-flex align-items-center">
            <a href="#" class="facebook"><i class="bi bi-facebook"></i></a>
            <a href="#" class="instagram"><i class="bi bi-instagram"></i></a>
            <a href="#" class="linkedin"><i class="bi bi-linkedin"></i></a>
          </div>
        </div>
      </div>
      <div class="branding d-flex align-items-cente">
        <div class="container position-relative d-flex align-items-center justify-content-between">
          <a href="#" class="logo d-flex align-items-center">
            <img src="/assets/img/rubens.svg" alt="logo marine">
          </a>
          <nav id="navmenu" class="navmenu">
            <ul>
              <li><a href="#hero" class="active">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
            <i class="mobile-nav-toggle d-xl-none bi bi-list"></i>
          </nav>
        </div>
      </div>
    </header>

    <main class="main">
      <section id="hero" class="hero section dark-background">
        <video autoplay muted loop class="video-bg">
          <source src="/src/assets/video/20260206_1136.mp4" type="video/mp4">
        </video>
        <div class="container position-relative">
          <div class="welcome position-relative" data-aos="fade-down" data-aos-delay="100">
            <h2>Services We Offer</h2>
            <p>Dock Construction and Repair</p>
          </div>

          <div class="content row gy-4">
            <div class="col-lg-4 d-flex align-items-stretch">
              <div class="why-box" data-aos="zoom-out" data-aos-delay="200">
                <h3>Why Choose Our Services?</h3>
                <p>
                  From building new docks to repairing existing structures, we ensure durability and functionality. Our team uses high-quality materials to guarantee long-lasting results.
                </p>
              </div>
            </div>
            <div class="col-lg-8 d-flex align-items-stretch">
              <div class="d-flex flex-column justify-content-center">
                <div class="row gy-4">
                  <div class="col-xl-4 d-flex align-items-stretch">
                    <div class="icon-box" data-aos="zoom-out" data-aos-delay="300">
                      <i class="bi bi-wrench-adjustable-circle"></i>
                      <h4>Boat Lift Installation and Maintenance</h4>
                      <p>We specialize in installing and maintaining boat lifts to keep your vessel secure and accessible. Our services include routine inspections and repairs.</p>
                    </div>
                  </div>
                  <div class="col-xl-4 d-flex align-items-stretch">
                    <div class="icon-box" data-aos="zoom-out" data-aos-delay="400">
                      <i class="bi bi-usb"></i>
                      <h4>Marine Flooring Solutions</h4>
                      <p>Offering top-notch marine flooring options that are both stylish and functional. We handle everything from installation to repair.</p>
                    </div>
                  </div>
                  <div class="col-xl-4 d-flex align-items-stretch">
                    <div class="icon-box" data-aos="zoom-out" data-aos-delay="500">
                      <i class="bi bi-repeat"></i>
                      <h4>Pulley and Belt Replacement</h4>
                      <p>Expert services for replacing and maintaining pulleys and belts in marine engines, ensuring smooth operation and preventing breakdowns.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="text-center mt-4" data-aos="fade-up" data-aos-delay="600">
            <a href="#contact" class="btn btn-accent btn-lg">Get Your Free Quote Today</a>
          </div>
        </div>
      </section>

      <section id="about" class="about section light-background">
        <div class="container">
          <div class="row gy-4">
            <div class="col-lg-5 position-relative align-self-start" data-aos="fade-up" data-aos-delay="200">
              <img src="/assets/img/work/5.jpeg" class="img-fluid" alt="">
            </div>
            <div class="col-lg-7 content" data-aos="fade-up" data-aos-delay="100">
              <h3>About Us</h3>
              <p>
                With over 20 years of experience in Ruben's construction and repair, our company is dedicated to maintaining and enhancing waterfront infrastructure.
              </p>
              <ul>
                <li>
                  <i class="bi bi-diagram-3"></i>
                  <div>
                    <h5>Seaside Infrastructure Repairs</h5>
                    <p>Comprehensive repair services for seaside infrastructure, including seawalls, bulkheads, and piers.</p>
                  </div>
                </li>
                <li>
                  <i class="bi bi-fullscreen-exit"></i>
                  <div>
                    <h5>Dockside Engineering Solutions</h5>
                    <p>Innovative engineering solutions tailored to improve dock functionality and safety.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="why-choose-us" class="why-choose-us section">
        <div class="container section-title" data-aos="fade-up">
          <h2>Why Choose Ruben's Construction & Repair?</h2>
          <p>Trusted experts in marine construction with proven results</p>
        </div>
        <div class="container">
          <div class="row gy-4">
            <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div class="why-box">
                <h4>20+ Years of Experience</h4>
                <p>Over two decades of expertise in waterfront construction and repairs across Tampa Bay.</p>
              </div>
            </div>
            <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div class="why-box">
                <h4>Quality Guaranteed</h4>
                <p>We use premium materials and proven techniques to ensure lasting, high-quality results.</p>
              </div>
            </div>
            <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="300">
              <div class="why-box">
                <h4>Timely Service</h4>
                <p>Efficient project management with realistic timelines and minimal disruption to your property.</p>
              </div>
            </div>
            <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="400">
              <div class="why-box">
                <h4>Free Consultations</h4>
                <p>Get a free, no-obligation assessment and quote for your marine construction needs.</p>
              </div>
            </div>
            <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="500">
              <div class="why-box">
                <h4>Local Expertise</h4>
                <p>Serving Tampa, Apollo Beach, Gibsonton, Ruskin, and surrounding areas with local knowledge.</p>
              </div>
            </div>
            <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="600">
              <div class="why-box">
                <h4>Full-Service Solutions</h4>
                <p>From design to completion, we handle all aspects of your dock, seawall, and deck projects.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="clients" class="clients section">
        <div class="container" data-aos="fade-up" data-aos-delay="100">
          <div class="swiper init-swiper" data-config='{"loop":true,"speed":600,"autoplay":{"delay":5000},"slidesPerView":"auto","pagination":{"el":".swiper-pagination","type":"bullets","clickable":true},"breakpoints":{"320":{"slidesPerView":2,"spaceBetween":40},"480":{"slidesPerView":3,"spaceBetween":60},"640":{"slidesPerView":4,"spaceBetween":80},"992":{"slidesPerView":6,"spaceBetween":120}}}'>
            <div class="swiper-wrapper align-items-center">
              <div class="swiper-slide"><img src="/assets/img/clients/client-1.png" class="img-fluid" alt=""></div>
              <div class="swiper-slide"><img src="/assets/img/clients/client-2.png" class="img-fluid" alt=""></div>
              <div class="swiper-slide"><img src="/assets/img/clients/client-3.png" class="img-fluid" alt=""></div>
              <div class="swiper-slide"><img src="/assets/img/clients/client-4.png" class="img-fluid" alt=""></div>
              <div class="swiper-slide"><img src="/assets/img/clients/client-5.png" class="img-fluid" alt=""></div>
              <div class="swiper-slide"><img src="/assets/img/clients/client-6.png" class="img-fluid" alt=""></div>
              <div class="swiper-slide"><img src="/assets/img/clients/client-7.png" class="img-fluid" alt=""></div>
              <div class="swiper-slide"><img src="/assets/img/clients/client-8.png" class="img-fluid" alt=""></div>
            </div>
            <div class="swiper-pagination"></div>
          </div>
        </div>
      </section>

      <section id="portfolio" class="portfolio section">
        <div class="container section-title" data-aos="fade-up">
          <h2>Services</h2>
          <p>Tampa - Apollo Beach - Gibsonton Ruskin - Riverview - South Shore - Bradenton - Lake Mango - Lake Thonotosassat</p>
        </div>
        <div class="container">
          <div class="swiper init-swiper" data-config='{"loop":true,"speed":600,"autoplay":{"delay":5000},"slidesPerView":1,"pagination":{"el":".swiper-pagination","type":"bullets","clickable":true},"breakpoints":{"640":{"slidesPerView":2},"992":{"slidesPerView":3}}}' data-aos="fade-up" data-aos-delay="200">
            <div class="swiper-wrapper">
              <div v-for="service in services" :key="service.title" class="swiper-slide">
                <div class="card h-100 shadow-sm service-card">
                  <img :src="service.img" class="card-img-top" alt="" style="height: 200px; object-fit: cover;">
                  <div class="card-body d-flex flex-column">
                    <h5 class="card-title">{{ service.title }}</h5>
                    <p class="card-text flex-grow-1">{{ service.desc }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="swiper-pagination"></div>
          </div>
        </div>
      </section>

      <section id="testimonials" class="testimonials section dark-background">
        <img src="/assets/img/pier-2760513_1280.jpg" class="testimonials-bg" alt="">
        <div class="container" data-aos="fade-up" data-aos-delay="100">
          <div class="swiper init-swiper" data-config='{"loop":true,"speed":600,"autoplay":{"delay":5000},"slidesPerView":1,"pagination":{"el":".swiper-pagination","type":"bullets","clickable":true}}'>
            <div class="swiper-wrapper">
              <div class="swiper-slide">
                <div class="testimonial-item">
                  <img src="/assets/img/testimonials/testimonials-1.jpg" class="testimonial-img" alt="">
                  <h3>Saul D.</h3>
                  <h4>Tampa, FL</h4>
                  <div class="stars"><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i></div>
                  <p><i class="bi bi-quote quote-icon-left"></i><span>The team did an outstanding job on our dock repair. Professional, reliable, and skilled—highly recommend!</span><i class="bi bi-quote quote-icon-right"></i></p>
                </div>
              </div>
              <div class="swiper-slide">
                <div class="testimonial-item">
                  <img src="/assets/img/testimonials/testimonials-2.jpg" class="testimonial-img" alt="">
                  <h3>Sara Wilsson</h3>
                  <h4> Clearwater, FL</h4>
                  <div class="stars"><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i></div>
                  <p><i class="bi bi-quote quote-icon-left"></i><span>We’ve been using their boat lift maintenance services for years. Always top-notch and timely</span><i class="bi bi-quote quote-icon-right"></i></p>
                </div>
              </div>
              <div class="swiper-slide">
                <div class="testimonial-item">
                  <img src="/assets/img/testimonials/testimonials-3.jpg" class="testimonial-img" alt="">
                  <h3>Jena Karlis</h3>
                  <h4>St. Petersburg, FL</h4>
                  <div class="stars"><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i></div>
                  <p><i class="bi bi-quote quote-icon-left"></i><span>Excellent service and quality work. Our seaside infrastructure looks and functions better than ever!</span><i class="bi bi-quote quote-icon-right"></i></p>
                </div>
              </div>
            </div>
            <div class="swiper-pagination"></div>
          </div>
        </div>
      </section>

      <section id="faq" class="faq section light-background">
        <div class="container section-title" data-aos="fade-up">
          <h2>Frequently Asked Questions</h2>
        </div>
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-lg-8">
              <div class="faq-container">
                <div v-for="(f,i) in faqs" :key="i" :class="['faq-item', f.open ? 'faq-active' : '']" @click="toggleFAQ(i)">
                  <i class="faq-icon bi bi-question-circle"></i>
                  <h3>{{ f.q }}</h3>
                  <div class="faq-content"><p>{{ f.a }}</p></div>
                  <i class="faq-toggle bi bi-chevron-right"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cta" class="cta section dark-background">
        <video autoplay muted loop class="video-bg">
          <source src="/src/assets/video/20260206_1139.mp4" type="video/mp4">
        </video>
        <div class="container" data-aos="fade-up">
          <div class="row gy-4">
            <div class="col-lg-8">
              <h3>Ready to Start Your Marine Construction Project?</h3>
              <p>Contact us today for a free consultation and estimate. We'll help bring your waterfront vision to life.</p>
            </div>
            <div class="col-lg-4 text-center text-lg-end">
              <a href="#contact" class="btn btn-accent">Get Free Quote</a>
              <p class="mt-2"><a href="tel:8135456976" class="text-light">Call Now: 813-454-2000</a></p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" class="contact section">
        <div class="container section-title" data-aos="fade-up">
          <h2>Contact</h2>
          <p>Need a consultation? Contact us below.</p>
        </div>
        <div class="container" data-aos="fade-up" data-aos-delay="100">
          <div class="row gy-4">
            <div class="col-md-6">
              <div class="info-item d-flex align-items-center">
                <i class="icon bi bi-geo-alt flex-shrink-0"></i>
                <div><h3>Address</h3><p>PO BOX 41 Ruskin, FL 33575</p></div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-item d-flex align-items-center">
                <i class="icon bi bi-telephone flex-shrink-0"></i>
                <div><h3>Call Us</h3><p> 813 545 6976</p></div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-item d-flex align-items-center">
                <i class="icon bi bi-envelope flex-shrink-0"></i>
                <div><h3>Email Us</h3><p>rubenbalderas@yahoo.coms</p></div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-item d-flex align-items-center">
                <i class="icon bi bi-share flex-shrink-0"></i>
                <div><h3>Social Profiles</h3><div class="social-links"><a href="#"><i class="bi bi-facebook"></i></a><a href="#"><i class="bi bi-instagram"></i></a><a href="#"><i class="bi bi-linkedin"></i></a></div></div>
              </div>
            </div>
          </div>

          <form @submit="submit" class="php-email-form" data-aos="fade-up" data-aos-delay="600">
            <div class="row gy-4">
              <div class="col-md-6"><input type="text" v-model="form.name" class="form-control" placeholder="Your Name" required></div>
              <div class="col-md-6"><input type="email" v-model="form.email" class="form-control" placeholder="Your Email" required></div>
              <div class="col-md-12"><textarea class="form-control" v-model="form.message" rows="8" placeholder="Message" required></textarea></div>
              <div class="col-md-12 text-center">
                <div class="loading">Loading</div>
                <div class="error-message"></div>
                <div class="sent-message">Your message has been sent. Thank you!</div>
                <button type="submit" class="btn btn-primary">{{ sending ? 'Sending...' : 'Send Message' }}</button>
              </div>
            </div>
          </form>

        </div>
      </section>

    </main>

    <footer id="footer" class="footer light-background">
      <div class="container footer-top">
        <div class="row gy-4">
          <div class="col-lg-4 col-md-6 footer-about">
            <a href="#" class="logo d-flex align-items-center"><img src="../../src/assets/img/rubens.svg" alt="logo marine"></a>
            <div class="footer-contact pt-3">
              <p>PO BOX 41</p>
              <p>Ruskin, FL 33575</p>
              <p class="mt-3"><strong>Phone:</strong> <span> 813 545 6976</span></p>
              <p><strong>Email:</strong> <span>rubenbalderas@yahoo.com</span></p>
            </div>
            <div class="social-links d-flex mt-4"><a href=""><i class="bi bi-facebook"></i></a><a href=""><i class="bi bi-instagram"></i></a><a href=""><i class="bi bi-linkedin"></i></a></div>
          </div>
          <div class="col-lg-2 col-md-3 footer-links"><h4>Useful Links</h4><ul><li><a href="#">Home</a></li><li><a href="#">About us</a></li></ul></div>
          <div class="col-lg-4 col-md-12 footer-newsletter"><h4>Our Newsletter</h4><p>Subscribe to our newsletter and receive the latest news about our products and services!</p><form @submit="submitNewsletter" class="php-email-form"><div class="newsletter-form"><input type="email" v-model="newsletter.email" name="email"><input type="submit" :disabled="sendingNewsletter" value="Subscribe"></div><div v-if="sendingNewsletter" class="loading">Loading</div><div class="error-message"></div><div class="sent-message">Your subscription request has been sent. Thank you!</div></form></div>
        </div>
      </div>
      <div class="container copyright text-center mt-4"><p>© <span>Copyright</span> <strong class="px-1 sitename">Ruben's Construction & Repair</strong> <span>All Rights Reserved</span></p></div>
    </footer>

    <div v-if="toast" class="toast">{{ toast }}</div>
    <div class="chatbot">
      <div v-if="chatOpen" class="chat-window">
        <div class="chat-header">How can we help you?<button @click="toggleChat" class="close-btn">&times;</button></div>
        <div class="chat-body">
          <div v-for="msg in chatMessages" :key="msg.text" :class="['message', msg.type]">
            {{ msg.text }}
          </div>
          <div v-if="chatMessages.length > 0" class="reset-btn">
            <button @click="resetChat" class="question-btn">Ask another question</button>
          </div>
          <div v-else class="questions">
            <button v-for="(q, i) in questions" :key="i" @click="askQuestion(i)" class="question-btn">{{ q.q }}</button>
          </div>
        </div>
      </div>
      <button @click="toggleChat" class="chat-btn" :class="{ open: chatOpen }">
        <i class="bi bi-chat-dots"></i>
      </button>
    </div>
    <a href="#" id="scroll-top" class="scroll-top d-flex align-items-center justify-content-center"><i class="bi bi-arrow-up-short"></i></a>
    <div id="preloader"></div>
  </div>
</template>

<style>
/* small adjustments */
.dark-background { background:#222; color:#fff }
.light-background { background:#fff; color:#213547 }
.why-box { background: rgba(255,255,255,0.04); padding:1.5rem; border-radius:8px }
.icon-box { background: #fff; padding:1rem; border-radius:8px }
.faq-item { padding:1rem; border-radius:6px; background:#fff; margin-bottom:0.75rem; cursor:pointer }
.faq-active { box-shadow: 0 6px 18px rgba(0,0,0,0.06) }
.testimonial-bg { width:100%; height:300px; object-fit:cover }
.toast { position:fixed; top:20px; right:20px; background:#28a745; color:#fff; padding:1rem; border-radius:5px; z-index:9999; box-shadow:0 2px 10px rgba(0,0,0,0.1) }
.chatbot { position:fixed; bottom:20px; right:20px; z-index:9998 }
.chat-btn { background: var(--nav-hover-color); color:#fff; border:none; border-radius:50%; width:60px; height:60px; font-size:24px; cursor:pointer; box-shadow:0 2px 10px rgba(0,0,0,0.2) }
.chat-btn.open { background: var(--nav-color) }
.chat-window { position:absolute; bottom:70px; right:0; width:300px; height:400px; background:#fff; border-radius:10px; box-shadow:0 2px 20px rgba(0,0,0,0.2); display:flex; flex-direction:column }
.chat-header { background: var(--nav-hover-color); color:#fff; padding:10px; border-radius:10px 10px 0 0; display:flex; justify-content:space-between; align-items:center }
.close-btn { background:none; border:none; color:#fff; font-size:20px; cursor:pointer }
.chat-body { flex:1; padding:10px; overflow-y:auto }
.message { margin:5px 0; padding:8px; border-radius:5px }
.message.user { background:#e3f2fd; text-align:right }
.message.bot { background:#f5f5f5 }
.questions { display:flex; flex-direction:column }
.question-btn { background: var(--nav-hover-color); color:#fff; border:none; padding:8px; margin:2px 0; border-radius:5px; cursor:pointer; text-align:left }
.question-btn:hover { background: var(--nav-color) }
.service-card { margin: 10px; }
.service-card .card-title { color: var(--nav-color); }
.service-card .card-text { color: var(--default-color); }
.btn-accent { background-color: var(--nav-hover-color); border-color: var(--nav-hover-color); color: white; }
.btn-accent:hover { background-color: var(--nav-color); border-color: var(--nav-color); }
.video-bg { position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; z-index:1; opacity:0.7 }
#cta { position:relative; overflow:hidden }
#cta .container { position:relative; z-index:2 }
.hero { position:relative; overflow:hidden }
.hero .container { position:relative; z-index:2 }
</style>
