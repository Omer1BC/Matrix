// lib/api.ts
import {
  clampLengths,
  type AgentRequest,
  type AgentResponse,
  type AgentResponseMap,
  type Intent,
} from "./agents";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";

export async function getAnimationUrl(opts: {
  name: string;
  args?: Record<string, unknown>;
}): Promise<string | null> {
  const data = opts.args
    ? Object.entries(opts.args).map(([k, v]) => `${k} = ${String(v)}`)
    : [];
  const resp = await ping({ data, name: opts.name }, "get_pattern_media");
  const rel = resp?.data;
  if (!rel) return null;
  return `${API_BASE_URL}${rel}?v=${Date.now()}`;
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

export async function ping(data: Record<string, unknown>, endpoint: string) {
  try {
    const res = await fetch(`${API_BASE_URL}api/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      return {};
    }

    const json = await res.json();
    return json;
  } catch (error) {
    console.error("Failed to fetch problem details:", error);
    return {};
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
        errorData?.error || (data as any)?.error || `Agent error (${res.status})`;

      // Add plan info if available for animation errors
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

      // Trigger health check when Neo service errors occur (503, 429)
      if (res.status === 503 || res.status === 429) {
        // Dispatch custom event to notify NeoStatusBanner
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('neo-service-error', {
            detail: {
              error_type: (data as any)?.error_type,
              status: res.status
            }
          }));
        }
      }

      throw new Error(msg);
    }
    return data;
  } catch (error) {
    console.error('[agentCall] Error:', error);

    // Handle network errors (connection reset, failed to fetch, etc.)
    // These occur when the backend crashes before sending a response
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Trigger health check for network/connection errors
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('neo-service-error', {
          detail: {
            error_type: 'connection_error',
            status: 0
          }
        }));
      }

      throw new Error('Neo is currently unavailable. The service may be experiencing issues. Please contact a system administrator.');
    }

    // Re-throw other errors
    throw error;
  }
}

export async function get(data: Record<string, unknown>, endpoint: string) {
  try {
    const res = await fetch(`${API_BASE_URL}api/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      return {};
    }

    const json = await res.json();
    return json;
  } catch (error) {
    console.error("Failed to fetch problem details:", error);
    return {};
  }
}

export interface NeoHealthStatus {
  is_healthy: boolean;
  error_type: string;
  error_message: string;
  last_check: string | null;
  consecutive_failures: number;
}

export async function checkNeoHealth(): Promise<NeoHealthStatus | null> {
  try {
    const res = await fetch(`${API_BASE_URL}api/neo-health`, {
      method: "GET",
    });

    if (!res.ok) {
      console.error("Failed to fetch Neo health status:", res.status);
      return null;
    }

    const data: NeoHealthStatus = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to check Neo health status:", error);
    return null;
  }
}
