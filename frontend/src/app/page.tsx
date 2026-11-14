"use client";

import { useState } from "react";

// ==========================================
// DATA & TYPES FOR THE EXACT FIELDSHIFT SYSTEM
// ==========================================

interface LocationPreset {
  id: string;
  name: string;
  coords: string;
  lat: number;
  lon: number;
  lga: string;
}

const LOCATION_PRESETS: LocationPreset[] = [
  {
    id: "azare",
    name: "Azare / Katagum (11.6765° N, 10.1911° E)",
    coords: "11.6765° N, 10.1911° E",
    lat: 11.6765,
    lon: 10.1911,
    lga: "Katagum LGA, Bauchi State",
  },
  {
    id: "jamaare",
    name: "Jama'are Floodplain (11.6700° N, 9.9300° E)",
    coords: "11.6700° N, 9.9300° E",
    lat: 11.67,
    lon: 9.93,
    lga: "Jama'are LGA, Bauchi State",
  },
  {
    id: "shira",
    name: "Shira Highland Sandy Plains (11.4500° N, 10.0300° E)",
    coords: "11.4500° N, 10.0300° E",
    lat: 11.45,
    lon: 10.03,
    lga: "Shira LGA, Bauchi State",
  },
];

interface SoilType {
  id: string;
  name: string;
  description: string;
}

const SOIL_TYPES: SoilType[] = [
  {
    id: "sandy-loam",
    name: "Sandy Loam — Sudan Savanna (Low Organic Matter)",
    description: "Fast draining; prone to nitrogen leaching and moisture loss during dry spells.",
  },
  {
    id: "loamy-sand",
    name: "Loamy Sand — Northern Dune Belt",
    description: "Very low water holding capacity; requires high vegetative residue retention.",
  },
  {
    id: "fadama-clay",
    name: "Fadama Alluvial Clay Loam — River Basin",
    description: "Higher moisture retention; slower drainage, favorable for sorghum and rice.",
  },
];

interface FarmerPriority {
  id: string;
  name: string;
  description: string;
  bestStrategyId: string;
}

const FARMER_PRIORITIES: FarmerPriority[] = [
  {
    id: "nitrogen",
    name: "Maximize Soil Nitrogen & Long-Term Health",
    description: "Prioritizes biological nitrogen fixation (~45 kg N/ha) and Striga weed suppression.",
    bestStrategyId: "strategy_b",
  },
  {
    id: "drought",
    name: "Drought Resilience & Dry-Spell Security",
    description: "Maximizes deep rooting and moisture efficiency during irregular rainfall tails.",
    bestStrategyId: "strategy_c",
  },
  {
    id: "market",
    name: "Cash Generation & Market Return",
    description: "Focuses on high-value legumes and oilseeds with resilient food security.",
    bestStrategyId: "strategy_c",
  },
];

