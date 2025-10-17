"use client";
import NeoIcon from "@/components/NeoIcon";
import { useAuth } from "@/lib/contexts/AuthContext";
import {ping} from "@/lib/utils/apiUtils";

import { useEffect } from "react";
import type * as monaco from "monaco-editor";
import { TimerReset } from "lucide-react";
type TimerControls = {
  running: boolean;
  seconds: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
};

type EditorUtilitiesProps = {
  onAnnotate: () => void | Promise<void>;
  showHints: boolean;
  setShowHints: (b: boolean) => void;
  clearHints: () => void;
  timer: TimerControls;
  className?: string;
  editorRef : React.RefObject<monaco.editor.IStandaloneCodeEditor | null>;
};

export default function EditorUtilities({
  onAnnotate,
  showHints,
  setShowHints,
  clearHints,
  timer,
  className = "",
  editorRef
}: EditorUtilitiesProps) {
  const { running, seconds, start, stop, reset } = timer;
  const INTERVAL = 10; // seconds
  const { user, loading: authLoading } = useAuth();
  

  //Takes a snapshot of user's code every INTERVAL seconds if the timer is running
  useEffect(() => {
    if (running && seconds % INTERVAL == 0 && editorRef.current) {
      // console.log("seconds are ",seconds,editorRef.current.getModel()?.getValue())
      const code = editorRef.current.getModel()?.getValue() || "";
      const userInfo = user ? user : { id: "guest"}
      ping({user_id: userInfo.id, code: code,timestamp:seconds},"log-editor-history")
      .then((res) => {  
        console.log("response from logging editor history ",res)
      })

      
    
    }
    }
  ,[seconds])


  return (
    <>
      <div
        className={[
          "absolute bottom-3 right-3 z-50",
          "rounded-lg border border-[color:var(--dbl-4)]",
          "bg-[color:var(--dbl-3)]/90 backdrop-blur",
          "shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
          "px-2 py-1.5",
          "flex items-center gap-2",
          className,
        ].join(" ")}
      >
        <button
          type="button"
          onClick={() => setShowHints(!showHints)}
          className="px-2 py-1 text-xs font-medium rounded-md border border-[color:var(--dbl-4)] hover:bg-[color:var(--dbl-4)]/60 transition-colors"
          title={showHints ? "Hide hints" : "Show hints"}
        >
          {showHints ? "Hide Hints" : "Show Hints"}
        </button>

        <button
          type="button"
          onClick={clearHints}
          className="px-2 py-1 text-xs font-medium rounded-md border border-[color:var(--dbl-4)] hover:bg-[color:var(--dbl-4)]/60 transition-colors"
          title="Clear all hints"
        >
          Clear
        </button>

        <span className="h-4 w-px bg-[color:var(--dbl-4)] mx-1" />

        {running ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={stop}
              className="px-2 py-1 text-xs font-medium rounded-md border border-[color:var(--dbl-4)] hover:bg-[color:var(--dbl-4)]/60 transition-colors"
              title="Stop timer"
            >
              Stop
            </button>
            <button
              type="button"
              onClick={reset}
              className="px-2 py-1 text-xs font-medium rounded-md border border-[color:var(--dbl-4)] hover:bg-[color:var(--dbl-4)]/60 transition-colors"
              title="Restart timer"
            >
              Restart
            </button>
            <span className="text-xs tabular-nums text-[color:var(--gr-2)] ml-1">
              {seconds}s
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={start}
              className="px-2 py-1 text-xs font-medium rounded-md border border-[color:var(--dbl-4)] hover:bg-[color:var(--dbl-4)]/60 transition-colors"
              title="Start timer"
            >
              Start
            </button>
            <button
              type="button"
              onClick={reset}
              className="px-2 py-1 text-xs font-medium rounded-md border border-[color:var(--dbl-4)] hover:bg-[color:var(--dbl-4)]/60 transition-colors"
              title="Restart timer"
            >
              Restart
            </button>
            <span className="text-xs tabular-nums text-[color:var(--gr-2)] ml-1">
              {seconds}s
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={async () => {
          await onAnnotate();
        }}
        title="AI Hint"
        className="absolute top-1 right-5 z-50 rounded-full p-2  hover:shadow-[0_8px_20px_rgba(0,0,0,0.45)] transition-shadow"
      >
        <NeoIcon width={30} height={30} hoverBehavior="self" />
      </button>
    </>
  );
}
