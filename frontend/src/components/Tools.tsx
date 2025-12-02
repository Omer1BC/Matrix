"use client";

import { requestAnimationFromAgent } from "@/lib/api";
import { useState } from "react";
import { Input } from "./ui/input";

type ToolsProps = {
  tools: { name: string; description?: string; code?: string }[];
  details?: unknown;
  addToolCode: (code?: string) => void;
  askAboutTool: (name: string, details?: unknown) => void;
  onOpenAnimation: (toolName: string) => void;
  onCustomAnimate: (
    url: string | null,
    phase?: "start" | "done" | "error"
  ) => void;
};

export default function Tools({
  tools,
  details,
  addToolCode,
  askAboutTool,
  onOpenAnimation,
  onCustomAnimate,
}: ToolsProps) {
  const [animPrompt, setAnimPrompt] = useState("");
  const [animLoading, setAnimLoading] = useState(false);
  const [animError, setAnimError] = useState<string | null>(null);
  const [animSpeed, setAnimSpeed] = useState(1.0);

  async function submit() {
    const prompt = animPrompt.trim();
    if (!prompt || animLoading) return;
    setAnimLoading(true);
    setAnimError(null);
    onCustomAnimate?.(null, "start");
    setAnimPrompt("");
    try {
      const url = await requestAnimationFromAgent(prompt, animSpeed);
      if (!url) throw new Error("No video returned");
      onCustomAnimate?.(url, "done");
    } catch (e: any) {
      setAnimError(e?.message || "Failed to generate animation");
      onCustomAnimate?.(null, "error");
    } finally {
      setAnimLoading(false);
    }
  }

  return (
    <div className="tools flex h-full max-h-full w-full flex-col p-2">
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
            onOpenAnimation={onOpenAnimation}
          />
        ))}
      </div>
      <div className="createanimation mt-3 rounded-xl border border-slate-700 bg-[var(--dbl-4)] p-2">
        <div className="mb-3 flex items-center gap-3">
          <label className="text-xs text-slate-400 whitespace-nowrap">
            Speed: {animSpeed}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={animSpeed}
            onChange={(e) => setAnimSpeed(parseFloat(e.target.value))}
            className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--gr-2)]"
            disabled={animLoading}
          />
          <div className="flex gap-1 text-[10px] text-slate-500">
            <span>Slow</span>
            <span className="mx-1">|</span>
            <span>Fast</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={animPrompt}
            onChange={(e: any) => setAnimPrompt(e.target.value)}
            onKeyDown={(e: any) => e.key === "Enter" && submit()}
            placeholder='e.g. "BST with 10, 5, 15; insert 3; delete 5"'
            className="w-[90%] rounded-lg border border-[var(--gr-2)] bg-[var(--dbl-4)] p-2.5 text-sm text-[var(--gr-2)] outline-none transition
                       focus:scale-[1.02] focus:border-[var(--gr-2)]
                       focus:shadow-[0_0_8px_rgba(125,255,125,0.6),0_0_16px_rgba(125,255,125,0.3)]
                       focus:bg-[var(--dbl-3)]"
            disabled={animLoading}
          />
          <button
            onClick={submit}
            disabled={animLoading || !animPrompt.trim()}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-[var(--gr-2)] px-3 py-2 text-sm font-medium text-black hover:bg-[var(--gr-1)] disabled:opacity-60"
            title="Generate animation"
          >
            {animLoading ? "Generating…" : "Generate"}
          </button>
        </div>

        {animError && (
          <div className="mt-2 text-xs text-red-300">{animError}</div>
        )}
        {!animError && animLoading && (
          <div className="mt-2 text-xs text-slate-300 opacity-80">
            Rendering with Manim… (low-quality preview)
          </div>
        )}
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
  onOpenAnimation: (toolName: string) => void;
};

export function ToolPill({
  name,
  description,
  code,
  details,
  addToolCode,
  askAboutTool,
  onOpenAnimation,
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
            className="askabouttool inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-[var(--gr-2)] text-black hover:bg-[var(--gr-1)]"
            title="Ask about this tool"
            onClick={() => askAboutTool(name, details)}
          >
            ?
          </button>

          <button
            className="playanimation inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-[var(--gr-2)] text-black hover:bg-[var(--gr-1)]"
            title="Play animation for this tool"
            onClick={() => onOpenAnimation(name)}
          >
            ▶
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
