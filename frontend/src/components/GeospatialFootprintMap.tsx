"use client";

import { useState } from "react";
import { ProvenanceInfo } from "../types";

interface GeospatialFootprintMapProps {
  provenance: ProvenanceInfo;
}

export function GeospatialFootprintMap({ provenance }: GeospatialFootprintMapProps) {
  const [activeTab, setActiveTab] = useState<"footprint" | "context">("footprint");

  const targetLat = provenance.target_coordinates.latitude;
  const targetLon = provenance.target_coordinates.longitude;
  const gridLat = provenance.grid_coordinates.latitude;
  const gridLon = provenance.grid_coordinates.longitude;
  const elevation = provenance.grid_coordinates.elevation_m ?? 422;

  // NASA POWER MERRA-2 Grid Boundaries (0.5 deg Lat x 0.625 deg Lon)
  const gridNorth = (Math.ceil(targetLat * 2) / 2).toFixed(4);
  const gridSouth = (Math.floor(targetLat * 2) / 2).toFixed(4);
  const gridWest = (Math.floor(targetLon / 0.625) * 0.625).toFixed(4);
  const gridEast = ((Math.floor(targetLon / 0.625) + 1) * 0.625).toFixed(4);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Geospatial Footprint & Satellite Resolution Scale</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Visualizing the relationship between your specific farm location and NASA's ~50km regional gridded model.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab("footprint")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "footprint"
                ? "bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            NASA Grid Cell Footprint
          </button>
          <button
            onClick={() => setActiveTab("context")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "context"
                ? "bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Sudan Savanna Context
          </button>
        </div>
      </div>

      {/* Main Visualizer Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: Interactive SVG Map Schematic */}
        <div className="lg:col-span-7 bg-slate-950 rounded-xl p-4 border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center min-h-[280px]">
          <svg viewBox="0 0 500 300" className="w-full h-auto select-none max-w-[460px]">
            {/* Background Map Grid */}
            <defs>
              <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="500" height="300" fill="#090d16" />
            <rect width="500" height="300" fill="url(#smallGrid)" />

            {/* Agroecological savanna background shape */}
            <path
              d="M 20 60 Q 150 40 300 70 T 480 80 L 480 270 Q 320 290 180 260 T 20 250 Z"
              fill="#064e3b"
              fillOpacity="0.15"
              stroke="#047857"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* Regional Settlements / Surrounding Towns */}
            <g className="text-slate-500 fill-slate-400 text-[10px] font-sans">
              <circle cx="100" cy="90" r="3" fill="#64748b" />
              <text x="110" y="93">Jama'are</text>

              <circle cx="390" cy="110" r="3" fill="#64748b" />
              <text x="340" y="113">Katagum</text>

              <circle cx="130" cy="220" r="3" fill="#64748b" />
              <text x="140" y="223">Shira</text>

              <circle cx="360" cy="230" r="3" fill="#64748b" />
              <text x="320" y="233">Misau</text>
            </g>

            {/* NASA MERRA-2 Grid Cell (Box: 0.5° x 0.625°) */}
            <g>
              <rect
                x="150"
                y="65"
                width="200"
                height="160"
                fill="#0284c7"
                fillOpacity={activeTab === "footprint" ? "0.2" : "0.08"}
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="6 4"
                rx="4"
              />
              <text x="156" y="82" fill="#7dd3fc" fontSize="9" fontWeight="bold">
                NASA POWER Native Grid Box (~50km × 60km)
              </text>
              <text x="156" y="94" fill="#38bdf8" fontSize="8" fontFamily="monospace">
                Lat: {gridSouth}°N–{gridNorth}°N | Lon: {gridWest}°E–{gridEast}°E
              </text>
            </g>

            {/* Center Grid Interpolation Point */}
            <circle cx="250" cy="145" r="4" fill="#38bdf8" />
            <text x="258" y="142" fill="#93c5fd" fontSize="9" fontFamily="monospace">
              Grid Center ({gridLat}°N, {gridLon}°E)
            </text>

            {/* Exact Reference Farm: Azare Target Coordinates */}
            <g>
              {/* Radar pulse rings */}
              <circle cx="235" cy="155" r="18" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.4" />
              <circle cx="235" cy="155" r="10" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.7" />
              <circle cx="235" cy="155" r="5" fill="#10b981" />
              <circle cx="235" cy="155" r="2" fill="#ffffff" />

              {/* Farm Pin Label */}
              <rect x="220" y="172" width="105" height="28" rx="4" fill="#065f46" stroke="#34d399" strokeWidth="1" />
              <text x="226" y="184" fill="#ecfdf5" fontSize="9" fontWeight="bold">
                📍 Azare Field Reference
              </text>
              <text x="226" y="195" fill="#a7f3d0" fontSize="8" fontFamily="monospace">
                {targetLat}°N, {targetLon}°E
              </text>
            </g>

            {/* Map Compass */}
            <g transform="translate(450, 40)">
              <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#334155" strokeWidth="1" />
              <path d="M 0 -10 L 4 0 L 0 -3 L -4 0 Z" fill="#ef4444" />
              <path d="M 0 10 L 4 0 L 0 3 L -4 0 Z" fill="#94a3b8" />
              <text x="-3" y="-12" fill="#f8fafc" fontSize="8" fontWeight="bold">N</text>
            </g>

            {/* Distance Scale Bar */}
            <g transform="translate(30, 275)">
              <line x1="0" y1="0" x2="80" y2="0" stroke="#94a3b8" strokeWidth="2" />
              <line x1="0" y1="-3" x2="0" y2="3" stroke="#94a3b8" strokeWidth="2" />
              <line x1="80" y1="-3" x2="80" y2="3" stroke="#94a3b8" strokeWidth="2" />
              <text x="22" y="-5" fill="#94a3b8" fontSize="8" fontFamily="monospace">~25 km</text>
            </g>
          </svg>
        </div>

        {/* Right Side: Key Metadata and Educational Rules */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Target Coordinates:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {targetLat}° N, {targetLon}° E
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">NASA Grid Cell Center:</span>
                <span className="font-mono font-semibold text-sky-700 dark:text-sky-300">
                  {gridLat}° N, {gridLon}° E
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Terrain Elevation:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  ~{elevation} meters ASL
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Spatial Resolution:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  0.5° × 0.625° (~55 × 68 km)
                </span>
              </div>
            </div>

            {/* Scientific Rule Cards */}
            <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-xs space-y-1">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                ✓ What NASA Satellite Grids Provide:
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Reliable macro-climate trends, start and cessation dates of seasonal rains, regional dry spell frequency, and historical climate comparisons across the Katagum agrarian belt.
              </p>
            </div>

            <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs space-y-1">
              <span className="font-bold text-amber-800 dark:text-amber-300 block">
                ⚠ What Local Field Validation Must Add:
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                In-field soil texture (sandy loam vs. clay pan), localized runoff or drainage depressions, farm weed seed banks (e.g. <em>Striga</em>), and farmer fertilizer/residue practices.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 italic">
            NASA POWER data is based on the Goddard Earth Observing System (GEOS) atmospheric assimilation model and satellite precipitation estimates.
          </div>
        </div>
      </div>
    </div>
  );
}
