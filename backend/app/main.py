from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import create_tables
from app.routers import profile, skin_analysis, ingredients, analyze, results


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    try:
        await create_tables()
        print("Database connected and tables verified")
    except Exception as e:
        import app.database
        app.database.DB_AVAILABLE = False
        print(f"Warning: Could not connect to the database or create tables.")
        print(f"Detail: {str(e)}")
        print(f"Make sure DATABASE_URL is configured correctly in .env. Falling back to in-memory mode.")
    
    yield
    # Shutdown
    print("Application shutting down")


app = FastAPI(
    title="DermaGenie API",
    description="AI-Powered Skin Analysis & Ingredient Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(profile.router)
app.include_router(skin_analysis.router)
app.include_router(ingredients.router)
app.include_router(analyze.router)
app.include_router(results.router)


@app.get("/")
async def root():
    return {
        "name": "DermaGenie API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
