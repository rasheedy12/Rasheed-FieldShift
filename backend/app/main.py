from fastapi import FastAPI

app = FastAPI(
    title="Rasheed FieldShift API",
    description="Agricultural decision-support API for rain-fed farming.",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "message": "Welcome to Rasheed FieldShift API",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "rasheed-fieldshift-api",
    }
