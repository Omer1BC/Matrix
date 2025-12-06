// lib/agent.ts
import { API_BASE_URL } from "./api";

export type Intent =
  | "chat"
  | "hints"
  | "annotated_hints"
  | "tool_hints"
  | "tests"
  | "grade"
  | "annotate_errors"
  | "generate_animation"
  | "explain";

export type Extras = {
  pattern?: string;
  error?: string;
  [k: string]: unknown;
};

export interface AgentHealthStatus {
  is_healthy: boolean;
  error_type: string;
  error_message: string;
  last_check: string | null;
  consecutive_failures: number;
}

export interface AgentRequest {
  user_id: string;
  problem_id: string;
  message?: string;
  question?: string;
  test_cases?: string;
  intent?: Intent | null;
  code?: string | null;
  preferences?: string | null;
  extras?: Extras;
}

export interface AgentResponse<
  K extends Intent | "chat" = Intent | "chat",
  D = unknown
> {
  kind: K;
  data: D;
  meta?: Record<string, unknown>;
}

export interface TestsSummary {
  total: number;
  passed: number;
  failed: number;
}
export interface RunTestsData {
  had_error: boolean;
  raw: unknown;
  results: Record<string, any>;
  summary: TestsSummary;
}
export interface GradeData {
  tests: RunTestsData;
  grade: {
    metrics: { readability: number; efficiency: number; robustness: number };
    explanations: {
      readability: string;
      efficiency: string;
      robustness: string;
    };
    verdict: boolean;
    comment: string;
  };
}

export type AgentResponseMap = {
  chat: AgentResponse<"chat", { text?: string; response?: string }>;
  tests: AgentResponse<"tests", RunTestsData>;
  grade: AgentResponse<"grade", GradeData>;
  hints: AgentResponse<"hints", any>;
  annotated_hints: AgentResponse<"annotated_hints", any>;
  annotate_errors: AgentResponse<"annotate_errors", any>;
  tool_hints: AgentResponse<"tool_hints", any>;
  explain: AgentResponse<"explain", any>;
  generate_animation: AgentResponse<"generate_animation", any>;
};

export function clampLengths(p: AgentRequest): AgentRequest {
  const clamp = (v: string | null | undefined, n: number) =>
    typeof v === "string" && v.length > n ? v.slice(0, n) : v ?? undefined;
  return {
    ...p,
    code: clamp(p.code ?? undefined, 500_000),
    preferences: clamp(p.preferences ?? undefined, 2_000),
  };
}

export async function agentHealth(): Promise<AgentHealthStatus | null> {
  try {
    const res = await fetch(`${API_BASE_URL}api/neo-health`, {
      method: "GET",
    });

    if (!res.ok) {
      console.error("Failed to fetch Neo health status:", res.status);
      return null;
    }

    const data: AgentHealthStatus = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to check Neo health status:", error);
    return null;
  }
}

export async function agentCall<I extends Intent | "chat" = "chat">(
  payload: AgentRequest & { intent?: I }
): Promise<AgentResponseMap[I]> {
  try {
    const res = await fetch(`${API_BASE_URL}api/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clampLengths(payload)),
    });

    const data = (await res.json().catch(() => ({}))) as AgentResponseMap[I];
    if (!res.ok) {
      const errorData = (data as any)?.data;
      let msg =
        errorData?.error ||
        (data as any)?.error ||
        `Agent error (${res.status})`;

      if (errorData?.plan) {
        const ops = errorData.plan.operations || [];
        if (ops.length > 0) {
          const opsSummary = ops
            .map((op: any) =>
              op.args?.length ? `${op.name}(${op.args.join(", ")})` : op.name
            )
            .join(", ");
          msg += `\n\nAttempted operations: ${opsSummary}`;
        }
      }

      if (res.status === 503 || res.status === 429) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("neo-service-error", {
              detail: {
                error_type: (data as any)?.error_type,
                status: res.status,
              },
            })
          );
        }
      }

      throw new Error(msg);
    }
    return data;
  } catch (error) {
    console.error("[agentCall] Error:", error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("neo-service-error", {
            detail: {
              error_type: "connection_error",
              status: 0,
            },
          })
        );
      }

      throw new Error(
        "Neo is currently unavailable. The service may be experiencing issues. Please contact a system administrator."
      );
    }
    throw error;
  }
}

export async function requestAnimationFromAgent(
  prompt: string,
  animationSpeed: number = 1.0,
  user_id: string = "anon"
): Promise<string | null> {
  const resp = await agentCall({
    user_id: user_id,
    problem_id: "global",
    intent: "generate_animation",
    message: prompt,
    extras: { request: prompt, animation_speed: animationSpeed },
  });

  const rel = resp?.data?.video_rel as string | undefined;
  if (!rel) return null;
  return `${API_BASE_URL}${rel}?v=${Date.now()}`;
}
