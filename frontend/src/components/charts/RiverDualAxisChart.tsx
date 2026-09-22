import { useState } from 'react';

interface RiverDataPoint {
  day: string;
  ec: number;
  level: number;
  isAnomaly?: boolean;
  note?: string;
}

interface RiverDualAxisChartProps {
  data: RiverDataPoint[];
  height?: number;
}

export function RiverDualAxisChart({ data, height = 280 }: RiverDualAxisChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const padding = { top: 30, right: 55, bottom: 40, left: 55 };
  const chartWidth = 840;
  const chartHeight = height;

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Scales
  const ecMax = 1000;
  const ecMin = 0;
  const levelMax = 4.5;
  const levelMin = 0;

  const getX = (index: number) => {
    return padding.left + (index / (data.length - 1)) * innerWidth;
  };

  const getY_EC = (val: number) => {
    return padding.top + innerHeight - ((val - ecMin) / (ecMax - ecMin)) * innerHeight;
  };

  const getY_Level = (val: number) => {
    return padding.top + innerHeight - ((val - levelMin) / (levelMax - levelMin)) * innerHeight;
  };

  // Build SVG Paths
  const ecPoints = data.map((d, i) => ({ x: getX(i), y: getY_EC(d.ec) }));
  const levelPoints = data.map((d, i) => ({ x: getX(i), y: getY_Level(d.level) }));

  const buildPath = (pts: { x: number; y: number }[]) => {
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const ecPath = buildPath(ecPoints);
  const levelPath = buildPath(levelPoints);

  // Y-axis ticks
  const ecTicks = [0, 250, 500, 750, 1000];
  const levelTicks = [0, 1, 2, 3, 4];

  const activePoint = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="relative w-full select-none">
      {/* Legend & Hover Display */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 text-xs">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-5 rounded bg-cyan-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              river_ec_us_cm (Độ dẫn điện µS/cm)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-5 border-t-2 border-dashed border-blue-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              river_level_m (Cao trình mực nước m)
            </span>
          </div>
        </div>

        {activePoint && (
          <div className="flex items-center gap-3 rounded-lg bg-slate-900/90 dark:bg-slate-800 px-3 py-1.5 text-xs text-white shadow-md">
            <span className="text-slate-400">{activePoint.day}:</span>
            <span className="text-cyan-300 font-bold">EC: {activePoint.ec} µS/cm</span>
            <span className="text-blue-300 font-bold">Mực nước: {activePoint.level.toFixed(2)} m</span>
            {activePoint.isAnomaly && (
              <span className="rounded bg-rose-500/20 text-rose-300 px-1.5 py-0.5 text-[10px] font-bold">
                ⚠️ Dị biệt mặn
              </span>
            )}
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full overflow-visible"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {/* Horizontal grid lines based on EC */}
        {ecTicks.map((val) => {
          const y = getY_EC(val);
          return (
            <g key={val}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800/80"
                strokeDasharray="4 4"
              />
              {/* Left Y Axis (EC in µS/cm) */}
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-cyan-500 font-medium text-[10px]"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Right Y Axis (Level in meters) */}
        {levelTicks.map((val) => {
          const y = getY_Level(val);
          return (
            <text
              key={val}
              x={chartWidth - padding.right + 10}
              y={y + 4}
              textAnchor="start"
              className="fill-blue-400 font-medium text-[10px]"
            >
              {val}m
            </text>
          );
        })}

        {/* Level Curve (Dashed blue) */}
        <path
          d={levelPath}
          fill="none"
          stroke="#60a5fa"
          strokeWidth="2.2"
          strokeDasharray="5 4"
        />

        {/* EC Curve (Solid cyan) */}
        <path
          d={ecPath}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Data points & Interactive Hover */}
        {data.map((d, i) => {
          const x = getX(i);
          const yEC = getY_EC(d.ec);
          const yLevel = getY_Level(d.level);
          const isHovered = hoveredIdx === i;

          return (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
            >
              {/* Touch Area */}
              <circle cx={x} cy={yEC} r="15" fill="transparent" />

              {/* Anomaly Highlight Pulse Circle (Feb 3 spike) */}
              {d.isAnomaly && (
                <g>
                  <circle
                    cx={x}
                    cy={yEC}
                    r="9"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2"
                    className="animate-ping opacity-75"
                  />
                  <circle
                    cx={x}
                    cy={yEC}
                    r="6.5"
                    fill="#f43f5e"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={yEC - 14}
                    textAnchor="middle"
                    className="fill-rose-500 font-bold text-[10px]"
                  >
                    980 µS/cm
                  </text>
                </g>
              )}

              {!d.isAnomaly && (
                <circle
                  cx={x}
                  cy={yEC}
                  r={isHovered ? 5 : 2}
                  fill={isHovered ? '#ffffff' : '#06b6d4'}
                  stroke="#06b6d4"
                  strokeWidth={isHovered ? 2 : 1}
                />
              )}

              {/* Water Level Point */}
              <circle
                cx={x}
                cy={yLevel}
                r={isHovered ? 4 : 2}
                fill={isHovered ? '#ffffff' : '#60a5fa'}
                stroke="#60a5fa"
                strokeWidth={isHovered ? 2 : 1}
              />

              {/* X Axis Labels */}
              {(i % 2 === 0 || i === data.length - 1) && (
                <text
                  x={x}
                  y={chartHeight - 12}
                  textAnchor="middle"
                  className="fill-slate-400 text-[10px]"
                >
                  {d.day}
                </text>
              )}
            </g>
          );
        })}

        {/* Hover Crosshair line */}
        {hoveredIdx !== null && (
          <line
            x1={getX(hoveredIdx)}
            y1={padding.top}
            x2={getX(hoveredIdx)}
            y2={padding.top + innerHeight}
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        )}
      </svg>
    </div>
  );
}
