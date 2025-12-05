"use client";
import React, { useState } from "react";

type Metrics = Record<string, number>;
type Explanations = Record<string, string>;

export default function StarGraph({
  metrics,
  explanations,
}: {
  metrics: Metrics;
  explanations: Explanations;
}) {
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);

  const center = 200;
  const maxRadius = 80;
  const categories = Object.keys(metrics);
  const values = Object.values(metrics);
  const labels: Record<string, string> = {
    readability: "Readability",
    efficiency: "Efficiency",
    robustness: "Robustness",
  };

  const angleStep = (2 * Math.PI) / categories.length;

  const points = values.map((value, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const radius = (value / 5) * maxRadius;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y, value, key: categories[index] };
  });

  const pathString =
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
    " Z";

  return (
    <div className="relative flex w-full justify-center">
      <svg width="400" height="400" viewBox="0 0 400 400">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <circle
            key={lvl}
            cx={center}
            cy={center}
            r={(lvl / 5) * maxRadius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
            opacity="0.5"
          />
        ))}

        {categories.map((_, idx) => {
          const a = idx * angleStep - Math.PI / 2;
          return (
            <line
              key={idx}
              x1={center}
              y1={center}
              x2={center + maxRadius * Math.cos(a)}
              y2={center + maxRadius * Math.sin(a)}
              stroke="#e5e7eb"
              strokeWidth="1"
              opacity="0.5"
            />
          );
        })}

        <path
          d={pathString}
          fill="rgba(34,197,94,0.3)"
          stroke="rgb(34,197,94)"
          strokeWidth="2"
        />

        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="rgb(34,197,94)" />
        ))}

        {categories.map((k, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const r = maxRadius + 40;
          const lx = center + r * Math.cos(angle);
          const ly = center + r * Math.sin(angle);
          const val = metrics[k] ?? 0;

          return (
            <g key={k}>
              <text
                x={lx}
                y={ly - 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="13"
                fill="var(--gr-2)"
                fontWeight={700}
              >
                {labels[k] || k}
              </text>
              <text
                x={lx}
                y={ly + 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fill="var(--gr-2)"
                fontWeight={600}
              >
                {val.toFixed(1)}/5
              </text>

              {/* info chip */}
              <circle
                cx={lx + 50}
                cy={ly - 8}
                r="8"
                className="cursor-pointer"
                fill="var(--gr-2)"
                onClick={() => setExpandedInfo(expandedInfo === k ? null : k)}
              />
              <text
                x={lx + 50}
                y={ly - 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fill="var(--dbl-1)"
                fontWeight={700}
                style={{ pointerEvents: "none" }}
              >
                i
              </text>
            </g>
          );
        })}
      </svg>

      {expandedInfo &&
        (() => {
          const idx = categories.indexOf(expandedInfo);
          const a = idx * angleStep - Math.PI / 2;
          const r = maxRadius + 40;
          const lx = center + r * Math.cos(a);
          const ly = center + r * Math.sin(a);

          return (
            <div
              className="pointer-events-none absolute z-10"
              style={{
                left: lx,
                top:
                  expandedInfo === "readability"
                    ? ly - 170
                    : Math.min(ly - 140, center - 160),
                transform: "translateX(-50%)",
              }}
            >
              <div className="pointer-events-auto max-w-[250px] rounded-lg border border-[var(--gr-2)] bg-[var(--dbl-3)] p-4 shadow-xl">
                <strong className="mb-2 block text-[var(--gr-2)]">
                  {labels[expandedInfo] || expandedInfo}
                </strong>
                <p className="m-0 text-sm text-white">
                  {explanations[expandedInfo]}
                </p>
                <button
                  className="absolute right-2 top-1 text-lg text-white hover:text-[var(--gr-2)]"
                  onClick={() => setExpandedInfo(null)}
                >
                  ×
                </button>
              </div>
            </div>
          );
        })()}
    </div>
  );
}