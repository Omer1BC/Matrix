import { useCallback, useEffect, useRef, useState } from "react";
import { agentCall, ping } from "@/lib/api";
import { useAuth } from "@/lib/contexts/AuthContext";

type ToolInfo = { name: string; description?: string; code?: string };

export function useSolve(problemId: number = 1) {
  const { user } = useAuth();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const [details, setDetails] = useState<any>({});
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  useEffect(() => {
    ping({ problem_id: problemId }, "problem_details").then((data) => {
      if (editorRef.current) editorRef.current.setValue(data.method_stub);
      setDetails(data);
    });
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
    async (text: string) => {
      setLoading(true);
      try {
        const res = await agentCall({
          user_id: user,
          problem_id: String(details?.id || problemId),
          intent: "chat",
          message: text,
          question: `${details?.title ?? ""}\n${details?.description ?? ""}`,
        });
        setResponse(res?.data?.text ?? res?.data?.response ?? "");
      } finally {
        setLoading(false);
      }
    },
    [details, problemId, user]
  );

  const annotate = useCallback(
    async (codeWithLines: string) => {
      setLoading(true);
      try {
        const res = await agentCall({
          user_id: user,
          problem_id: String(details?.id || problemId),
          intent: "annotated_hints",
          code: codeWithLines,
        });
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
        const res = await agentCall({
          user_id: user,
          problem_id: String(details?.id || problemId),
          intent: "annotate_errors",
          code: codeWithLines,
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
