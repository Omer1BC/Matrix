"use client";
import NeoIcon from "@/components/NeoIcon";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ping } from "@/lib/api";

import { useEffect, useRef, useState } from "react";
import type * as monaco from "monaco-editor";
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
  editorRef: React.RefObject<monaco.editor.IStandaloneCodeEditor | null>;
};

export default function EditorUtilities({
  onAnnotate,
  showHints,
  setShowHints,
  clearHints,
  timer,
  className = "",
  editorRef,
}: EditorUtilitiesProps) {
  const { running, seconds, start, stop, reset } = timer;
  const INTERVAL = 5; // snapshot cadence
  const STALE_AFTER = 25; // seconds without code change => "stale"
  const BASE_COOLDOWN = 60; // first auto-hint cooldown
  const MAX_COOLDOWN = 5 * 60; // cap backoff
  const IDLE_THRESHOLD = 90 * 1000; // 90s without activity => idle
  const MAX_AUTO_HINTS = 5; // per session/problem
  const { user } = useAuth();

  const last = useRef({
    code: "",
    lastChangeSec: 0,
    lastHintWallMs: -Infinity,
    backoffSec: BASE_COOLDOWN,
    autoHintCount: 0,
  });

  const inflight = useRef(false);
  const lastActivityMs = useRef<number>(Date.now());

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    if (seconds > 0 && seconds % 60 === 0) {
      setMinutes((prev) => prev + 1);
    }
  }, [seconds]);

  useEffect(() => {
    if (minutes > 0 && minutes % 60 === 0) {
      setHours((prev) => prev + 1);
    }
  }, [minutes]);

  // Track user presence (keyboard/mouse + visibility)
  useEffect(() => {
    const bump = () => {
      lastActivityMs.current = Date.now();
    };
    const vis = () => {
      lastActivityMs.current = Date.now();
    };
    window.addEventListener("mousemove", bump, { passive: true });
    window.addEventListener("keydown", bump, { passive: true });
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.removeEventListener("mousemove", bump as any);
      window.removeEventListener("keydown", bump as any);
      document.removeEventListener("visibilitychange", vis as any);
    };
  }, []);

  const resetTimer = () => {
    setMinutes(0);
    setHours(0);
    reset();
    const userInfo = user ? user : { id: "guest" };
    ping(
      { user_id: userInfo.id},
      "clear-log-editor-history"
    ).catch(() => {});
  };

  useEffect(() => {
    if (!running || !editorRef.current) return;

    const nowMs = Date.now();
    const hidden = document.hidden;
    const idle = nowMs - lastActivityMs.current >= IDLE_THRESHOLD;

    // Current state of editor
    const code = editorRef.current.getModel()?.getValue() || "";

    // Changes detected
    if (code !== last.current.code) {
      last.current.code = code;
      last.current.lastChangeSec = seconds;
      last.current.backoffSec = BASE_COOLDOWN;
      last.current.autoHintCount = Math.max(0, last.current.autoHintCount - 1);
    }

    if (seconds % INTERVAL === 0) {
      const userInfo = user ? user : { id: "guest" };
      ping(
        { user_id: userInfo.id, code, timestamp: seconds },
        "log-editor-history"
      ).catch(() => {});
    }

    if (hidden || idle) return;

    // Staleness check
    const stale = seconds - last.current.lastChangeSec >= STALE_AFTER;

    // Cooldown check (wall-clock)
    const cooled =
      nowMs - last.current.lastHintWallMs >= last.current.backoffSec * 1000;

    if (!stale || !cooled) return;
    if (inflight.current) return;
    if (last.current.autoHintCount >= MAX_AUTO_HINTS) return;

    inflight.current = true;
    last.current.lastHintWallMs = nowMs;

    Promise.resolve(onAnnotate())
      .catch(() => {})
      .finally(() => {
        inflight.current = false;
        last.current.autoHintCount += 1;
        last.current.backoffSec = Math.min(
          last.current.backoffSec * 2,
          MAX_COOLDOWN
        );
      });
  }, [
    running,
    seconds,
    editorRef,
    onAnnotate,
    user,
    IDLE_THRESHOLD,
    MAX_COOLDOWN,
  ]);

  return (
    <>
      <div
        className={[
          "timer absolute bottom-3 right-3 z-50",
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
              onClick={resetTimer}
              className="px-2 py-1 text-xs font-medium rounded-md border border-[color:var(--dbl-4)] hover:bg-[color:var(--dbl-4)]/60 transition-colors"
              title="Restart timer"
            >
              Restart
            </button>
            <span className="text-xs tabular-nums text-[color:var(--gr-2)] ml-1">
              {hours}:{minutes % 60}:{seconds % 60}
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
              onClick={resetTimer}
              className="px-2 py-1 text-xs font-medium rounded-md border border-[color:var(--dbl-4)] hover:bg-[color:var(--dbl-4)]/60 transition-colors"
              title="Restart timer"
            >
              Restart
            </button>
            <span className="text-xs tabular-nums text-[color:var(--gr-2)] ml-1">
              {hours}:{minutes % 60}:{seconds % 60}
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
        className="neo absolute top-1 right-5 z-50 rounded-full p-2  hover:shadow-[0_8px_20px_rgba(0,0,0,0.45)] transition-shadow"
      >
        <NeoIcon width={30} height={30} hoverBehavior="self" />
      </button>
    </>
  );
}
