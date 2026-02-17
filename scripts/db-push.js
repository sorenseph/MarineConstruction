/**
 * Aplica supabase-tables.sql a tu proyecto Supabase desde local.
 *
 * Uso:
 *   1. Supabase → Project Settings → Database → Connection string (URI)
 *   2. Crea .env con: SUPABASE_DB_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"
 *   3. npm run db:push
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'
import 'dotenv/config'

const { Client } = pg
const __dirname = dirname(fileURLToPath(import.meta.url))
const sqlPath = join(__dirname, '..', 'supabase-tables.sql')

async function main() {
  const url = process.env.SUPABASE_DB_URL
  if (!url) {
    console.error(`
❌ Falta SUPABASE_DB_URL

1. Crea .env en la raíz con:

   SUPABASE_DB_URL="postgresql://postgres:[TU_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

2. Supabase Dashboard → Tu proyecto → Settings → Database
   → Connection string → URI (copia y reemplaza [TU_PASSWORD])

3. npm run db:push
`)
    process.exit(1)
  }

  console.log('📄 Leyendo supabase-tables.sql...')
  const sql = readFileSync(sqlPath, 'utf-8')

  console.log('🔌 Conectando a Supabase...')
  const client = new Client({ connectionString: url })

  try {
    await client.connect()
    await client.query(sql)
    console.log('✅ Schema aplicado correctamente.')
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
