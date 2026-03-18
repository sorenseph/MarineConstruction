-- Ejecuta este script en Supabase SQL Editor para crear las tablas necesarias
-- Dashboard -> SQL Editor -> New Query -> Pegar y ejecutar

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabla de usuarios de la aplicación (login con username/password)
CREATE TABLE IF NOT EXISTS app_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar usuarios iniciales (contraseñas hasheadas con crypt)
-- rubenconstruction / superusuario1739
-- israelcardenas / webie3899
INSERT INTO app_users (username, password_hash, display_name, role) VALUES
  ('rubenconstruction', crypt('superusuario1739', gen_salt('bf')), 'Ruben Construction', 'admin'),
  ('israelcardenas', crypt('webie3899', gen_salt('bf')), 'Israel Cardenas', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Función para verificar login (devuelve usuario si credenciales correctas)
CREATE OR REPLACE FUNCTION verify_app_user(p_username TEXT, p_password TEXT)
RETURNS TABLE(id UUID, username TEXT, display_name TEXT, role TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.username, au.display_name, au.role
  FROM app_users au
  WHERE au.username = p_username AND au.password_hash = crypt(p_password, au.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política para que cualquiera pueda llamar verify (solo devuelve datos si pass correcto)
GRANT EXECUTE ON FUNCTION verify_app_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_app_user(TEXT, TEXT) TO authenticated;

-- Función para cambiar contraseña
CREATE OR REPLACE FUNCTION change_app_password(p_username TEXT, p_old_password TEXT, p_new_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_valid BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM app_users 
    WHERE username = p_username AND password_hash = crypt(p_old_password, password_hash)
  ) INTO v_valid;
  
  IF v_valid THEN
    UPDATE app_users 
    SET password_hash = crypt(p_new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE username = p_username;
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION change_app_password(TEXT, TEXT, TEXT) TO anon;

-- Tabla de contratos
CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES app_users(id),
  client_name TEXT NOT NULL,
  company_name TEXT,
  client_address TEXT,
  contract_type TEXT, -- construction, repair, remodeling, maintenance, inspection
  contract_date DATE,
  language TEXT DEFAULT 'en',
  items JSONB DEFAULT '[]',
  total_amount DECIMAL(12,2),
  contractor_signature_name TEXT,
  contractor_signature_data TEXT, -- base64 signature or null if skip
  client_signature_name TEXT,
  client_signature_data TEXT,
  skip_contractor_signature BOOLEAN DEFAULT FALSE,
  skip_client_signature BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft',
  progress_percent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para contracts (por ahora permitir todo para anon - ajustar después con auth real)
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for contracts" ON contracts FOR ALL USING (true) WITH CHECK (true);

-- Tabla de posts del blog
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  content TEXT,
  excerpt TEXT,
  cover_image TEXT,
  author_id UUID REFERENCES app_users(id),
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for blog" ON blog_posts FOR ALL USING (true) WITH CHECK (true);

-- Tabla de vacantes
CREATE TABLE IF NOT EXISTS job_vacancies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  requirements TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE job_vacancies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for jobs" ON job_vacancies FOR ALL USING (true) WITH CHECK (true);

-- Tabla de aplicaciones/postulaciones
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vacancy_id UUID REFERENCES job_vacancies(id) NULL,  -- NULL for general applications
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for applications" ON job_applications FOR ALL USING (true) WITH CHECK (true);

-- Tabla de cotizaciones
CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quote_id TEXT,
  quote_date DATE,
  valid_until DATE,
  client_name TEXT NOT NULL,
  company_name TEXT,
  client_address TEXT,
  prepared_by TEXT,
  items JSONB DEFAULT '[]',
  total_amount DECIMAL(12,2),
  disclaimer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for quotes" ON quotes FOR ALL USING (true) WITH CHECK (true);
