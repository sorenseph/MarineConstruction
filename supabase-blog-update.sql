-- Ejecutar en Supabase SQL Editor para agregar columna de imagen a blog
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cover_image TEXT;
