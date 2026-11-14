"use client";

import { useEffect, useState } from "react";
import {
  fetchLocation,
  fetchEnvironmentalProfile,
  fetchCrops,
  fetchScenarios,
} from "../lib/api";
import {
  LocationInfo,
  EnvironmentalProfile,
  CandidateCrop,
  RotationScenario,
} from "../types";
import { SeasonTimelineChart } from "../components/SeasonTimelineChart";
import { GeospatialFootprintMap } from "../components/GeospatialFootprintMap";

export default function Home() {
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [profile, setProfile] = useState<EnvironmentalProfile | null>(null);
  const [crops, setCrops] = useState<CandidateCrop[]>([]);
  const [scenarios, setScenarios] = useState<RotationScenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("scenario_2");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [locData, envData, cropsData, scenData] = await Promise.all([
          fetchLocation(),
          fetchEnvironmentalProfile(11.6765, 10.1911, "20240501", "20241031"),
          fetchCrops(),
          fetchScenarios(),
        ]);
        setLocation(locData);
        setProfile(envData);
        setCrops(cropsData.crops);
        setScenarios(scenData.scenarios);
      } catch (err: any) {
        console.error("Failed to load initial FieldShift data:", err);
        setError(err.message || "Failed to load agricultural data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Mission Banner */}
      <header className="border-b border-emerald-800/20 pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 mb-2">
              <span>NASA Space Apps Challenge 2026</span>
              <span className="text-emerald-500">•</span>
              <span>Field Shift: Adapting Farms with NASA Data</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-900 dark:text-emerald-100">
              Rasheed FieldShift
            </h1>
            <p className="mt-1 text-base sm:text-lg text-emerald-700 dark:text-emerald-400 font-medium italic">
              “Your data. Your land. Smarter farming decisions.”
            </p>
          </div>

          {/* Location & Status Badge */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:items-end">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {location ? location.location_name : "Azare, Bauchi State, Nigeria"}
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              11.6765° N, 10.1911° E • Sudan Savanna
            </span>
            {profile && (
              <span className="mt-2 text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Source: {profile.provenance.source_name} ({profile.provenance.retrieval_mode})
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Loading & Error States */}
      {loading && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            Fetching environmental profile from NASA POWER and local crop models...
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-sm">
          <strong>Notice:</strong> {error}
        </div>
      )}

      {!loading && profile && (
        <>
          {/* Section 1: Environmental Baseline Summary */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Regional Climate Baseline (2024 Rainy Season)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Period: {profile.summary.start_date} to {profile.summary.end_date} ({profile.summary.total_days} days monitored)
                </p>
              </div>
              <div className="text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 mt-2 sm:mt-0 font-medium">
                Data Completeness: {profile.summary.data_completeness_pct}% (0 silent replacements)
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1: Precipitation */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <span>Total Rainfall</span>
                    <span className="text-sky-600 dark:text-sky-400 font-mono">PRECTOTCORR</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                      {profile.summary.total_precipitation_mm}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">mm</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{profile.summary.rainy_days_count}</span> rainy days (≥1.0mm) • <span className="font-semibold text-slate-700 dark:text-slate-300">{profile.summary.heavy_rain_days_count}</span> heavy days (≥20mm)
                </div>
              </div>

              {/* Metric 2: Dry Spell Risk */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <span>Max Dry Spell</span>
                    <span className="text-amber-600 dark:text-amber-400 font-mono">Dry Risk</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-amber-700 dark:text-amber-400">
                      {profile.summary.max_consecutive_dry_days}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">consecutive dry days</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  Early/mid-season dry spells require drought-hardy seed varieties.
                </div>
              </div>

              {/* Metric 3: Air Temperature */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <span>Average 2m Temp</span>
                    <span className="text-rose-600 dark:text-rose-400 font-mono">T2M</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                      {profile.summary.average_temperature_c}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">°C</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  Regional daily average at 2-meter altitude (MERRA-2 assimilation).
                </div>
              </div>

              {/* Metric 4: Root-Zone Soil Wetness */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <span>Root Wetness Fraction</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">GWETROOT</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                      {profile.summary.average_root_zone_wetness}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">fraction (0–1)</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  Model wetness fraction (0.0 dry – 1.0 saturated), NOT volumetric moisture.
                </div>
              </div>
            </div>

            {/* Scientific Caveat Alert */}
            <div className="p-3.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
              <span className="text-slate-500 font-bold">ℹ️ Provenance & Spatial Scale:</span>
              <span>
                These figures are derived from NASA POWER regional gridded assimilation (0.5° × 0.625° scale, ~50km grid box around Azare). They represent broader climate conditions and do not substitute for on-field soil tests or localized rain gauges.
              </span>
            </div>

            {/* Interactive Timeline & Rainfall Dynamics */}
            <SeasonTimelineChart records={profile.daily_records} />

            {/* Geospatial Footprint & Satellite Resolution Scale */}
            <GeospatialFootprintMap provenance={profile.provenance} />
          </section>

          {/* Section 2: Crop Rotation Hypotheses Comparator */}
          <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Crop-Rotation Scenario Evaluation
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Compare multi-season sequences to understand biological diversity, nutrient demand, and pest disruption in rain-fed Sudan Savanna soils.
              </p>
            </div>

            {/* Scenario Selector Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {scenarios.map((scen) => {
                const isSelected = scen.id === selectedScenarioId;
                return (
                  <button
                    key={scen.id}
                    onClick={() => setSelectedScenarioId(scen.id)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-sm ring-1 ring-emerald-600"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                        {scen.id.replace("_", " ")}
                      </span>
                      {isSelected && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-600 text-white font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      {scen.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1 font-mono">
                      {scen.sequence.join(" → ")}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Scenario Details Box */}
            {selectedScenario && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>{selectedScenario.name}</span>
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {selectedScenario.description}
                  </p>
                </div>

                {/* 3-Season Sequence Flow Visualizer */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {selectedScenario.sequence.map((cropName, idx) => {
                    const cropInfo = crops.find(
                      (c) => c.name.toLowerCase().includes(cropName.toLowerCase()) || cropName.toLowerCase().includes(c.name.toLowerCase())
                    );
                    return (
                      <div
                        key={idx}
                        className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 relative flex flex-col justify-between"
                      >
                        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                          Season {idx + 1}
                        </div>
                        <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                          {cropName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 space-y-1">
                          {cropInfo && (
                            <>
                              <div><span className="font-semibold">Duration:</span> {cropInfo.season_duration_days} days</div>
                              <div><span className="font-semibold">Water Need:</span> {cropInfo.water_requirement_mm} mm</div>
                              <div><span className="font-semibold">Drought Tolerance:</span> {cropInfo.drought_tolerance}</div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Agronomic Tradeoffs (Benefits vs Risks) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                      <span>✓ Agronomic Advantages</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {selectedScenario.agronomic_tradeoffs.benefits}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60">
                    <div className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 mb-1 flex items-center gap-1.5">
                      <span>⚠ Agronomic Vulnerabilities & Risks</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {selectedScenario.agronomic_tradeoffs.risks}
                    </p>
                  </div>
                </div>

                {/* Honest Integrity Statement */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <p>
                    <strong>Important Agronomic Principle:</strong> Nitrogen contribution from legumes (cowpea or groundnut) is not an automatic fixed value. It depends on nodulation effectiveness, soil moisture, available phosphorus, and whether crop residues are incorporated back into the soil or entirely removed for livestock feed.
                  </p>
                  <p>
                    FieldShift does not output uncalibrated yield or profit numbers. Outputs represent qualitative environmental risk and agronomic tradeoffs.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Section 3: Azare Candidate Crops Catalog */}
          <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Azare Candidate Crops Catalog
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Agronomic requirements under evaluation for rain-fed Sudan Savanna cultivation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {crops.map((crop) => (
                <div
                  key={crop.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
                        {crop.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
                        {crop.drought_tolerance}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 italic mt-0.5 font-medium">
                      {crop.botanical_name} • {crop.role}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5">
                      {crop.local_status}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div>
                      <span className="block font-semibold text-slate-700 dark:text-slate-300">Duration</span>
                      {crop.season_duration_days} days
                    </div>
                    <div>
                      <span className="block font-semibold text-slate-700 dark:text-slate-300">Rainfall Need</span>
                      {crop.water_requirement_mm} mm
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Footer & Provenance Citations */}
      <footer className="pt-8 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <strong>Rasheed FieldShift</strong> — NASA Space Apps Challenge 2026.
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-4">
            <a
              href="https://power.larc.nasa.gov/"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              NASA POWER Docs
            </a>
            <a
              href="https://docs.isric.org/globaldata/soilgrids/"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              SoilGrids ISRIC Reference
            </a>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Disclaimer: NASA Earth-observation products are model-derived and satellite-assimilated datasets at regional resolutions (~50km). Decision support indicators are designed for scenario planning and must be combined with local agricultural extension expertise and farmer field observations.
        </p>
      </footer>
    </main>
  );
}
