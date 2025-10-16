"use client";
import React, { useEffect, useMemo, useState } from "react";
import { getAnimationUrl } from "@/lib/api";

type InputSchema = Record<string, { default_value?: unknown }>;

type AnimationInputProps = {
  name: string;
  args?: InputSchema;
  onUrl: (url: string | null) => void;
  className?: string;
};

export default function AnimationInput({
  name,
  args = {},
  onUrl,
  className,
}: AnimationInputProps) {
  const initial = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(args).map(([k, v]) => [k, v?.default_value ?? ""])
      ),
    [args]
  );
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  useEffect(() => setValues(initial), [initial]);

  async function fetchVideo() {
    const url = await getAnimationUrl({ name, args: values });
    onUrl(url);
  }

  return (
    <div className={["flex w-full gap-4", className].filter(Boolean).join(" ")}>
      <div className="flex w-full flex-col gap-2 bg-[var(--dbl-4)] p-3 rounded-lg">
        <div className="mb-2 text-[var(--gr-2)] text-sm font-semibold">
          Inputs
        </div>
        {Object.entries(values).length === 0 && (
          <div className="text-[var(--gr-2)] text-sm opacity-70">
            No inputs.
          </div>
        )}
        {Object.entries(values).map(([k, v]) => (
          <label
            key={k}
            className="flex items-center justify-between gap-3 rounded-lg bg-[var(--dbl-3)] px-3 py-2"
          >
            <span className="text-[var(--gr-2)] text-sm">{k}</span>
            <input
              className="w-40 rounded bg-transparent px-2 py-1 text-[var(--gr-2)] outline-none ring-1 ring-slate-600/40 focus:ring-[var(--gr-2)]"
              value={String(v ?? "")}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [k]: e.target.value }))
              }
            />
          </label>
        ))}
        <button
          id="test-button"
          onClick={fetchVideo}
          className="mt-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Play
        </button>
      </div>
    </div>
  );
}
