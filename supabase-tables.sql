-- Schema: ejecuta "npm run db:push" para aplicar a Supabase
-- (requiere SUPABASE_DB_URL en .env)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contracts (no FK to app_users - we use Supabase Auth)
CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  contract_id TEXT UNIQUE,
  user_id UUID,
  client_name TEXT NOT NULL,
  company_name TEXT,
  client_address TEXT,
  contract_type TEXT,
  contract_date DATE,
  issue_date DATE,
  effective_date DATE,
  project_description TEXT,
  payment_terms TEXT,
  language TEXT DEFAULT 'en',
  items JSONB DEFAULT '[]',
  total_amount DECIMAL(12,2),
  contractor_signature_name TEXT,
  contractor_signature_data TEXT,
  client_signature_name TEXT,
  client_signature_data TEXT,
  skip_contractor_signature BOOLEAN DEFAULT FALSE,
  skip_client_signature BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft',
  progress_percent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for contracts" ON contracts;
CREATE POLICY "Allow all for contracts" ON contracts FOR ALL USING (true) WITH CHECK (true);

-- Si contracts ya existía, añade columnas nuevas
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_id TEXT UNIQUE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS issue_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS effective_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS project_description TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS payment_terms TEXT;

-- Blog
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT,
  content TEXT,
  excerpt TEXT,
  cover_image TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for blog" ON blog_posts;
CREATE POLICY "Allow all for blog" ON blog_posts FOR ALL USING (true) WITH CHECK (true);

-- Job vacancies
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
DROP POLICY IF EXISTS "Allow all for jobs" ON job_vacancies;
CREATE POLICY "Allow all for jobs" ON job_vacancies FOR ALL USING (true) WITH CHECK (true);

-- Job applications (vacancy_id nullable for general applications)
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vacancy_id UUID,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  cover_letter TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for applications" ON job_applications;
CREATE POLICY "Allow all for applications" ON job_applications FOR ALL USING (true) WITH CHECK (true);

-- Contact form submissions (from Landing contact section)
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for contacts" ON contact_submissions;
DROP POLICY IF EXISTS "Allow public insert contacts" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated read contacts" ON contact_submissions;
CREATE POLICY "Allow public insert contacts" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated read contacts" ON contact_submissions FOR SELECT USING (auth.role() = 'authenticated');

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public insert newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow authenticated read newsletter" ON newsletter_subscribers;
CREATE POLICY "Allow public insert newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated read newsletter" ON newsletter_subscribers FOR SELECT USING (auth.role() = 'authenticated');
