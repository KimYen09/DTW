import { useState } from 'react';

interface DataPoint {
  day: string;
  val: number;
  label?: string;
}

interface InteractiveTimeSeriesChartProps {
  data: DataPoint[];
  metricLabel: string;
  unit: string;
  minThreshold?: number;
  maxThreshold?: number;
  thresholdLabel?: string;
  lineColor?: string;
  fillGradient?: { start: string; end: string };
  height?: number;
}

export function InteractiveTimeSeriesChart({
  data,
  metricLabel,
  unit,
  minThreshold = 6.5,
  maxThreshold = 8.5,
  thresholdLabel = 'Ngưỡng an toàn (6.5 - 8.5)',
  lineColor = '#06b6d4',
  fillGradient = { start: 'rgba(6, 182, 212, 0.25)', end: 'rgba(6, 182, 212, 0.0)' },
  height = 260
}: InteractiveTimeSeriesChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const padding = { top: 25, right: 30, bottom: 40, left: 45 };
  const chartWidth = 800; // SVG viewBox coordinate space
  const chartHeight = height;

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const values = data.map((d) => d.val);
  const dataMin = Math.min(...values, minThreshold ?? Infinity);
  const dataMax = Math.max(...values, maxThreshold ?? -Infinity);

  const buffer = (dataMax - dataMin) * 0.15 || 0.5;
  const yMin = Math.max(0, dataMin - buffer);
  const yMax = dataMax + buffer;

  const getX = (index: number) => {
    if (data.length <= 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (data.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    return padding.top + innerHeight - ((val - yMin) / (yMax - yMin)) * innerHeight;
  };

  // Generate smooth cubic bezier SVG path
  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.val) }));
  let pathD = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${padding.top + innerHeight} Z`;

  // Grid tick marks
  const yTicksCount = 4;
  const yTicks = Array.from({ length: yTicksCount }, (_, i) => {
    const v = yMin + (i / (yTicksCount - 1)) * (yMax - yMin);
    return { val: v, y: getY(v) };
  });

  const activePoint = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="relative w-full select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: lineColor }} />
            <span className="font-semibold text-slate-700 dark:text-slate-300">{metricLabel}</span>
          </div>
          {thresholdLabel && (
            <div className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 border-t-2 border-dashed border-rose-500" />
              <span className="text-slate-500 dark:text-slate-400">{thresholdLabel}</span>
            </div>
          )}
        </div>
        {activePoint && (
          <div className="rounded-lg bg-slate-900/90 dark:bg-slate-800 px-2.5 py-1 text-xs text-white shadow-md">
            <span className="text-slate-300">{activePoint.day}: </span>
            <strong className="text-cyan-400 font-bold">{activePoint.val.toFixed(3)} {unit}</strong>
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full overflow-visible"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillGradient.start} />
            <stop offset="100%" stopColor={fillGradient.end} />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines & labels */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={tick.y}
              x2={chartWidth - padding.right}
              y2={tick.y}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 8}
              y={tick.y + 4}
              textAnchor="end"
              className="fill-slate-400 text-[10px]"
            >
              {tick.val.toFixed(2)}
            </text>
          </g>
        ))}

        {/* Threshold lines (min & max if defined) */}
        {minThreshold !== undefined && minThreshold >= yMin && minThreshold <= yMax && (
          <line
            x1={padding.left}
            y1={getY(minThreshold)}
            x2={chartWidth - padding.right}
            y2={getY(minThreshold)}
            stroke="#f43f5e"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
        )}
        {maxThreshold !== undefined && maxThreshold >= yMin && maxThreshold <= yMax && (
          <line
            x1={padding.left}
            y1={getY(maxThreshold)}
            x2={chartWidth - padding.right}
            y2={getY(maxThreshold)}
            stroke="#f43f5e"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
        )}

        {/* Shaded Area Under Curve */}
        <path d={areaD} fill="url(#chartGradient)" />

        {/* Curve Line */}
        <path
          d={pathD}
          fill="none"
          stroke={lineColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points & hover triggers */}
        {data.map((d, i) => {
          const x = getX(i);
          const y = getY(d.val);
          const isHovered = hoveredIdx === i;

          return (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
            >
              {/* Invisible large touch target */}
              <circle cx={x} cy={y} r="14" fill="transparent" />

              {/* Visible dot */}
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 5.5 : 2.5}
                fill={isHovered ? '#ffffff' : lineColor}
                stroke={lineColor}
                strokeWidth={isHovered ? 2.5 : 1}
                className="transition-all duration-150"
              />

              {/* X Axis Label */}
              {(i % 3 === 0 || i === data.length - 1) && (
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

        {/* Hover vertical crosshair */}
        {hoveredIdx !== null && (
          <line
            x1={getX(hoveredIdx)}
            y1={padding.top}
            x2={getX(hoveredIdx)}
            y2={padding.top + innerHeight}
            stroke={lineColor}
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        )}
      </svg>
    </div>
  );
}
