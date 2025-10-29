// lib/agent.ts
export type Intent =
  | "chat"
  | "hints"
  | "annotated_hints"
  | "tool_hints"
  | "tests"
  | "grade"
  | "annotate_errors"
  | "generate_animation";

export type Extras = {
  pattern?: string;
  error?: string;
  [k: string]: unknown;
};

export interface AgentRequest {
  user_id: string;
  problem_id: string;
  message?: string;
  question?: string;
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
