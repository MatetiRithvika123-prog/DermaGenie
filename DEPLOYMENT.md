# DermaGenie — Deployment Guide

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Vercel     │────▸│   Render /   │────▸│    Supabase      │
│  (Frontend)  │     │   Railway    │     │   PostgreSQL     │
│  Next.js 16  │     │  (Backend)   │     │                  │
└─────────────┘     │   FastAPI    │     └──────────────────┘
                    └──────────────┘
                          │
                    ┌─────┴─────┐
                    │  Gemini   │
                    │   API     │
                    └───────────┘
```

---

## 1. Database — Supabase PostgreSQL

### Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Navigate to **Settings → Database → Connection string**.
3. Copy the **URI** connection string.
4. Replace `[YOUR-PASSWORD]` with the database password you set during project creation.
5. Change the protocol from `postgres://` to `postgresql+asyncpg://` for SQLAlchemy compatibility.

### Connection String Format
```
postgresql+asyncpg://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### Seed the Database
```bash
cd backend
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
python -m app.seed.seed_data
```

This populates 80+ ingredients, 40+ products, and 13 skin conditions.

---

## 2. Backend — Render

### Setup

1. Push your code to GitHub.
2. Go to [render.com](https://render.com) → **New Web Service**.
3. Connect your GitHub repository.
4. Configure:

| Setting | Value |
|---|---|
| **Name** | `dermagenie-api` |
| **Root Directory** | `backend` |
| **Runtime** | Python |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

5. Add environment variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Supabase connection string |
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `TESSERACT_PATH` | (leave empty — Render has Tesseract pre-installed) |
| `CORS_ORIGINS` | `https://your-app.vercel.app` |
| `PORT` | `10000` (Render default) |

6. For Tesseract on Render, add a `render.yaml` or install via the build command:
```bash
apt-get update && apt-get install -y tesseract-ocr && pip install -r requirements.txt
```

### Alternative: Railway

1. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub**.
2. Set the same environment variables.
3. Railway auto-detects Python and runs `uvicorn`.

---

## 3. Frontend — Vercel

### Setup

1. Go to [vercel.com](https://vercel.com) → **New Project**.
2. Import your GitHub repository.
3. Configure:

| Setting | Value |
|---|---|
| **Framework Preset** | Next.js |
| **Root Directory** | `frontend` |

4. Add environment variables:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://dermagenie-api.onrender.com` (your backend URL) |

5. Deploy.

---

## 4. Post-Deployment Checklist

- [ ] Backend health check: `GET https://your-backend-url/health` returns `{"status": "healthy"}`
- [ ] Frontend loads at `https://your-frontend-url`
- [ ] Profile creation works (creates session in Supabase)
- [ ] Skin analysis saves to database
- [ ] Image upload + OCR extracts ingredients
- [ ] Full analysis returns scoring + AI results
- [ ] Results dashboard displays all sections

---

## 5. Environment Variables Summary

### Backend (`.env`)
```env
DATABASE_URL=postgresql+asyncpg://postgres:password@db.xxx.supabase.co:5432/postgres
GEMINI_API_KEY=your_gemini_api_key
TESSERACT_PATH=
CORS_ORIGINS=http://localhost:3000,https://your-app.vercel.app
HOST=0.0.0.0
PORT=8000
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 6. Local Development

```bash
# Terminal 1 — Backend
cd backend
.\venv\Scripts\activate    # Windows
uvicorn app.main:app --reload

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
