import { useCallback, useEffect, useRef, useState } from "react";
import { agentCall, ping } from "@/lib/api";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getUserProfile, updateTokensUsed } from "../supabase/auth";
import { getProblemBySlug } from "../supabase/models/problems";

type ToolInfo = { name: string; description?: string; code?: string };

export function useSolve(problemId: string = "intro-1") {
  const { user } = useAuth();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const [details, setDetails] = useState<any>({});
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [testResponse, setTestResponse] = useState("");

  useEffect(() => {
    (async () => {
      const data = await getProblemBySlug(problemId);
      setDetails(data);
      if (editorRef.current && data?.method_stub)
        editorRef.current.setValue(data.method_stub);
    })().catch(console.error);
  }, [problemId]);

  useEffect(() => {
    const t = Object.entries(details?.tools ?? {}).map(([name, info]: any) => ({
      name,
      description: info?.description,
      code: info?.code,
    }));
    setTools(t);
  }, [details]);

  const askSelection = useCallback(
    async (text: string,type?: string) => {
      setLoading(true);
      try {
        const profile = await getUserProfile();

        const user_id =
          typeof user === "string" ? user : user?.id ?? user?.user?.id ?? "";

        if (!user_id) throw new Error("Missing user_id");

        const probId = details?.problem_id ?? problemId;

        const code =
          editorRef.current?.getValue?.() ?? details?.method_stub ?? "";

        const preferences = profile?.learning_style ?? "";

        const res = await agentCall({
          user_id: user_id,
          problem_id: String(probId),
          intent: type ?? "chat",
          message: text,
          question: `${details?.title ?? ""}\n${details?.description ?? ""}`,
          code: code,
          preferences: preferences,
        });
        await updateTokensUsed((res?.meta?.total_tokens as number) ?? 0);
        setResponse(res?.data?.text ?? res?.data?.response ?? "");
        setTestResponse(res);
      } finally {
        setLoading(false);
      }
    },
    [details, problemId, user]
  );

  useEffect(() => {
    console.log(testResponse);
  }, [testResponse]);

  const annotate = useCallback(
    async (codeWithLines: string) => {
      setLoading(true);
      try {
        const profile = await getUserProfile();
        const preferences = profile?.learning_style ?? "";
        const probId = details?.problem_id ?? problemId;

        const res = await agentCall({
          user_id: user,
          problem_id: String(probId),
          intent: "annotated_hints",
          code: codeWithLines,
          preferences: preferences,
        });
        setTestResponse(res);
        return res?.data ?? {};
      } finally {
        setLoading(false);
      }
    },
    [details, problemId, user]
  );

  const annotateErrors = useCallback(
    async (codeWithLines: string, error: string) => {
      setLoading(true);
      try {
        const profile = await getUserProfile();
        const preferences = profile?.learning_style ?? "";
        const probId = details?.problem_id ?? problemId;

        const res = await agentCall({
          user_id: user,
          problem_id: String(probId),
          intent: "annotate_errors",
          code: codeWithLines,
          preferences: preferences,
          extras: { error },
        });
        return res?.data ?? {};
      } finally {
        setLoading(false);
      }
    },
    [details, problemId, user]
  );

  return {
    editorRef,
    monacoRef,
    details,
    tools,
    loading,
    response,
    setResponse,
    setLoading,
    askSelection,
    annotate,
    annotateErrors,
  };
}
