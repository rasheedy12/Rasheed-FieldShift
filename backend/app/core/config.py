import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file if it exists
backend_dir = Path(__file__).resolve().parent.parent.parent
env_path = backend_dir / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)


class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Rasheed FieldShift API")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "127.0.0.1")

    # Default Reference Point: Azare, Bauchi State, Nigeria
    DEFAULT_LATITUDE: float = float(os.getenv("DEFAULT_LATITUDE", "11.6765"))
    DEFAULT_LONGITUDE: float = float(os.getenv("DEFAULT_LONGITUDE", "10.1911"))
    DEFAULT_LOCATION_NAME: str = os.getenv(
        "DEFAULT_LOCATION_NAME", "Azare, Bauchi State, Nigeria"
    )

    # NASA POWER daily point API endpoint
    NASA_POWER_API_BASE: str = os.getenv(
        "NASA_POWER_API_BASE",
        "https://power.larc.nasa.gov/api/temporal/daily/point",
    )

    # Cache directory path
    CACHE_DIR: Path = (
        Path(__file__).resolve().parent.parent.parent.parent / "data" / "cache"
    )

    # Allowed CORS Origins
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


settings = Settings()
