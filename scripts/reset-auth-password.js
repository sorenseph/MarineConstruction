/**
 * Restablece la contraseña de un usuario en Supabase Auth.
 *
 * Uso:
 *   1. Supabase Dashboard → Project Settings → API → copia "service_role" (secret key)
 *   2. Añade a .env: SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
 *   3. node scripts/reset-auth-password.js [email] [nueva_contraseña]
 *
 * Ejemplo:
 *   node scripts/reset-auth-password.js rubenconstruction@rubensconstruction.com admin6976
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
// Cargar .env; si no existe, intentar .env.example
if (existsSync(join(root, '.env'))) {
  config({ path: join(root, '.env') })
} else if (existsSync(join(root, '.env.example'))) {
  config({ path: join(root, '.env.example') })
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://thhosunkpwtinxbclwfm.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const email = process.argv[2] || 'rubenconstruction@rubensconstruction.com'
const newPassword = process.argv[3] || 'admin6976'

async function main() {
  if (!SERVICE_ROLE_KEY) {
    console.error(`
❌ Falta SUPABASE_SERVICE_ROLE_KEY

1. Supabase Dashboard → Tu proyecto → Project Settings → API
2. Copia la clave "service_role" (la que dice secret)
3. Añade a .env:

   SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6..."

4. Vuelve a ejecutar:

   node scripts/reset-auth-password.js
   
   o con email/contraseña custom:
   node scripts/reset-auth-password.js rubenconstruction@rubensconstruction.com admin6976
`)
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  console.log('Buscando usuario:', email)

  const { data: users, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error('Error listando usuarios:', listError.message)
    process.exit(1)
  }

  const user = users.users.find((u) => u.email === email)
  if (!user) {
    console.error('Usuario no encontrado:', email)
    console.log('Usuarios existentes:', users.users.map((u) => u.email).join(', '))
    process.exit(1)
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword
  })

  if (updateError) {
    console.error('Error actualizando contraseña:', updateError.message)
    process.exit(1)
  }

  console.log('✅ Contraseña actualizada correctamente.')
  console.log('   Usuario:', email)
  console.log('   Nueva contraseña:', newPassword)
  console.log('\nYa puedes iniciar sesión con rubenconstruction / ' + newPassword)
}

main()
