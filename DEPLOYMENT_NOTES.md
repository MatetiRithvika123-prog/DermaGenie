# DermaGenie Deployment Notes

## Frontend
Platform: Vercel
URL: https://derma-genie.vercel.app

Environment Variables:
NEXT_PUBLIC_API_URL=https://dermagenie.onrender.com

## Backend
Platform: Render
URL: https://dermagenie.onrender.com

Environment Variables:
DATABASE_URL=<Supabase PostgreSQL Connection String>
GEMINI_API_KEY=<gemini-key>
CORS_ORIGINS=https://derma-genie.vercel.app

## Database
Provider: Supabase
Engine: PostgreSQL

Connection:
postgresql+asyncpg://postgres.cojichdhuegbsfshboeq:[Password]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres

## Known Production Behavior

- Render does not have Tesseract installed.
- OCR falls back to Gemini.
- If Gemini quota is exceeded, fallback ingredients are used.
