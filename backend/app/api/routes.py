from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from app.core.config import settings
from app.services.nasa_power import nasa_power_service

router = APIRouter(prefix="/api/v1")


@router.get("/location/default")
def get_default_location():
    """
    Returns the reference location for the Azare pilot.
    """
    return {
        "location_name": settings.DEFAULT_LOCATION_NAME,
        "latitude": settings.DEFAULT_LATITUDE,
        "longitude": settings.DEFAULT_LONGITUDE,
        "agroecological_zone": "Sudan Savanna",
        "state": "Bauchi State",
        "country": "Nigeria",
        "farming_system": "Rain-fed smallholder agriculture",
        "typical_rainy_season": "May/June to September/October",
    }


@router.get("/environmental-profile")
def get_environmental_profile(
    lat: float = Query(default=settings.DEFAULT_LATITUDE, ge=-90.0, le=90.0),
    lon: float = Query(default=settings.DEFAULT_LONGITUDE, ge=-180.0, le=180.0),
    start_date: str = Query(default="20240501", pattern=r"^\d{8}$"),
    end_date: str = Query(default="20241031", pattern=r"^\d{8}$"),
    force_refresh: bool = Query(default=False),
):
    """
    Returns environmental profile (Precipitation, 2m Temperature, Root-Zone Wetness)
    from NASA POWER with complete provenance and qualifications.
    """
    try:
        data = nasa_power_service.fetch_daily_agrometeorology(
            lat=lat,
            lon=lon,
            start_date=start_date,
            end_date=end_date,
            force_refresh=force_refresh,
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/crops")
def get_candidate_crops():
    """
    Returns candidate crops with their documented environmental ranges
    and hypotheses under investigation.
    """
    return {
        "description": "Candidate crops for Azare (Sudan Savanna rain-fed farming). These are hypotheses under evaluation, not definitive prescriptions.",
        "crops": [
            {
                "id": "millet",
                "name": "Pearl Millet",
                "botanical_name": "Pennisetum glaucum",
                "role": "Baseline staple cereal",
                "season_duration_days": "75 - 100",
                "water_requirement_mm": "300 - 500",
                "drought_tolerance": "High",
                "local_status": "Widely cultivated staple in Azare",
            },
            {
                "id": "sorghum",
                "name": "Sorghum",
                "botanical_name": "Sorghum bicolor",
                "role": "Staple cereal & fodder",
                "season_duration_days": "90 - 120",
                "water_requirement_mm": "400 - 650",
                "drought_tolerance": "High - Moderate",
                "local_status": "Widely cultivated staple in Azare",
            },
            {
                "id": "cowpea",
                "name": "Cowpea",
                "botanical_name": "Vigna unguiculata",
                "role": "Grain legume / Nitrogen fixer",
                "season_duration_days": "60 - 85",
                "water_requirement_mm": "300 - 450",
                "drought_tolerance": "High",
                "local_status": "Common rotation/intercrop; contributes nitrogen under good nodulation",
            },
            {
                "id": "groundnut",
                "name": "Groundnut (Peanut)",
                "botanical_name": "Arachis hypogaea",
                "role": "Cash & food legume",
                "season_duration_days": "90 - 110",
                "water_requirement_mm": "500 - 700",
                "drought_tolerance": "Moderate",
                "local_status": "Major local cash crop; requires loose, well-drained sandy loam",
            },
            {
                "id": "maize",
                "name": "Maize",
                "botanical_name": "Zea mays",
                "role": "Cereal crop",
                "season_duration_days": "80 - 105",
                "water_requirement_mm": "500 - 800",
                "drought_tolerance": "Moderate - Low",
                "local_status": "High input/water demand; riskier under erratic Sudan Savanna dry spells",
            },
            {
                "id": "sesame",
                "name": "Sesame",
                "botanical_name": "Sesamum indicum",
                "role": "High-value oilseed cash crop",
                "season_duration_days": "85 - 110",
                "water_requirement_mm": "350 - 500",
                "drought_tolerance": "High",
                "local_status": "Potential diversification crop; local agronomy needs field validation",
            },
        ]
    }


@router.get("/scenarios")
def get_rotation_scenarios():
    """
    Returns proposed crop-rotation hypotheses for comparison.
    """
    return {
        "disclaimer": "Rotation models indicate environmental risk and agronomic principles. They do not constitute guaranteed yields or profit forecasts.",
        "scenarios": [
            {
                "id": "scenario_1",
                "name": "Continuous Millet (Baseline Monoculture)",
                "sequence": ["Millet", "Millet", "Millet"],
                "description": "Farmer default practice of repeated millet planting.",
                "agronomic_tradeoffs": {
                    "benefits": "Reliable staple; highly drought tolerant.",
                    "risks": "Soil nutrient depletion (continuous cereal nitrogen draw), pest/parasitic weed (Striga hermonthica) buildup over time."
                }
            },
            {
                "id": "scenario_2",
                "name": "Millet → Cowpea → Sorghum (Cereal-Legume Diversification)",
                "sequence": ["Millet", "Cowpea", "Sorghum"],
                "description": "Integrates a short-duration nitrogen-fixing legume between two distinct cereals.",
                "agronomic_tradeoffs": {
                    "benefits": "Cowpea provides pest/disease break, contributes residue and potential nitrogen benefit for succeeding sorghum, dietary diversity.",
                    "risks": "Cowpea is vulnerable to post-flowering insect pests (requires monitoring)."
                }
            },
            {
                "id": "scenario_3",
                "name": "Groundnut → Sorghum → Sesame (Cash & Oilseed Rotation)",
                "sequence": ["Groundnut", "Sorghum", "Sesame"],
                "description": "Combines a legume cash crop with a hardy cereal and drought-hardy oilseed.",
                "agronomic_tradeoffs": {
                    "benefits": "Higher income potential; sesame provides deep root foraging and moisture efficiency.",
                    "risks": "Groundnut requires higher early rainfall and soil moisture; sesame market access needs local verification."
                }
            }
        ]
    }
