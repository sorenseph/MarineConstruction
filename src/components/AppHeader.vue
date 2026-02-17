<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle')
  if (!mobileNavToggle) return
  mobileNavToggle.addEventListener('click', () => {
    document.body.classList.toggle('mobile-nav-active')
    mobileNavToggle.classList.toggle('bi-list')
    mobileNavToggle.classList.toggle('bi-x')
  })
  document.querySelectorAll('#navmenu .nav-link, #navmenu a').forEach(el => {
    el.addEventListener('click', () => {
      document.body.classList.remove('mobile-nav-active')
      mobileNavToggle.classList.add('bi-list')
      mobileNavToggle.classList.remove('bi-x')
    })
  })
})
</script>

<template>
  <header id="header" class="header sticky-top">
    <div class="topbar d-flex align-items-center dark-background">
      <div class="container d-flex justify-content-center justify-content-md-between">
        <div class="contact-info d-flex align-items-center">
          <i class="bi bi-envelope d-flex align-items-center"><a href="mailto:rubenbalderas@yahoo.com">rubenbalderas@yahoo.com</a></i>
          <i class="bi bi-phone d-flex align-items-center ms-4"><a href="tel:8135456976">813 545 6976</a></i>
        </div>
        <div class="social-links d-none d-md-flex align-items-center">
          <a href="https://www.facebook.com/people/Rubens-Construction-Repair/61587814865674/" target="_blank" rel="noopener" class="facebook" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
        </div>
      </div>
    </div>
    <div class="branding d-flex align-items-cente">
      <div class="container position-relative d-flex align-items-center justify-content-between">
        <router-link to="/" class="logo d-flex align-items-center">
          <img src="/assets/img/rubens.svg" alt="logo marine">
        </router-link>
        <nav id="navmenu" class="navmenu">
          <ul>
            <li><router-link to="/" class="nav-link">Home</router-link></li>
            <li><a href="/#about" class="nav-link">About</a></li>
            <li><a href="/#contact" class="nav-link">Contact</a></li>
            <li><router-link to="/blog-public" class="nav-link">Blog</router-link></li>
            <li><router-link to="/careers" class="nav-link">Careers</router-link></li>
            <li><router-link to="/login" class="nav-link">Login</router-link></li>
          </ul>
          <i class="mobile-nav-toggle d-xl-none bi bi-list"></i>
        </nav>
      </div>
    </div>
  </header>
</template>
