# DermaGenie — AI-Powered Skin Analysis & Ingredient Intelligence Platform

DermaGenie is a comprehensive, full-stack platform that empowers users to analyze their skin concerns, evaluate skincare product ingredients using OCR and AI, and receive personalized skincare routines.

## 🌟 Key Features

1. **Skin Assessment**: Comprehensive questionnaire to build a personalized skin profile (type, concerns, severity).
2. **Ingredient OCR Scanner**: Upload an image of a product's ingredient list, and our OCR engine extracts the ingredients.
3. **Product Suitability Scoring**: Algorithmic evaluation of ingredients against the user's specific skin profile.
4. **AI Analysis (Powered by Gemini)**: Generative AI provides a detailed explanation, product recommendations, and a personalized routine.
5. **Natural Precautions**: AI-generated lifestyle and dietary tips tailored to your skin concerns.
6. **No Friction**: Immediate access with zero login, signup, or password requirements.

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Zustand (State Management), React Dropzone.
- **Backend**: FastAPI, Python 3.12, SQLAlchemy (async), PostgreSQL (via Supabase), Uvicorn.
- **AI & OCR**: Google Gemini 2.0 Flash API, Tesseract OCR.
- **Deployment**: Vercel (Frontend), Render/Railway (Backend), Supabase (Database).

## 📁 Project Structure

- `/frontend` - Next.js React application.
- `/backend` - FastAPI Python application.

## 📖 Documentation

- [API Documentation](API_DOCS.md) - Details on all backend endpoints.
- [ER Diagram](ER_DIAGRAM.md) - Database schema and relationships.
- [Deployment Guide](DEPLOYMENT.md) - Instructions for deploying the full stack.

## 🚀 Local Development Setup

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Install [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) on your system.
5. Configure `.env` (use `.env.example` as a template). Ensure `DATABASE_URL` and `GEMINI_API_KEY` are set.
6. Run database migrations / seed script:
   ```bash
   python -m app.seed.seed_data
   ```
7. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.


Demo of dermaGenie
https://derma-genie.vercel.app/
