import { createApp } from 'vue'
import './css/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'aos/dist/aos.css'
import 'glightbox/dist/css/glightbox.css'
import 'swiper/css/bundle'
import AOS from 'aos'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')

AOS.init()
