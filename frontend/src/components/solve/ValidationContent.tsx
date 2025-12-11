"use client";
import React, { Fragment, useState } from "react";
import StarGraph from "@/components/solve/StarGraph";
import { ping } from "@/lib/api";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useAnnotationsContext } from "@/lib/contexts/AnnotationsContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileBadge2 } from "lucide-react";
import { agentCall } from "@/lib/agent";
type ValidationContentProps = {
  problemId: string;
  editorRef: React.RefObject<any>;
  monacoRef: React.RefObject<any>;
  annotateErrors: (codeWithLines: string, error: any) => Promise<any>;
  onOpenTestAnimation: (
    name: string,
    testCase?: Record<string, any>
  ) => Promise<void>;
  timer: any;
};

type TestsMap = Record<string, any>;

export default function ValidationContent({
  problemId,
  editorRef,
  monacoRef,
  annotateErrors,
  onOpenTestAnimation,
  timer,
}: ValidationContentProps) {
  const { applyErrors } = useAnnotationsContext();
  const { user } = useAuth();

  const [activeTest, setActiveTest] = useState<any>({});
  const [tests, setTests] = useState<TestsMap>({});
  const [activeKey, setActiveKey] = useState<string | number>(0);

  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [hasError, setHasError] = useState("");
  const [llmMetrics, setLLmMetrics] = useState<any>(null);
  const [llmExplanations, setLLmExplanations] = useState<
    Record<string, string>
  >({});
  const [llmComment, setLLmComment] = useState("");
  const [testSummary, setTestSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { seconds, start, stop, reset } = timer;

  const buildNumberedCode = () => {
    const editor = editorRef.current;
    if (!editor) return "";
    const model = editor.getModel();
    let code = "";
    for (let i = 1; i <= model.getLineCount(); i++) {
      code += `${i} | ${model.getLineContent(i)}\n`;
    }
    return code;
  };

  const formatSyntaxErrForServer = (e: any) => {
    if (typeof e === "string") return e;
    const msg = e?.message ?? "Syntax error";
    const ln = e?.line != null ? `line ${e.line}` : "";
    const col = e?.column != null ? `, column ${e.column}` : "";
    const src = e?.sourceLine ? `\n${e.sourceLine}` : "";
    return `${msg}${ln || col ? ` at ${ln}${col}` : ""}${src}`;
  };

  const annotateSyntaxToEditor = async (syntaxErrObj: any) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const codeWithLines = buildNumberedCode();
    const payload = formatSyntaxErrForServer(syntaxErrObj);
    const res = await annotateErrors(codeWithLines, payload);
    const map =
      res?.line_number_to_replacement ??
      res?.line_number_to_comment ??
      res?.data?.line_number_to_replacement ??
      res?.data?.line_number_to_comment ??
      {};
    if (map && Object.keys(map).length) {
      applyErrors(editor, monaco, map);
    }
  };

  const runTests = async () => {
    setHasError("");
    const code = editorRef.current?.getValue() || "";

    if (!code.trim()) {
      setHasError("Please add some code before running tests.");
      setShowVictoryModal(false);
      setTests({});
      setActiveTest({});
      setActiveKey(0);
      setTestSummary(null);
      setLLmMetrics(null);
      setLLmExplanations({});
      setLLmComment("");
      return;
    }

    setIsLoading(true);
    try {
      const testsResp = await ping({ problem_id: problemId, code }, "tests");

      if (testsResp?.error) {
        const r = testsResp.result;
        if (
          r &&
          typeof r === "object" &&
          (r.type === "SyntaxError" || r.type === "EntrypointError")
        ) {
          if (r.type === "SyntaxError") {
            await annotateSyntaxToEditor({
              message: r.msg,
              line: r.lineno,
              column: r.offset,
              sourceLine: r.line || "",
            });
            setHasError(
              r.type +
                " - " +
                r.msg +
                " at line \n\t" +
                `(${r.lineno || ""}) ${r.line || ""}`
            );
            // console.log("r.no", r.lineno);
          } else {
            setHasError(r.msg);
          }
        } else {
          setHasError(String(r ?? "Unknown error while running tests."));
        }
        setIsLoading(false);
        setShowVictoryModal(false);
        setTests({});
        setActiveTest({});
        setActiveKey(0);
        setTestSummary(null);
        setLLmMetrics(null);
        setLLmExplanations({});
        setLLmComment("");
        return;
      }

      const gradeRes = await agentCall({
        user_id: user,
        problem_id: String(problemId),
        intent: "grade",
        code,
      });
      const { tests: t, grade } = gradeRes?.data || {};
      const test_summary = t
        ? {
            total: t.summary?.total ?? 0,
            passed: t.summary?.passed ?? 0,
            failed: t.summary?.failed ?? 0,
            cases: t.results || {},
          }
        : { total: 0, passed: 0, failed: 0, cases: {} };

      const verdict = !!grade?.verdict;
      const metrics = grade?.metrics || null;
      const explanations = grade?.explanations || {};
      const comment = grade?.comment || "";

      const cases = test_summary.cases || {};
      setTests(cases);
      const firstKey = Object.keys(cases)[0] || 0;
      setActiveKey(firstKey);
      setActiveTest(cases[firstKey] || {});
      setTestSummary(test_summary || null);

      setLLmMetrics(metrics || null);
      setLLmExplanations(explanations || {});
      setLLmComment(comment || "");

      const allPassed =
        (test_summary?.total || 0) > 0 && (test_summary?.failed || 0) === 0;
      setShowVictoryModal(Boolean(verdict || allPassed));
      if (verdict) {
        try {
          timer.reset();
          // console.log("Reset called successfully");
        } catch (err) {
          console.error("Reset failed:", err);
        }
        // console.log(problemId);
      }
    } catch (error) {
      // Display error message from Neo service
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error encountered while running test";
      setHasError(errorMessage);
      console.error("Test execution failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isPassed = (val: any) =>
    JSON.stringify(val?.actual) === JSON.stringify(val?.expected);

  return (
    <div className="flex h-full w-full flex-row gap-2 p-2">
      <div className="flex w-1/5 flex-col gap-2 bg-[var(--background)] p-3">
        {Object.entries(tests).map(([ky, val]) => (
          <div
            key={ky}
            className="flex flex-1 items-center gap-2 justify-between"
          >
            <button
              onClick={() => {
                setActiveTest(val);
                setActiveKey(ky);
              }}
              className={[
                "flex flex-[0.75] items-center justify-between gap-2 rounded-lg bg-[var(--dbl-2)] px-2 py-2 text-[var(--gr-2)]",
                String(activeKey) === String(ky) && "bg-[var(--dbl-3)]",
              ].join(" ")}
            >
              <span>
                Test Case {Number.isFinite(Number(ky)) ? Number(ky) + 1 : ky}
              </span>
              <span
                className={[
                  "inline-block h-3 w-3 rounded-full",
                  isPassed(val)
                    ? "bg-[var(--success-color)]"
                    : "bg-[var(--failure-color)]",
                ].join(" ")}
              />
            </button>
            <button
              className="playanimation flex-[0.25] inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-[var(--gr-2)] text-black hover:bg-[var(--gr-1)]"
              title="Play animation for this tool"
              onClick={() =>
                onOpenTestAnimation(ky, val as Record<string, any>)
              }
            >
              ▶
            </button>
          </div>
        ))}

        <button
          onClick={runTests}
          disabled={isLoading}
          className={[
            "mt-2 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none",
            isLoading
              ? "cursor-not-allowed bg-[var(--muted,#6b7280)] text-[var(--dbl-1)]"
              : hasError
              ? "cursor-pointer bg-[var(--failure-color)] text-[var(--dbl-1)] hover:brightness-110"
              : "cursor-pointer bg-[var(--gr-2)] text-[var(--dbl-1)] hover:bg-[var(--gr-1)]",
          ].join(" ")}
        >
          {isLoading ? "Running…" : "Test"}
        </button>
      </div>
      <div className="w-px h-full matrix-border"></div>
      <div className="flex w-4/5 flex-col overflow-hidden bg-[var(--background)] p-4">
        <div className="max-h-64 overflow-auto break-words font-sans text-[var(--gr-2)]">
          {hasError ? (
            <div>{hasError}</div>
          ) : (
            Object.entries(activeTest).map(([key, val]) => (
              <Fragment key={key}>
                <div className="text-sm">{key}</div>
                <div className="mb-2 rounded-md bg-[var(--dbl-3)] px-4 py-2 font-mono text-sm text-[var(--gr-2)]">
                  {JSON.stringify(val)}
                </div>
              </Fragment>
            ))
          )}
        </div>
      </div>

      {showVictoryModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50"
          onClick={() => setShowVictoryModal(false)}
        >
          <div
            className="relative w-[90%] max-w-[650px] rounded-2xl bg-[var(--dbl-2)] p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h2 className="mb-4 text-2xl font-semibold text-emerald-500">
                🎉 Results
              </h2>

              {testSummary && (
                <p className="mb-6 text-[var(--gr-2)]">
                  Passed {testSummary.passed}/{testSummary.total} tests
                  {testSummary.failed ? `, ${testSummary.failed} failed` : ""}.
                </p>
              )}

              <div className="my-6">
                <StarGraph
                  metrics={
                    llmMetrics || {
                      robustness: 0,
                      efficiency: 0,
                      readability: 0,
                    }
                  }
                  explanations={
                    llmExplanations || {
                      robustness: "",
                      efficiency: "",
                      readability: "",
                    }
                  }
                />
              </div>

              {llmComment && (
                <p className="mt-2 text-[var(--gr-2)]">{llmComment}</p>
              )}

              <div className="p-4 flex items-center justify-evenly">
                <Button
                  onClick={() => setShowVictoryModal(false)}
                  variant={"destructive"}
                  size={undefined}
                  className={undefined}
                >
                  Close
                </Button>
                <Link href={"/survey"} className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="matrix-border bg-transparent hover:bg-primary/10 text-muted-foreground"
                    style={{ cursor: "pointer" }}
                    size={undefined}
                  >
                    <FileBadge2 className="mr-2 h-4 w-4" />
                    Take the Survey
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
