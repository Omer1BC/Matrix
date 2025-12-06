"use client";

import { getAllUserProblems } from "@/lib/supabase/models/problemCompletions";
import { useState, useEffect } from "react";

export default function Notes() {
  const [userProblems, setUserProblems] = useState<any[]>([]);

  useEffect(() => {
    async function loadUserProblems() {
      const response = await getAllUserProblems();
      setUserProblems(response);
    }
    loadUserProblems();
  }, []);

  return (
    <div className="notes flex h-full max-h-full w-full flex-col p-2">
      <div className="flex-1 min-h-0 overflow-y-auto custom-scroll pr-2 space-y-2">
        {userProblems.map((t, i) => (
          <NotesPill key={i} title={t.title} notes={t.notes} />
        ))}
      </div>
    </div>
  );
}

type NotesPillProps = {
  title: string;
  notes: string;
};

export function NotesPill({ title, notes }: NotesPillProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="flex flex-col rounded-2xl px-5 py-2 font-sans text-[17.6px] transition"
      style={{ backgroundColor: "#191818ff" }}
    >
      <div className="flex items-center justify-between">
        <div
          className="flex cursor-pointer flex-col"
          onClick={() => setIsExpanded((v) => !v)}
        >
          <div className="mr-3 text-[var(--gr-2)] text-[17.6px] font-semibold">
            <span className="mr-2 text-[var(--gr-2)] text-sm">
              {" "}
              {isExpanded ? "▼" : "▶"}
            </span>
            {title}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 w-full border-t border-slate-200/30 pt-4">
          <div className="relative rounded-lg">
            <pre className="max-h-52 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-slate-600 bg-slate-800 p-4 font-mono text-[13.6px] text-[var(--gr-2)]">
              <code>{notes}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