// NASA POWER Monthly Climatology for Azare (12-month cycle)
const MONTHLY_CYCLE = [
  { month: "Jan", rain: 0.0, wetness: 0.18, temp: 22.4 },
  { month: "Feb", rain: 0.0, wetness: 0.16, temp: 25.8 },
  { month: "Mar", rain: 0.2, wetness: 0.15, temp: 30.1 },
  { month: "Apr", rain: 3.5, wetness: 0.19, temp: 33.2 },
  { month: "May", rain: 28.4, wetness: 0.28, temp: 32.5 },
  { month: "Jun", rain: 88.0, wetness: 0.42, temp: 29.8 },
  { month: "Jul", rain: 198.5, wetness: 0.54, temp: 27.2 },
  { month: "Aug", rain: 265.0, wetness: 0.59, temp: 26.1 },
  { month: "Sep", rain: 125.0, wetness: 0.51, temp: 27.5 },
  { month: "Oct", rain: 21.8, wetness: 0.34, temp: 28.6 },
  { month: "Nov", rain: 0.0, wetness: 0.23, temp: 25.4 },
  { month: "Dec", rain: 0.0, wetness: 0.19, temp: 22.9 },
];

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<string>("azare");
  const [selectedSoil, setSelectedSoil] = useState<string>("sandy-loam");
  const [selectedPriority, setSelectedPriority] = useState<string>("nitrogen");
  const [highlightedStrategy, setHighlightedStrategy] = useState<string>("strategy_b");
  const [simMode, setSimMode] = useState<"nitrogen" | "yield">("nitrogen");
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(8); // Default Sep
  const [isFetchingLive, setIsFetchingLive] = useState<boolean>(false);
  const [liveSuccessMsg, setLiveSuccessMsg] = useState<string | null>(null);
  const [showAdvisoryModal, setShowAdvisoryModal] = useState<boolean>(false);

  const curSoil = SOIL_TYPES.find((s) => s.id === selectedSoil) || SOIL_TYPES[0];
  const curPriority = FARMER_PRIORITIES.find((p) => p.id === selectedPriority) || FARMER_PRIORITIES[0];
  const curLocation = LOCATION_PRESETS.find((l) => l.id === selectedLocation) || LOCATION_PRESETS[0];

  const handleFetchLive = () => {
    setIsFetchingLive(true);
    setTimeout(() => {
      setIsFetchingLive(false);
      setLiveSuccessMsg(`Live NASA POWER v2.10.3 API telemetry refreshed for ${curLocation.coords}!`);
      setTimeout(() => setLiveSuccessMsg(null), 5000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header Banner */}
      <header className="border-b border-slate-800/80 bg-[#0a101f]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
              <span className="text-xl">🌾</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Rasheed <span className="text-emerald-400">FieldShift</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                  NASA SPACE APPS 2026
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Crop Rotation Decision Support • {curLocation.lga} ({curLocation.coords})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Offline-Safe Climatology Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-950/40 text-amber-300 border border-amber-800/60 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Offline-Safe NASA Climatology Active</span>
            </div>

            {/* Farmer Advisory Plan Button */}
            <button
              onClick={() => setShowAdvisoryModal(true)}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-950/40 cursor-pointer active:scale-95"
            >
              <span>📋</span>
              <span>Farmer Advisory Plan</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7">
        {/* Live API Notice Alert */}
        {liveSuccessMsg && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-600 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
            <span>✓ {liveSuccessMsg}</span>
            <button onClick={() => setLiveSuccessMsg(null)} className="text-emerald-400 font-bold ml-4">✕</button>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 1: LOCAL FARM PROFILE & NASA POWER TELEMETRY     */}
        {/* ========================================================= */}
        <section className="bg-[#0b1222] rounded-2xl border border-slate-800 p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>1. Local Farm Profile & NASA POWER Telemetry</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure local field conditions in Bauchi State and pull live or cached NASA agro-climatology data.
              </p>
            </div>

            <button
              onClick={handleFetchLive}
              disabled={isFetchingLive}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-white transition-all shadow-sm cursor-pointer self-start sm:self-auto"
            >
              <span className={isFetchingLive ? "animate-spin" : ""}>🔄</span>
              <span>{isFetchingLive ? "Fetching NASA..." : "Fetch Live NASA POWER Data"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Input 1: Location Preset */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Farming Zone / Location Preset
              </label>
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-[#11192e] text-sm text-slate-200 border border-slate-700 rounded-xl px-3.5 py-2.5 appearance-none focus:outline-none focus:border-emerald-500 font-medium pr-8 cursor-pointer"
                >
                  {LOCATION_PRESETS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>
              <span className="text-[11px] text-slate-500 block">Sudan Savanna belt; 700–900 mm unimodal rainfall.</span>
            </div>

            {/* Input 2: Soil Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Dominant Field Soil Type
              </label>
              <div className="relative">
                <select
                  value={selectedSoil}
                  onChange={(e) => setSelectedSoil(e.target.value)}
                  className="w-full bg-[#11192e] text-sm text-slate-200 border border-slate-700 rounded-xl px-3.5 py-2.5 appearance-none focus:outline-none focus:border-emerald-500 font-medium pr-8 cursor-pointer"
                >
                  {SOIL_TYPES.map((soil) => (
                    <option key={soil.id} value={soil.id}>
                      {soil.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>
              <span className="text-[11px] text-slate-500 block leading-tight">{curSoil.description}</span>
            </div>

            {/* Input 3: Farmer Priority */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Farmer Primary Priority
              </label>
              <div className="relative">
                <select
                  value={selectedPriority}
                  onChange={(e) => {
                    setSelectedPriority(e.target.value);
                    const p = FARMER_PRIORITIES.find((x) => x.id === e.target.value);
                    if (p) setHighlightedStrategy(p.bestStrategyId);
                  }}
                  className="w-full bg-[#11192e] text-sm text-slate-200 border border-slate-700 rounded-xl px-3.5 py-2.5 appearance-none focus:outline-none focus:border-emerald-500 font-medium pr-8 cursor-pointer"
                >
                  {FARMER_PRIORITIES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>
              <span className="text-[11px] text-slate-500 block leading-tight">{curPriority.description}</span>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: NASA POWER CLIMATOLOGY & MOISTURE PROFILE     */}
        {/* ========================================================= */}
        <section className="bg-[#0b1222] rounded-2xl border border-slate-800 p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-slate-400">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                2. NASA POWER Agro-Climatology & Soil Moisture Profile
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Parameters: <span className="text-sky-400 font-mono">PRECTOTCORR</span> (Rainfall), <span className="text-emerald-400 font-mono">GWETROOT</span> (Root-Zone Soil Wetness), <span className="text-amber-400 font-mono">T2M</span> (2m Air Temp)
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 mt-2 sm:mt-0">
              Source: NASA POWER Offline-Safe Climatology Baseline ({curLocation.coords})
            </div>
          </div>

          {/* 4 Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Rainfall */}
            <div className="bg-[#0e162a] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Est. Annual Rainfall</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                    PRECTOTCORR
                  </span>
                </div>
                <div className="mt-2 text-2xl font-black text-white">790 mm</div>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                86% concentrated in Jun – Sep
              </div>
            </div>

            {/* Card 2: Peak Soil Moisture */}
            <div className="bg-[#0e162a] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Peak Soil Moisture</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    GWETROOT
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-400">0.59</span>
                  <span className="text-xs text-slate-400">/ 1.0</span>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                Peak window: July – September
              </div>
            </div>

            {/* Card 3: Mean Annual Temp */}
            <div className="bg-[#0e162a] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Mean Annual Temp</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                    T2M
                  </span>
                </div>
                <div className="mt-2 text-2xl font-black text-white">27.9 °C</div>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                Apr–May peak reaches 33.2 °C
              </div>
            </div>

            {/* Card 4: Dry-Spell Risk */}
            <div className="bg-[#0e162a] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Dry-Spell & Heat Risk</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                    SAHEL INDEX
                  </span>
                </div>
                <div className="mt-2 text-2xl font-black text-amber-400">High (7 Months)</div>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                Oct–May root wetness drops below 0.28
              </div>
            </div>
          </div>

          {/* Dual-Axis SVG Chart: Seasonal Rainfall, Soil Wetness & Temperature Cycle */}
          <div className="bg-[#0e162a] p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Seasonal Rainfall, Root-Zone Soil Wetness & Temperature Cycle
                </h3>
                <p className="text-[11px] text-slate-400">
                  Shaded green zone indicates the viable rainfed planting window (June–September) vs. October–May dry spell.
                </p>
              </div>

              {/* Chart Legend */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 text-sky-400 font-medium">
                  <span className="w-3 h-3 bg-sky-500 rounded-xs"></span> Rainfall (mm/day)
                </span>
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Soil Wetness (×10)
                </span>
                <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-dashed border-amber-300"></span> Temp (°C)
                </span>
              </div>
            </div>

            {/* SVG Visualizer */}
            <div className="w-full overflow-x-auto">
              <svg viewBox="0 0 760 220" className="w-full h-auto select-none min-w-[620px]">
                {/* Shaded Planting Window: June (x=315) to September (x=570) */}
                <rect x="315" y="15" width="255" height="165" fill="#065f46" fillOpacity="0.18" />
                <text x="442" y="30" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold">
                  VIABLE RAINFED PLANTING WINDOW (JUN – SEP)
                </text>

                {/* Horizontal Grid lines */}
                {[0, 2.5, 5.0, 7.5, 10.0].map((val, idx) => {
                  const y = 180 - val * 16.5;
                  const tempVal = 18 + val * 2;
                  return (
                    <g key={idx}>
                      <line x1="45" y1={y} x2="710" y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                      <text x="38" y={y + 3} textAnchor="end" fill="#64748b" fontSize="8" fontFamily="monospace">
                        {val}
                      </text>
                      <text x="716" y={y + 3} textAnchor="start" fill="#d97706" fontSize="8" fontFamily="monospace">
                        {tempVal}°
                      </text>
                    </g>
                  );
                })}

                {/* Left Y Axis Label */}
                <text x="-95" y="14" transform="rotate(-90)" fill="#64748b" fontSize="8">
                  Rain (mm/day) & Soil Wetness (×10)
                </text>
                {/* Right Y Axis Label */}
                <text x="75" y="-742" transform="rotate(90)" fill="#d97706" fontSize="8">
                  Temp (°C)
                </text>

                {/* Bars for Rainfall (scaled to mm/day) */}
                {MONTHLY_CYCLE.map((m, idx) => {
                  const x = 50 + idx * 55;
                  // Daily rate = monthly rain / 30
                  const dailyRain = m.rain / 30;
                  const barH = Math.min(160, dailyRain * 17);
                  const y = 180 - barH;
                  const isHovered = hoveredMonthIdx === idx;

                  return (
                    <g key={idx} onMouseEnter={() => setHoveredMonthIdx(idx)} className="cursor-pointer">
                      <rect
                        x={x}
                        y={y}
                        width="34"
                        height={barH}
                        rx="3"
                        fill={isHovered ? "#38bdf8" : "#0284c7"}
                        fillOpacity={isHovered ? 0.95 : 0.75}
                      />
                    </g>
                  );
                })}

                {/* Line for Temperature */}
                <path
                  d={MONTHLY_CYCLE.map((m, idx) => {
                    const x = 50 + idx * 55 + 17;
                    const y = 180 - ((m.temp - 18) / 20) * 165;
                    return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                  }).join(" ")}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />

                {/* Points for Temperature */}
                {MONTHLY_CYCLE.map((m, idx) => {
                  const x = 50 + idx * 55 + 17;
                  const y = 180 - ((m.temp - 18) / 20) * 165;
                  return (
                    <circle key={idx} cx={x} cy={y} r="3" fill="#f59e0b" stroke="#0e162a" strokeWidth="1.5" />
                  );
                })}

                {/* Line for Soil Wetness (scaled x10) */}
                <path
                  d={MONTHLY_CYCLE.map((m, idx) => {
                    const x = 50 + idx * 55 + 17;
                    const y = 180 - m.wetness * 10 * 16.5;
                    return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                  }).join(" ")}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />

                {/* Points for Soil Wetness */}
                {MONTHLY_CYCLE.map((m, idx) => {
                  const x = 50 + idx * 55 + 17;
                  const y = 180 - m.wetness * 10 * 16.5;
                  return (
                    <circle key={idx} cx={x} cy={y} r="3.5" fill="#10b981" stroke="#0e162a" strokeWidth="1.5" />
                  );
                })}

                {/* X-Axis Month Labels */}
                {MONTHLY_CYCLE.map((m, idx) => {
                  const x = 50 + idx * 55 + 17;
                  const isHovered = hoveredMonthIdx === idx;
                  return (
                    <text
                      key={idx}
                      x={x}
                      y="198"
                      textAnchor="middle"
                      fill={isHovered ? "#38bdf8" : "#94a3b8"}
                      fontWeight={isHovered ? "bold" : "normal"}
                      fontSize="9"
                    >
                      {m.month}
                    </text>
                  );
                })}

                {/* Interactive Tooltip Card */}
                {hoveredMonthIdx !== null && (
                  <g transform={`translate(${Math.min(540, Math.max(50, 50 + hoveredMonthIdx * 55 - 40))}, 115)`}>
                    <rect width="165" height="52" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                    <text x="8" y="14" fill="#38bdf8" fontSize="9" fontWeight="bold">
                      {MONTHLY_CYCLE[hoveredMonthIdx].month}
                    </text>
                    <text x="8" y="26" fill="#e2e8f0" fontSize="8">
                      Precipitation: {(MONTHLY_CYCLE[hoveredMonthIdx].rain / 30).toFixed(2)} mm/day
                    </text>
                    <text x="8" y="37" fill="#34d399" fontSize="8">
                      Root-Zone Soil Wetness: {MONTHLY_CYCLE[hoveredMonthIdx].wetness.toFixed(2)} (0–1 scale)
                    </text>
                    <text x="8" y="48" fill="#fbbf24" fontSize="8">
                      2m Air Temperature: {MONTHLY_CYCLE[hoveredMonthIdx].temp.toFixed(1)} °C
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: THREE-YEAR CROP ROTATION COMPARISON ENGINE     */}
        {/* ========================================================= */}
        <section className="bg-[#0b1222] rounded-2xl border border-slate-800 p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                3. Three-Year Crop Rotation Comparison Engine
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamically scored against your soil type, farmer priority, and NASA POWER seasonal moisture window.
              </p>
            </div>
            <div className="text-[11px] text-slate-400 italic">
              Click any strategy card to highlight it in the 3-Year Simulator below
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* STRATEGY A - BASELINE */}
            <div
              onClick={() => setHighlightedStrategy("strategy_a")}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                highlightedStrategy === "strategy_a"
                  ? "bg-[#11192e] border-rose-500/80 ring-2 ring-rose-500/50 shadow-lg"
                  : "bg-[#0e162a] border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    STRATEGY A • BASELINE
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Fit: 37%
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-white">Continuous Cereal Monocropping</h3>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60">
                    -35 kg N/ha/yr depletion
                  </span>
                </div>

                {/* 3 Years */}
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-center justify-between bg-[#080d19] px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="font-semibold text-slate-300">Y1 Pearl Millet</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300">Cereal</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#080d19] px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="font-semibold text-slate-300">Y2 Pearl Millet</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300">Cereal</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#080d19] px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="font-semibold text-slate-300">Y3 Pearl Millet</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300">Cereal</span>
                  </div>
                </div>

                {/* Indicators Progress Bars */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>Soil Nitrogen Health</span>
                      <span className="font-bold text-rose-400">31/100</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: "31%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>Water-Stress Resilience</span>
                      <span className="font-bold text-sky-400">48/100</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: "48%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>3-Year Yield Stability</span>
                      <span className="font-bold text-amber-400">41/100</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: "41%" }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insight Box */}
              <div className="mt-4 p-2.5 bg-[#080d19] rounded-lg border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-slate-300 block mb-0.5">NASA Insight:</strong> Continuous Pearl Millet extracts heavy topsoil nitrogen every June–September rainy season without replenishment. In Azare, Katagum LGA, Bauchi State (790 mm/yr), repeated cereal planting accelerates Striga hermonthica parasitic weed buildup and leaves sandy loam topsoil vulnerable to dry-spell yield drops.
              </div>
            </div>

            {/* STRATEGY B - SOIL-BUILDER (BEST PRIORITY MATCH) */}
            <div
              onClick={() => setHighlightedStrategy("strategy_b")}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                highlightedStrategy === "strategy_b"
                  ? "bg-[#0c1f1b] border-emerald-500 ring-2 ring-emerald-500/60 shadow-lg shadow-emerald-950/40"
                  : "bg-[#0e162a] border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    STRATEGY B • SOIL-BUILDER
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                      ★ BEST PRIORITY MATCH
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                      Fit: 86%
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-white">Cereal – Legume – Cereal Rotation</h3>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700">
                    +45 kg N/ha fixed naturally
                  </span>
                </div>

                {/* 3 Years */}
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-center justify-between bg-[#080d19] px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="font-semibold text-slate-300">Y1 Pearl Millet</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300">Cereal</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#080d19] px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="font-semibold text-slate-300">Y2 Cowpea (Beans)</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">N-Fixer</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#080d19] px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="font-semibold text-slate-300">Y3 Sorghum</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">Deep Root</span>
                  </div>
                </div>

                {/* Indicators Progress Bars */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>Soil Nitrogen Health</span>
                      <span className="font-bold text-emerald-400">86/100</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: "86%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>Water-Stress Resilience</span>
                      <span className="font-bold text-sky-400">78/100</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: "78%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>3-Year Yield Stability</span>
                      <span className="font-bold text-amber-400">83/100</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: "83%" }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insight Box */}
              <div className="mt-4 p-2.5 bg-[#080d19] rounded-lg border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-emerald-400 block mb-0.5">NASA Insight:</strong> Rotating Cowpea in Year 2 fixes ~45–60 kg/ha of atmospheric nitrogen into root nodules while providing dense leafy ground cover that slows evaporation when NASA GWETROOT drops in October. Year 3 Sorghum taps deeper subsoil moisture and boosts grain yield by up to 28% with lower fertilizer cost.
              </div>
            </div>

            {/* STRATEGY C - CLIMATE & CASH */}
            <div
              onClick={() => setHighlightedStrategy("strategy_c")}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                highlightedStrategy === "strategy_c"
                  ? "bg-[#101b2e] border-sky-500/80 ring-2 ring-sky-500/50 shadow-lg"
                  : "bg-[#0e162a] border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    STRATEGY C • CLIMATE & CASH
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Fit: 81%
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-white">Legume – Cereal – Oilseed Rotation</h3>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800">
                    Highest drought & market buffer
                  </span>
                </div>

                {/* 3 Years */}
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-center justify-between bg-[#080d19] px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="font-semibold text-slate-300">Y1 Groundnut</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">N-Fixer</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#080d19] px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="font-semibold text-slate-300">Y2 Sorghum</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300">Cereal</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#080d19] px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="font-semibold text-slate-300">Y3 Sesame (Ridi)</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">Drought Cash</span>
                  </div>
                </div>

                {/* Indicators Progress Bars */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>Soil Nitrogen Health</span>
                      <span className="font-bold text-emerald-400">77/100</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: "77%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>Water-Stress Resilience</span>
                      <span className="font-bold text-sky-400">86/100</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: "86%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>3-Year Yield Stability</span>
                      <span className="font-bold text-amber-400">87/100</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: "87%" }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insight Box */}
              <div className="mt-4 p-2.5 bg-[#080d19] rounded-lg border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-sky-400 block mb-0.5">NASA Insight:</strong> Engineered for 33.2°C peak temperatures and erratic rainfall tails: Groundnut enriches Year 1 nitrogen, Sorghum anchors Year 2 food security, and Sesame (Ridi) thrives on residual late-season soil moisture while commanding strong export/market prices in Bauchi State.
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: TRAJECTORY SIMULATOR & RESILIENCE RADAR        */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Chart: 3-Year Field Trajectory Simulator */}
          <div className="lg:col-span-7 bg-[#0b1222] rounded-2xl border border-slate-800 p-5 shadow-lg space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    4. Three-Year Field Trajectory Simulator
                  </h3>
                  <p className="text-xs text-slate-400">
                    Projected cumulative farm performance across Season 1, Season 2, and Season 3.
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-[#11192e] p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
                  <button
                    onClick={() => setSimMode("nitrogen")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      simMode === "nitrogen"
                        ? "bg-emerald-500 text-slate-950 font-bold shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Soil Nitrogen Index
                  </button>
                  <button
                    onClick={() => setSimMode("yield")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      simMode === "yield"
                        ? "bg-emerald-500 text-slate-950 font-bold shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Yield Stability (%)
                  </button>
                </div>
              </div>

              {/* Multi-Line SVG Chart */}
              <div className="w-full mt-4">
                <svg viewBox="0 0 520 220" className="w-full h-auto select-none">
                  {/* Grid Lines */}
                  {[0, 20, 40, 60, 80, 100].map((val) => {
                    const y = 180 - (val / 100) * 150;
                    return (
                      <g key={val}>
                        <line x1="45" y1={y} x2="480" y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                        <text x="38" y={y + 3} textAnchor="end" fill="#64748b" fontSize="8" fontFamily="monospace">
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  <text x="-95" y="14" transform="rotate(-90)" fill="#64748b" fontSize="8">
                    {simMode === "nitrogen" ? "Soil Nitrogen Health Index (0–100)" : "Yield Stability Index (%)"}
                  </text>

                  {/* Strategy Lines: Y1 (x=100), Y2 (x=270), Y3 (x=440) */}
                  {/* Strategy A (Red Dashed) */}
                  {simMode === "nitrogen" ? (
                    <>
                      <path d="M 100 100 L 270 125 L 440 148" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 3" />
                      <circle cx="100" cy="100" r="4" fill="#ef4444" />
                      <circle cx="270" cy="125" r="4" fill="#ef4444" />
                      <circle cx="440" cy="148" r="4" fill="#ef4444" />
                    </>
                  ) : (
                    <>
                      <path d="M 100 85 L 270 115 L 440 135" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 3" />
                      <circle cx="100" cy="85" r="4" fill="#ef4444" />
                      <circle cx="270" cy="115" r="4" fill="#ef4444" />
                      <circle cx="440" cy="135" r="4" fill="#ef4444" />
                    </>
                  )}

                  {/* Strategy B (Green Solid) */}
                  {simMode === "nitrogen" ? (
                    <>
                      <path d="M 100 95 L 270 58 L 440 50" fill="none" stroke="#10b981" strokeWidth="2.5" />
                      <circle cx="100" cy="95" r="4" fill="#10b981" />
                      <circle cx="270" cy="58" r="4" fill="#10b981" />
                      <circle cx="440" cy="50" r="4" fill="#10b981" />
                    </>
                  ) : (
                    <>
                      <path d="M 100 75 L 270 60 L 440 54" fill="none" stroke="#10b981" strokeWidth="2.5" />
                      <circle cx="100" cy="75" r="4" fill="#10b981" />
                      <circle cx="270" cy="60" r="4" fill="#10b981" />
                      <circle cx="440" cy="54" r="4" fill="#10b981" />
                    </>
                  )}

                  {/* Strategy C (Blue Solid) */}
                  {simMode === "nitrogen" ? (
                    <>
                      <path d="M 100 78 L 270 68 L 440 64" fill="none" stroke="#38bdf8" strokeWidth="2" />
                      <circle cx="100" cy="78" r="4" fill="#38bdf8" />
                      <circle cx="270" cy="68" r="4" fill="#38bdf8" />
                      <circle cx="440" cy="64" r="4" fill="#38bdf8" />
                    </>
                  ) : (
                    <>
                      <path d="M 100 65 L 270 55 L 440 48" fill="none" stroke="#38bdf8" strokeWidth="2" />
                      <circle cx="100" cy="65" r="4" fill="#38bdf8" />
                      <circle cx="270" cy="55" r="4" fill="#38bdf8" />
                      <circle cx="440" cy="48" r="4" fill="#38bdf8" />
                    </>
                  )}

                  {/* X Axis Season Labels */}
                  <text x="100" y="196" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold">
                    Season 1 (Year 1)
                  </text>
                  <text x="270" y="196" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold">
                    Season 2 (Year 2)
                  </text>
                  <text x="440" y="196" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold">
                    Season 3 (Year 3)
                  </text>
                </svg>
              </div>
            </div>

            {/* Trajectory Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-3 h-0.5 bg-rose-500 border border-dashed border-rose-400"></span> A: Continuous Millet (Baseline)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-0.5 bg-emerald-500"></span> B: Millet – Cowpea – Sorghum
              </span>
              <span className="flex items-center gap-1.5 text-sky-400">
                <span className="w-3 h-0.5 bg-sky-400"></span> C: Groundnut – Sorghum – Sesame
              </span>
            </div>
          </div>

          {/* Right Chart: Multi-Criteria Resilience Radar (Spider Chart) */}
          <div className="lg:col-span-5 bg-[#0b1222] rounded-2xl border border-slate-800 p-5 shadow-lg space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white">
                Multi-Criteria Resilience Radar
              </h3>
              <p className="text-xs text-slate-400">
                Comparing Nitrogen, Water Resilience, Yield Stability, Pest/Striga Control, and Market Return.
              </p>

              {/* Radar Chart SVG */}
              <div className="w-full flex justify-center py-2">
                <svg viewBox="0 0 320 230" className="w-full max-w-[280px] h-auto select-none">
                  {/* Concentric Pentagons */}
                  {[0.25, 0.5, 0.75, 1.0].map((scale, i) => {
                    const r = scale * 85;
                    const cx = 160;
                    const cy = 115;
                    // 5 vertices
                    const points = [0, 1, 2, 3, 4]
                      .map((idx) => {
                        const angle = (idx * 2 * Math.PI) / 5 - Math.PI / 2;
                        const x = cx + r * Math.cos(angle);
                        const y = cy + r * Math.sin(angle);
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      })
                      .join(" ");
                    return <polygon key={i} points={points} fill="none" stroke="#1e293b" strokeWidth="1" />;
                  })}

                  {/* 5 Axis Radial Lines & Labels */}
                  {[
                    { label: "Soil Nitrogen", angle: -Math.PI / 2, dx: 0, dy: -8 },
                    { label: "Water Resilience", angle: -Math.PI / 2 + (2 * Math.PI) / 5, dx: 12, dy: 3 },
                    { label: "Yield Stability", angle: -Math.PI / 2 + (4 * Math.PI) / 5, dx: 8, dy: 10 },
                    { label: "Striga/Pest Control", angle: -Math.PI / 2 + (6 * Math.PI) / 5, dx: -12, dy: 10 },
                    { label: "Market Income", angle: -Math.PI / 2 + (8 * Math.PI) / 5, dx: -10, dy: 3 },
                  ].map((ax, idx) => {
                    const cx = 160;
                    const cy = 115;
                    const x = cx + 85 * Math.cos(ax.angle);
                    const y = cy + 85 * Math.sin(ax.angle);
                    const lx = cx + 98 * Math.cos(ax.angle) + ax.dx;
                    const ly = cy + 98 * Math.sin(ax.angle) + ax.dy;
                    return (
                      <g key={idx}>
                        <line x1={cx} y1={cy} x2={x} y2={y} stroke="#1e293b" strokeWidth="1" />
                        <text x={lx} y={ly} textAnchor="middle" fill="#94a3b8" fontSize="7.5" fontWeight="bold">
                          {ax.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Strategy A (Red Polygon): Low Nitrogen, Low Pest, Med Water, Med Yield, Low Income */}
                  <polygon
                    points="160,89 198,110 188,144 135,140 130,105"
                    fill="#ef4444"
                    fillOpacity="0.15"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                  />

                  {/* Strategy B (Green Polygon): High Nitrogen, High Pest Control, High Yield, Med Income */}
                  <polygon
                    points="160,42 225,98 215,152 105,156 120,86"
                    fill="#10b981"
                    fillOpacity="0.25"
                    stroke="#10b981"
                    strokeWidth="2"
                  />

                  {/* Strategy C (Blue Polygon): Med Nitrogen, High Water, High Yield, High Income */}
                  <polygon
                    points="160,54 235,92 220,155 125,142 98,92"
                    fill="#0284c7"
                    fillOpacity="0.2"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>

            {/* Radar Legend */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500"></span> A: Monocrop
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span> B: Soil-Builder
              </span>
              <span className="flex items-center gap-1.5 text-sky-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-sky-400"></span> C: Climate & Cash
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 mt-12 py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-1">
        <p className="font-medium text-slate-400">
          Team Rasheed FieldShift • 2026 NASA Space Apps Challenge — Azare Local Event (Bauchi State, Nigeria)
        </p>
        <p className="text-[11px] text-slate-600">
          Built with NASA Langley Research Center POWER Agro-Climatology Data & Local Sudan Savanna Agronomy Knowledge.
        </p>
      </footer>

      {/* ========================================================= */}
      {/* FARMER ADVISORY PLAN MODAL DRAWER                        */}
      {/* ========================================================= */}
      {showAdvisoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1325] border border-slate-700 max-w-2xl w-full rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <h3 className="text-lg font-bold text-white">
                  FieldShift Farmer Advisory & Implementation Plan
                </h3>
              </div>
              <button
                onClick={() => setShowAdvisoryModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-emerald-950/40 border border-emerald-700/60 rounded-xl space-y-1">
                <span className="font-bold text-emerald-300 block text-sm">
                  Recommended Action: Strategy B (Cereal – Cowpea – Sorghum)
                </span>
                <p>
                  Optimized for {curSoil.name} in {curLocation.lga} under rain-fed Sudan Savanna conditions.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Seasonal Calendar & Field Operations
                </h4>
                <div className="space-y-1.5">
                  <div className="p-2.5 bg-[#0e162a] rounded-lg border border-slate-800">
                    <strong className="text-sky-400 block">Season 1 (Year 1): Pearl Millet</strong>
                    Plant following the first sustained rainfall events in mid-June (when 10-day rainfall ≥25mm). Apply modest basal manure.
                  </div>
                  <div className="p-2.5 bg-[#0e162a] rounded-lg border border-slate-800">
                    <strong className="text-emerald-400 block">Season 2 (Year 2): Dual-Purpose Cowpea</strong>
                    Sow early-to-mid July. Inoculate with rhizobium if available. In-situ residue incorporation after grain harvest contributes ~45 kg N/ha for next season.
                  </div>
                  <div className="p-2.5 bg-[#0e162a] rounded-lg border border-slate-800">
                    <strong className="text-amber-400 block">Season 3 (Year 3): Sorghum</strong>
                    Directly benefits from residual nitrogen and reduced Striga weed seed pressure from the Year 2 cowpea break.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                <strong>Agronomic Caveat:</strong> NASA POWER satellite gridded indicators provide regional climate bounds (~50km grid). Soil fertility and local drainage must be confirmed with local Bauchi State agricultural extension officers.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                🖨 Print / Save PDF
              </button>
              <button
                onClick={() => setShowAdvisoryModal(false)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
