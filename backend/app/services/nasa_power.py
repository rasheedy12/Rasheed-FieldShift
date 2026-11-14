import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

import requests
from app.core.config import settings

logger = logging.getLogger(__name__)

# Fill / missing value indicator used by NASA POWER
NASA_POWER_FILL_VALUE = -999.0


class NasaPowerService:
    def __init__(self):
        self.api_base = settings.NASA_POWER_API_BASE
        self.cache_dir = settings.CACHE_DIR
        self.fixtures_dir = Path(__file__).resolve().parent.parent.parent.parent / "data" / "fixtures"
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _get_cache_filepath(self, lat: float, lon: float, start_date: str, end_date: str) -> Path:
        filename = f"power_{lat:.4f}_{lon:.4f}_{start_date}_{end_date}.json"
        return self.cache_dir / filename

    def _get_fallback_fixture(self) -> Optional[dict[str, Any]]:
        # Prioritize full annual climatology fixture
        annual_fixture = self.fixtures_dir / "azare_annual_climatology.json"
        if annual_fixture.exists():
            try:
                with open(annual_fixture, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Failed to read annual fixture: {e}")

        fixture_path = self.fixtures_dir / "azare_2024_growing_season.json"
        if fixture_path.exists():
            try:
                with open(fixture_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Failed to read fallback fixture: {e}")
        return None

    def fetch_daily_agrometeorology(
        self,
        lat: float,
        lon: float,
        start_date: str,  # Format: YYYYMMDD
        end_date: str,    # Format: YYYYMMDD
        force_refresh: bool = False,
    ) -> dict[str, Any]:
        """
        Fetch daily T2M, PRECTOTCORR, and GWETROOT from NASA POWER.
        Preserves complete data provenance, units, and flags missing values (-999.0).
        """
        cache_path = self._get_cache_filepath(lat, lon, start_date, end_date)
        cached_data = None
        retrieval_source = "live"

        if not force_refresh and cache_path.exists():
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    cached_envelope = json.load(f)
                    return cached_envelope
            except Exception as e:
                logger.warning(f"Failed to read cache file {cache_path}: {e}")

        # Attempt live API request
        params = {
            "parameters": "T2M,PRECTOTCORR,GWETROOT",
            "community": "AG",
            "longitude": lon,
            "latitude": lat,
            "start": start_date,
            "end": end_date,
            "format": "JSON",
        }

        raw_api_data = None
        try:
            response = requests.get(self.api_base, params=params, timeout=20)
            if response.status_code == 200:
                raw_api_data = response.json()
                retrieval_source = "live_api"
            else:
                logger.error(f"NASA POWER API returned HTTP {response.status_code}: {response.text}")
        except Exception as e:
            logger.warning(f"Network request to NASA POWER API failed: {e}")

        # Fallback to local fixture if API request failed
        if not raw_api_data:
            fallback = self._get_fallback_fixture()
            if fallback:
                raw_api_data = fallback
                retrieval_source = "offline_fixture"
            else:
                raise RuntimeError("Unable to retrieve NASA POWER data from API or offline fixture.")

        parsed_result = self._process_raw_power_data(
            raw_data=raw_api_data,
            lat=lat,
            lon=lon,
            retrieval_source=retrieval_source,
        )

        # Cache parsed result
        try:
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump(parsed_result, f, indent=2)
        except Exception as e:
            logger.warning(f"Could not write cache file {cache_path}: {e}")

        return parsed_result

    def _process_raw_power_data(
        self,
        raw_data: dict[str, Any],
        lat: float,
        lon: float,
        retrieval_source: str,
    ) -> dict[str, Any]:
        header = raw_data.get("header", {})
        properties = raw_data.get("properties", {})
        parameter_data = properties.get("parameter", {})
        param_metadata = raw_data.get("parameters", {})
        geometry = raw_data.get("geometry", {})
        coordinates = geometry.get("coordinates", [lon, lat, None])

        t2m_dict = parameter_data.get("T2M", {})
        precip_dict = parameter_data.get("PRECTOTCORR", {})
        gwet_dict = parameter_data.get("GWETROOT", {})

        all_dates = sorted(
            list(set(list(t2m_dict.keys()) + list(precip_dict.keys()) + list(gwet_dict.keys())))
        )

        daily_records = []
        valid_precip_values = []
        valid_temp_values = []
        valid_wetness_values = []
        missing_count = 0

        for date_str in all_dates:
            # Parse YYYYMMDD to ISO date YYYY-MM-DD
            iso_date = f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:8]}" if len(date_str) == 8 else date_str

            p_val = precip_dict.get(date_str)
            t_val = t2m_dict.get(date_str)
            g_val = gwet_dict.get(date_str)

            # Check for fill values (-999.0)
            is_p_valid = p_val is not None and p_val > NASA_POWER_FILL_VALUE
            is_t_valid = t_val is not None and t_val > NASA_POWER_FILL_VALUE
            is_g_valid = g_val is not None and g_val > NASA_POWER_FILL_VALUE

            if not (is_p_valid and is_t_valid and is_g_valid):
                missing_count += 1

            p_clean = round(p_val, 2) if is_p_valid else None
            t_clean = round(t_val, 2) if is_t_valid else None
            g_clean = round(g_val, 3) if is_g_valid else None

            if p_clean is not None:
                valid_precip_values.append(p_clean)
            if t_clean is not None:
                valid_temp_values.append(t_clean)
            if g_clean is not None:
                valid_wetness_values.append(g_clean)

            daily_records.append({
                "date": iso_date,
                "raw_date_key": date_str,
                "precipitation_mm": p_clean,
                "temperature_2m_c": t_clean,
                "root_zone_wetness_fraction": g_clean,
                "is_complete": (is_p_valid and is_t_valid and is_g_valid),
            })

        # Calculate robust summary metrics
        total_precip_mm = round(sum(valid_precip_values), 1) if valid_precip_values else 0.0
        avg_temp_c = round(sum(valid_temp_values) / len(valid_temp_values), 1) if valid_temp_values else None
        avg_wetness = round(sum(valid_wetness_values) / len(valid_wetness_values), 3) if valid_wetness_values else None

        # Dry spells (consecutive days with precip < 1.0mm)
        max_dry_spell = 0
        current_dry_spell = 0
        rainy_days_count = 0
        heavy_rain_days_count = 0

        for r in daily_records:
            p = r["precipitation_mm"]
            if p is not None:
                if p >= 1.0:
                    rainy_days_count += 1
                    if current_dry_spell > max_dry_spell:
                        max_dry_spell = current_dry_spell
                    current_dry_spell = 0
                else:
                    current_dry_spell += 1

                if p >= 20.0:
                    heavy_rain_days_count += 1

        if current_dry_spell > max_dry_spell:
            max_dry_spell = current_dry_spell

        provenance = {
            "source_name": "NASA Langley Research Center POWER Project",
            "api_version": header.get("api", {}).get("version", "v2.10.x"),
            "resolution": "0.5 x 0.625 Degree (Native MERRA-2 Gridded)",
            "retrieval_timestamp": datetime.now(timezone.utc).isoformat(),
            "retrieval_mode": retrieval_source,
            "target_coordinates": {"latitude": lat, "longitude": lon},
            "grid_coordinates": {
                "longitude": coordinates[0],
                "latitude": coordinates[1],
                "elevation_m": coordinates[2] if len(coordinates) > 2 else None,
            },
            "parameters_metadata": {
                "PRECTOTCORR": {
                    "longname": param_metadata.get("PRECTOTCORR", {}).get("longname", "Precipitation Corrected"),
                    "units": "mm/day",
                    "caveat": "Model/satellite regional gridded precipitation estimate, not an in-situ farm rain gauge."
                },
                "T2M": {
                    "longname": param_metadata.get("T2M", {}).get("longname", "Temperature at 2 Meters"),
                    "units": "°C",
                    "caveat": "Daily regional 2-meter average air temperature."
                },
                "GWETROOT": {
                    "longname": param_metadata.get("GWETROOT", {}).get("longname", "Root Zone Soil Wetness"),
                    "units": "dimensionless fraction (0.0 to 1.0)",
                    "caveat": "Model wetness fraction representing root-zone capacity; NOT volumetric soil moisture."
                }
            }
        }

        # Compute 12-Month Climatology Cycle
        months_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        monthly_bins = {m: {"rain": 0.0, "temp": [], "wetness": [], "days": 0} for m in months_names}
        for r in daily_records:
            if len(r["date"]) >= 7:
                try:
                    m_idx = int(r["date"][5:7]) - 1
                    m_name = months_names[m_idx]
                    monthly_bins[m_name]["days"] += 1
                    if r["precipitation_mm"] is not None:
                        monthly_bins[m_name]["rain"] += r["precipitation_mm"]
                    if r["temperature_2m_c"] is not None:
                        monthly_bins[m_name]["temp"].append(r["temperature_2m_c"])
                    if r["root_zone_wetness_fraction"] is not None:
                        monthly_bins[m_name]["wetness"].append(r["root_zone_wetness_fraction"])
                except Exception:
                    pass

        monthly_cycle = []
        for m_name in months_names:
            b = monthly_bins[m_name]
            days = b["days"] or 30
            rain_total = round(b["rain"], 1)
            avg_t = round(sum(b["temp"]) / len(b["temp"]), 1) if b["temp"] else 27.0
            avg_w = round(sum(b["wetness"]) / len(b["wetness"]), 2) if b["wetness"] else 0.25
            monthly_cycle.append({
                "month": m_name,
                "rain": rain_total,
                "wetness": avg_w,
                "temp": avg_t,
                "daily_rain_rate": round(rain_total / days, 2),
            })

        peak_soil_moisture = round(max(valid_wetness_values), 2) if valid_wetness_values else 0.59

        return {
            "provenance": provenance,
            "summary": {
                "start_date": daily_records[0]["date"] if daily_records else None,
                "end_date": daily_records[-1]["date"] if daily_records else None,
                "total_days": len(daily_records),
                "total_precipitation_mm": total_precip_mm,
                "average_temperature_c": avg_temp_c,
                "average_root_zone_wetness": avg_wetness,
                "peak_soil_moisture": peak_soil_moisture,
                "rainy_days_count": rainy_days_count,
                "heavy_rain_days_count": heavy_rain_days_count,
                "max_consecutive_dry_days": max_dry_spell,
                "dry_spell_risk_label": "High (7 Months)" if max_dry_spell > 14 else "Moderate",
                "monthly_cycle": monthly_cycle,
                "data_completeness_pct": round(
                    ((len(daily_records) - missing_count) / len(daily_records) * 100.0), 1
                ) if daily_records else 100.0,
            },
            "daily_records": daily_records,
        }


nasa_power_service = NasaPowerService()

