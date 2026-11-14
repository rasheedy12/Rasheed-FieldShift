"use client";

import { useMemo, useState } from "react";
import { DailyRecord } from "../types";

interface SeasonTimelineChartProps {
  records: DailyRecord[];
}

export function SeasonTimelineChart({ records }: SeasonTimelineChartProps) {
  const [viewMode, setViewMode] = useState<"daily" | "monthly">("monthly");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute monthly aggregations
  const monthlyData = useMemo(() => {
    const monthsMap: Record<
      string,
      { label: string; rain: number; days: number; rainyDays: number; wetnessSum: number; wetnessCount: number; phase: string }
    > = {
      "05": { label: "May", rain: 0, days: 0, rainyDays: 0, wetnessSum: 0, wetnessCount: 0, phase: "Land Prep & Early Sowing" },
      "06": { label: "Jun", rain: 0, days: 0, rainyDays: 0, wetnessSum: 0, wetnessCount: 0, phase: "Main Sowing & Germination" },
      "07": { label: "Jul", rain: 0, days: 0, rainyDays: 0, wetnessSum: 0, wetnessCount: 0, phase: "Vegetative Growth" },
      "08": { label: "Aug", rain: 0, days: 0, rainyDays: 0, wetnessSum: 0, wetnessCount: 0, phase: "Peak Rains & Flowering" },
      "09": { label: "Sep", rain: 0, days: 0, rainyDays: 0, wetnessSum: 0, wetnessCount: 0, phase: "Grain Filling" },
      "10": { label: "Oct", rain: 0, days: 0, rainyDays: 0, wetnessSum: 0, wetnessCount: 0, phase: "Maturity & Dry Down" },
    };

    records.forEach((r) => {
      const month = r.date.slice(5, 7);
      if (monthsMap[month]) {
        monthsMap[month].days += 1;
        if (r.precipitation_mm !== null) {
          monthsMap[month].rain += r.precipitation_mm;
          if (r.precipitation_mm >= 1.0) {
            monthsMap[month].rainyDays += 1;
          }
        }
        if (r.root_zone_wetness_fraction !== null) {
          monthsMap[month].wetnessSum += r.root_zone_wetness_fraction;
          monthsMap[month].wetnessCount += 1;
        }
      }
    });

    return Object.entries(monthsMap).map(([key, data]) => ({
      monthKey: key,
      monthName: data.label,
      totalRain: Math.round(data.rain * 10) / 10,
      rainyDays: data.rainyDays,
      totalDays: data.days,
      avgWetness: data.wetnessCount > 0 ? Math.round((data.wetnessSum / data.wetnessCount) * 1000) / 1000 : null,
      phase: data.phase,
    }));
  }, [records]);

  // Daily Chart Calculations
  const maxRain = useMemo(() => {
    let max = 30;
    records.forEach((r) => {
      if (r.precipitation_mm && r.precipitation_mm > max) {
        max = r.precipitation_mm;
      }
    });
    return Math.ceil(max / 10) * 10;
  }, [records]);

  const svgWidth = 800;
  const svgHeight = 220;
  const chartPadding = { top: 20, right: 40, bottom: 35, left: 45 };
  const plotWidth = svgWidth - chartPadding.left - chartPadding.right;
  const plotHeight = svgHeight - chartPadding.top - chartPadding.bottom;

  const hoveredRecord = hoveredIndex !== null && records[hoveredIndex] ? records[hoveredIndex] : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Growing Season Dynamics & Rainfall Distribution</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare daily precipitation events against root-zone soil wetness across key crop growth stages.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto text-xs font-medium">
          <button
            onClick={() => setViewMode("monthly")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "monthly"
                ? "bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Monthly Stages (Overview)
          </button>
          <button
            onClick={() => setViewMode("daily")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "daily"
                ? "bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Daily Dynamics (184 Days)
          </button>
        </div>
      </div>

      {/* VIEW 1: MONTHLY SUMMARY BARS */}
      {viewMode === "monthly" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {monthlyData.map((m) => {
            const isPeak = m.monthKey === "08";
            return (
              <div
                key={m.monthKey}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                  isPeak
                    ? "bg-sky-50/70 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {m.monthName}
                    </span>
                    {isPeak && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-200 text-sky-900 dark:bg-sky-900 dark:text-sky-200">
                        Peak
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5 font-medium line-clamp-1">
                    {m.phase}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1 text-xs">
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500 text-[11px]">Rainfall:</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">
                      {m.totalRain} mm
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-[11px] text-slate-500">
                    <span>Rainy Days:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {m.rainyDays}/{m.totalDays}d
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-[11px] text-slate-500">
                    <span>Wetness:</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {m.avgWetness ?? "—"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: DAILY INTERACTIVE SVG TIMELINE */}
      {viewMode === "daily" && (
        <div className="space-y-3">
          {/* Interactive Tooltip Bar */}
          <div className="h-7 text-xs flex items-center justify-between px-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
            {hoveredRecord ? (
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  📅 {hoveredRecord.date}
                </span>
                <span className="text-sky-700 dark:text-sky-300">
                  💧 Rain: <strong className="font-extrabold">{hoveredRecord.precipitation_mm ?? 0} mm</strong>
                </span>
                <span className="text-emerald-700 dark:text-emerald-400">
                  🌱 Root Wetness: <strong className="font-extrabold">{hoveredRecord.root_zone_wetness_fraction ?? "—"}</strong>
                </span>
                <span className="text-slate-500">
                  🌡 Temp: {hoveredRecord.temperature_2m_c ?? "—"}°C
                </span>
              </div>
            ) : (
              <span className="text-slate-400 italic">
                Hover over the chart to inspect daily rainfall events and soil wetness fractions.
              </span>
            )}
          </div>

          {/* SVG Visualizer */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto select-none"
              style={{ minWidth: "600px" }}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Grid Background Lines */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
                const y = chartPadding.top + plotHeight * (1 - frac);
                const mm = Math.round(frac * maxRain);
                return (
                  <g key={idx}>
                    <line
                      x1={chartPadding.left}
                      y1={y}
                      x2={chartPadding.left + plotWidth}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-100 dark:text-slate-800"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={chartPadding.left - 6}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      className="fill-slate-400 font-mono"
                    >
                      {mm}
                    </text>
                    <text
                      x={chartPadding.left + plotWidth + 6}
                      y={y + 3}
                      textAnchor="start"
                      fontSize="9"
                      className="fill-emerald-600 dark:fill-emerald-400 font-mono"
                    >
                      {frac.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Daily Rain Bars */}
              {records.map((r, idx) => {
                const x = chartPadding.left + (idx / records.length) * plotWidth;
                const barWidth = Math.max(1.8, plotWidth / records.length - 0.5);
                const pVal = r.precipitation_mm ?? 0;
                const barHeight = Math.min(plotHeight, (pVal / maxRain) * plotHeight);
                const y = chartPadding.top + plotHeight - barHeight;
                const isHovered = hoveredIndex === idx;

                return (
                  <rect
                    key={idx}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    className={`transition-colors cursor-pointer ${
                      isHovered
                        ? "fill-sky-500"
                        : pVal >= 20
                        ? "fill-sky-700 dark:fill-sky-400"
                        : "fill-sky-400/80 dark:fill-sky-600/70"
                    }`}
                    onMouseEnter={() => setHoveredIndex(idx)}
                  />
                );
              })}

              {/* Root-Zone Wetness Curve (Line) */}
              <path
                d={records
                  .map((r, idx) => {
                    const x = chartPadding.left + (idx / (records.length - 1)) * plotWidth;
                    const wVal = r.root_zone_wetness_fraction ?? 0;
                    const y = chartPadding.top + (1 - Math.min(1, Math.max(0, wVal))) * plotHeight;
                    return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Active Hover Guide Line */}
              {hoveredIndex !== null && (
                <line
                  x1={chartPadding.left + (hoveredIndex / (records.length - 1)) * plotWidth}
                  y1={chartPadding.top}
                  x2={chartPadding.left + (hoveredIndex / (records.length - 1)) * plotWidth}
                  y2={chartPadding.top + plotHeight}
                  stroke="#64748b"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              )}

              {/* X-Axis Monthly Labels */}
              {["May 01", "Jun 01", "Jul 01", "Aug 01", "Sep 01", "Oct 01"].map((label, idx) => {
                const fraction = idx / 5.5;
                const x = chartPadding.left + fraction * plotWidth;
                return (
                  <text
                    key={idx}
                    x={x}
                    y={chartPadding.top + plotHeight + 18}
                    textAnchor="middle"
                    fontSize="10"
                    className="fill-slate-500 font-semibold"
                  >
                    {label}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Legend and Interpretation */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-sky-600 rounded-xs inline-block"></span>
                <span>Precipitation (mm/day)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-emerald-500 rounded-full inline-block"></span>
                <span>Root-Zone Wetness (fraction 0–1)</span>
              </span>
            </div>
            <span className="text-[11px] italic">
              Heavy rain days (≥20mm) drive peak root wetness in late July & August.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
