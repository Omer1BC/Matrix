"use client";

import { getAllUserProblems } from "../../lib/supabase/problems";
import { useState, useEffect } from "react";
import { Profile } from "../../lib/types";

export default function Notes() {
  const [userProblems, setUserProblems] = useState<any[]>([]);

  useEffect(() => {
    async function loadUserProblems() {
      const response = await getAllUserProblems();
      setUserProblems(response);
    }
    loadUserProblems();
  }, []);

  useEffect(() => {
    console.log(userProblems);
  }, [userProblems]);

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
            <span className="mr-2 text-[var(--dbl-2)] text-sm">
              {isExpanded ? "▼" : "▶"}
            </span>
            {title}
          </div>
          {/* {notes && (
            <div className="mt-1 rounded-xl bg-[var(--dbl-3)] p-2 text-[var(--gr-2)] text-[15.2px] leading-snug">
              {notes}
            </div>
          )} */}
        </div>
      </div>
      {isExpanded && (
        <div className="mt-4 w-full pt-4 border-t border-[rgba(125,255,125,0.3)]">
          <div className="relative rounded-lg">
            {/* <button
              className="absolute right-2 top-2 inline-flex items-center gap-1 rounded border border-slate-600/30 bg-slate-700/80 px-2 py-1 text-xs text-slate-100 opacity-80 hover:opacity-100"
              title="Paste into editor"
              onClick={() => addToolCode(code)}
            >
              Paste
            </button> */}
            <div className="max-h-52 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-slate-600 bg-slate-800 p-4 font-mono text-[13.6px] text-[var(--gr-2)]">
              <code>{notes}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
