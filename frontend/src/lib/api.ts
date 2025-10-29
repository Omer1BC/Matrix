// lib/api.ts
import {
  clampLengths,
  type AgentRequest,
  type AgentResponse,
  type AgentResponseMap,
  type Intent,
} from "./agents";

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
  return `http://localhost:8000/${rel}?v=${Date.now()}`;
}

export async function requestAnimationFromAgent(
  prompt: string
): Promise<string | null> {
  const resp = await agentCall({
    user_id: "anon",
    problem_id: "global",
    intent: "generate_animation",
    message: prompt,
    extras: { request: prompt },
  });

  const rel = resp?.data?.video_rel as string | undefined;
  if (!rel) return null;
  return `http://localhost:8000/${rel}?v=${Date.now()}`;
}

export async function ping(data: Record<string, unknown>, endpoint: string) {
  try {
    const res = await fetch(`http://localhost:8000/api/${endpoint}`, {
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
  const res = await fetch(`http://localhost:8000/api/agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clampLengths(payload)),
  });

  const data = (await res.json().catch(() => ({}))) as AgentResponseMap[I];
  if (!res.ok) {
    const msg =
      (data as any)?.data?.error ||
      (data as any)?.error ||
      `Agent error (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export async function get(data: Record<string, unknown>, endpoint: string) {
  try {
    const res = await fetch(`http://localhost:8000/api/${endpoint}`, {
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
