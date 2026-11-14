export interface LocationInfo {
  location_name: string;
  latitude: number;
  longitude: number;
  agroecological_zone: string;
  state: string;
  country: string;
  farming_system: string;
  typical_rainy_season: string;
}

export interface ParameterMetadata {
  longname: string;
  units: string;
  caveat: string;
}

export interface ProvenanceInfo {
  source_name: string;
  api_version: string;
  resolution: string;
  retrieval_timestamp: string;
  retrieval_mode: "live" | "live_api" | "offline_fixture" | "cached";
  target_coordinates: {
    latitude: number;
    longitude: number;
  };
  grid_coordinates: {
    latitude: number;
    longitude: number;
    elevation_m: number | null;
  };
  parameters_metadata: {
    PRECTOTCORR: ParameterMetadata;
    T2M: ParameterMetadata;
    GWETROOT: ParameterMetadata;
  };
}

export interface DailyRecord {
  date: string;
  raw_date_key: string;
  precipitation_mm: number | null;
  temperature_2m_c: number | null;
  root_zone_wetness_fraction: number | null;
  is_complete: boolean;
}

export interface EnvironmentalSummary {
  start_date: string;
  end_date: string;
  total_days: number;
  total_precipitation_mm: number;
  average_temperature_c: number | null;
  average_root_zone_wetness: number | null;
  rainy_days_count: number;
  heavy_rain_days_count: number;
  max_consecutive_dry_days: number;
  data_completeness_pct: number;
}

export interface EnvironmentalProfile {
  provenance: ProvenanceInfo;
  summary: EnvironmentalSummary;
  daily_records: DailyRecord[];
}

export interface CandidateCrop {
  id: string;
  name: string;
  botanical_name: string;
  role: string;
  season_duration_days: string;
  water_requirement_mm: string;
  drought_tolerance: string;
  local_status: string;
}

export interface RotationScenario {
  id: string;
  name: string;
  sequence: string[];
  description: string;
  agronomic_tradeoffs: {
    benefits: string;
    risks: string;
  };
}

