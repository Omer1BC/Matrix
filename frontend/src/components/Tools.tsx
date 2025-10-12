"use client";

import { useState } from "react";

export default function Tools({
  tools,
  details,
  addToolCode,
  askAboutTool,
}: {
  tools: { name: string; description?: string; code?: string }[];
  details?: unknown;
  addToolCode: (code?: string) => void;
  askAboutTool: (name: string, details?: unknown) => void;
}) {
  return (
    <div className="flex h-full max-h-full w-full flex-col p-2">
      <div className="flex-1 min-h-0 overflow-y-auto custom-scroll pr-2 space-y-2">
        {tools.map((t, i) => (
          <ToolPill
            key={i}
            name={t.name}
            description={t.description}
            code={t.code}
            details={details}
            addToolCode={addToolCode}
            askAboutTool={askAboutTool}
          />
        ))}
      </div>
    </div>
  );
}

type ToolPillProps = {
  name: string;
  description?: string;
  code?: string;
  details?: unknown;
  addToolCode: (code?: string) => void;
  askAboutTool: (name: string, details?: unknown) => void;
};

export function ToolPill({
  name,
  description,
  code,
  details,
  addToolCode,
  askAboutTool,
}: ToolPillProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col rounded-2xl bg-[var(--dbl-4)] px-5 py-2 font-sans text-[17.6px] transition">
      <div className="flex items-center justify-between">
        <div
          className="flex cursor-pointer flex-col"
          onClick={() => setIsExpanded((v) => !v)}
        >
          <div className="mr-3 text-[var(--gr-2)] text-[17.6px] font-semibold">
            <span className="mr-2 text-[var(--dbl-2)] text-sm">
              {isExpanded ? "▼" : "▶"}
            </span>
            {name}
          </div>
          {description && (
            <div className="mt-1 rounded-xl bg-[var(--dbl-3)] p-2 text-[var(--gr-2)] text-[15.2px] leading-snug">
              {description}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-[var(--gr-2)] text-black hover:bg-[var(--gr-1)]"
            title="Ask about this tool"
            onClick={() => askAboutTool(name, details)}
          >
            ?
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 w-full border-t border-slate-200/30 pt-4">
          <div className="relative rounded-lg">
            <button
              className="absolute right-2 top-2 inline-flex items-center gap-1 rounded border border-slate-600/30 bg-slate-700/80 px-2 py-1 text-xs text-slate-100 opacity-80 hover:opacity-100"
              title="Paste into editor"
              onClick={() => addToolCode(code)}
            >
              Paste
            </button>

            <pre className="max-h-52 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-slate-600 bg-slate-800 p-4 font-mono text-[13.6px] text-[var(--gr-2)]">
              <code>{code}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
