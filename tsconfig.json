# ERP Inversión Personal

Fase 1: dashboard base conectado a Supabase. Sin ejecución de órdenes de ningún tipo.

## Dónde conseguir las claves de Supabase

En tu proyecto Supabase → **Project Settings** → **API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (¡nunca la subas a GitHub ni la pongas en el navegador!)

## Subir a GitHub

```bash
cd erp-inversion
git init
git add .
git commit -m "Fase 1: esqueleto dashboard"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/erp-inversion-personal.git
git push -u origin main
```

## Desplegar en Vercel

1. En vercel.com → **Add New** → **Project** → elige el repo `erp-inversion-personal`.
2. En **Environment Variables**, añade las 3 variables de `.env.example` con tus valores reales.
3. Deploy. Vercel te da una URL tipo `erp-inversion-personal.vercel.app`.

## Desarrollo local (opcional)

```bash
npm install
cp .env.example .env.local   # y rellena tus claves reales
npm run dev
```
