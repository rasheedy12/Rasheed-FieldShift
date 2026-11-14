import {
  LocationInfo,
  EnvironmentalProfile,
  CandidateCrop,
  RotationScenario,
} from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export async function fetchLocation(): Promise<LocationInfo> {
  const res = await fetch(`${API_BASE}/api/v1/location/default`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch location: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchEnvironmentalProfile(
  lat: number = 11.6765,
  lon: number = 10.1911,
  startDate: string = "20240501",
  endDate: string = "20241031"
): Promise<EnvironmentalProfile> {
  const url = `${API_BASE}/api/v1/environmental-profile?lat=${lat}&lon=${lon}&start_date=${startDate}&end_date=${endDate}`;
  const res = await fetch(url, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch environmental profile: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchCrops(): Promise<{ crops: CandidateCrop[] }> {
  const res = await fetch(`${API_BASE}/api/v1/crops`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch crops: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchScenarios(): Promise<{ scenarios: RotationScenario[] }> {
  const res = await fetch(`${API_BASE}/api/v1/scenarios`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch scenarios: ${res.statusText}`);
  }
  return res.json();
}

