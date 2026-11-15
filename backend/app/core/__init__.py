"""Core configuration and settings."""

NASA_POWER_METADATA = {
    "documentation": {
        "version": "v2.10.3",
        "library": "v1.7.27",
        "title": "POWER Daily API",
        "description": "The API allows daily data requests of POWER Analysis Ready Data (ARD).",
        "contact": "larc-power-project@mail.nasa.gov",
    },
    "settings": {
        "community": [
            "RE",
            "SB",
            "AG",
        ],
        "start": "1981-01-01T00:00:00",
        "end": "2026-11-15T00:00:00",
    },
}

__all__ = ["NASA_POWER_METADATA"]
