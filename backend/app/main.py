from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Decision-support API for Rasheed FieldShift (NASA Space Apps Challenge 2026). "
        "Provides regional agroclimatology from NASA POWER and crop rotation scenario evaluation "
        "tailored for smallholder rain-fed farmers in Azare, Bauchi State, Nigeria."
    ),
    version="0.1.0",
)

# CORS Middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Router
app.include_router(router)


@app.get("/")
def root():
    return {
        "project": "Rasheed FieldShift API",
        "status": "online",
        "challenge": "NASA Space Apps Challenge 2026",
        "documentation": "/docs",
        "pilot_region": settings.DEFAULT_LOCATION_NAME,
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "rasheed-fieldshift-api",
        "environment": settings.ENVIRONMENT,
    }
