import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'marine_user'

// Emails para Supabase Auth (se crean automáticamente en el primer login)
const USER_EMAILS = {
  rubenconstruction: 'rubenconstruction@rubensconstruction.com',
  israelcardenas: 'israelcardenas@rubensconstruction.com'
}

const DISPLAY_NAMES = {
  rubenconstruction: 'Ruben Construction',
  israelcardenas: 'Israel Cardenas'
}

function getStoredUser() {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

const currentUser = ref(getStoredUser())

export function useAuth() {
  const isAuthenticated = computed(() => !!currentUser.value)

  async function login(usernameInput, password) {
    const raw = String(usernameInput ?? '').trim().replace(/\s+/g, ' ')
    const input = raw.toLowerCase().normalize('NFKC')
    const userPart = input.includes('@') ? input.split('@')[0] : input
    let email = null
    if (userPart === 'rubenconstruction') email = USER_EMAILS.rubenconstruction
    else if (userPart === 'israelcardenas') email = USER_EMAILS.israelcardenas
    else if (input === USER_EMAILS.rubenconstruction || input === USER_EMAILS.israelcardenas) email = input
    if (!email) {
      return { success: false, error: 'Usuario no válido. Usa: rubenconstruction o israelcardenas' }
    }
    let data, error
    const signIn = await supabase.auth.signInWithPassword({ email, password })
    data = signIn.data
    error = signIn.error
    if (error?.message === 'Invalid login credentials') {
      const signUp = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: undefined } })
      if (signUp.data?.user) {
        data = signUp.data
        error = null
      } else if (signUp.error?.message?.includes('already registered')) {
        return { success: false, error: 'Contraseña incorrecta. Usuario ya existe.' }
      } else {
        return { success: false, error: signUp.error?.message || 'Error al iniciar sesión' }
      }
    } else if (error) {
      return { success: false, error: error.message === 'Invalid login credentials' ? 'Usuario o contraseña incorrectos' : error.message }
    }
    const u = data.user
    const username = userPart
    const userData = {
      id: u.id,
      username,
      display_name: DISPLAY_NAMES[username] || username,
      role: 'admin'
    }
    currentUser.value = userData
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    return { success: true, user: userData }
  }

  function logout() {
    supabase.auth.signOut()
    currentUser.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  async function changePassword(username, oldPassword, newPassword) {
    const email = USER_EMAILS[username]
    if (!email) return { success: false, error: 'User not found' }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: oldPassword })
    if (signInError) {
      return { success: false, error: 'Current password is incorrect' }
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    if (updateError) return { success: false, error: updateError.message }
    return { success: true }
  }

  return {
    currentUser,
    isAuthenticated,
    login,
    logout,
    changePassword
  }
}
