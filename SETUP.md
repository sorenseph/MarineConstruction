# Marine Construction - Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Supabase Setup (REQUIRED)

**Important:** You must create the tables before using contracts, blog, or jobs.

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Open **SQL Editor** → **New Query**
4. Copy and paste the contents of `supabase-tables.sql`
5. Click **Run** to create contracts, blog_posts, job_vacancies, job_applications tables

## 3. Configure Supabase (Optional)

If you need to change the Supabase URL or key, edit `src/lib/supabase.js`:

```javascript
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseAnonKey = 'your-anon-or-publishable-key'
```

## 4. Default Users

After running the schema, these users are available:

| Username          | Password        |
|-------------------|-----------------|
| rubenconstruction | superusuario1739 |
| israelcardenas    | webie3899       |

## 5. Run the App

```bash
npm run dev
```

Visit `http://localhost:5173` and click **Login** to access the panel.

## Blog Images

Paste image URLs only (no upload). Right-click any image on the web → Copy image address → paste in the URL field.

## Features

- **Login**: Username/password authentication
- **Panel**: Contracts, Clients, Blog, Jobs, Profile
- **Contracts**: Create, preview, export PDF, digital signatures or skip for manual
- **Clients**: View clients from contracts with progress tracking
- **Blog**: Admin posts (public at /blog-public)
- **Careers**: Publish vacancies, receive applications at /careers
