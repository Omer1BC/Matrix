"use client";

import { useState } from "react";
import { getCurrentUser } from "../../lib/supabase/auth";

export default function TestCasesPanel({
  problemId,
  editorRef,
  onAllTestsPassed,
}) {
  const [runningTests, setRunningTests] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const runTestCases = async () => {
    if (!editorRef.current) {
      console.error("Editor not available");
      return;
    }

    setRunningTests(true);

    try {
      const userCode = editorRef.current.getValue();

      const user = await getCurrentUser();
      const userId =
        typeof user === "string" ? user : user?.id ?? user?.user?.id ?? "";

      if (!userId) {
        console.error("Missing user id from getCurrentUser()");
        setTestResults([]);
        return;
      }

      const payload = {
        code: userCode,
        problem_id: String(problemId),
        user_id: userId,
      };

      console.log("run-learn-tests payload:", {
        ...payload,
        code: userCode.slice(0, 80) + (userCode.length > 80 ? "..." : ""),
      });

      const response = await fetch(
        "http://localhost:8000/api/run-learn-tests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Test results:", data);

        if (data.success) {
          const results = data.test_results || [];
          setTestResults(results);

          const allPassed = results.every((r) => r.passed);
          if (allPassed && typeof onAllTestsPassed === "function") {
            onAllTestsPassed();
          }
        } else {
          console.error("Test execution failed:", data.error);
          setTestResults([]);
        }
      } else {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          const text = await response.text();
          errorData = { raw: text };
        }
        console.error(
          "HTTP error from run-learn-tests:",
          response.status,
          response.statusText,
          errorData
        );
        setTestResults([]);
      }
    } catch (error) {
      console.error("Network or client error in runTestCases:", error);
      setTestResults([]);
    } finally {
      setRunningTests(false);
    }
  };

  return (
    <div
      className="flex flex-col flex-1 min-h-0 p-4 overflow-hidden"
      style={{ backgroundColor: "var(--dbl-2)" }}
    >
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h4 className="text-lg font-semibold" style={{ color: "var(--gr-2)" }}>
          Test Cases
        </h4>
        <button
          onClick={runTestCases}
          disabled={runningTests}
          className="px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:cursor-pointer"
          style={{
            backgroundColor: runningTests ? "var(--dbl-3)" : "var(--gr-2)",
            color: "black",
          }}
        >
          {runningTests ? (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Run Tests
            </>
          )}
        </button>
      </div>

      {testResults.length > 0 && (
        <div
          className="mb-4 p-3 rounded-lg flex-shrink-0"
          style={{ backgroundColor: "var(--dbl-4)" }}
        >
          <div className="text-sm text-center" style={{ color: "var(--gr-2)" }}>
            <span className="font-semibold">
              {testResults.filter((r) => r.passed).length}
            </span>
            <span> / </span>
            <span className="font-semibold">{testResults.length}</span>
            <span> tests passed</span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-3">
          {testResults.map((result, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border-2"
              style={{
                backgroundColor: "var(--dbl-3)",
                borderColor: "var(--dbl-4)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium" style={{ color: "var(--gr-2)" }}>
                  {result.description || `Test Case ${index + 1}`}
                </h5>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: result.passed ? "#00ff00" : "#ff0000",
                  }}
                >
                  {result.passed ? "✓ PASSED" : "✗ FAILED"}
                </span>
              </div>

              {result.input && (
                <div className="mb-2">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--gr-2)" }}
                  >
                    INPUT:
                  </span>
                  <pre
                    className="text-xs p-2 rounded mt-1 font-mono overflow-auto"
                    style={{
                      backgroundColor: "var(--dbl-4)",
                      color: "var(--gr-2)",
                    }}
                  >
                    {typeof result.input === "object"
                      ? JSON.stringify(result.input, null, 2)
                      : result.input}
                  </pre>
                </div>
              )}

              <div className="mb-2">
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--gr-2)" }}
                >
                  EXPECTED:
                </span>
                <pre
                  className="text-xs p-2 rounded mt-1 font-mono"
                  style={{
                    backgroundColor: "var(--dbl-4)",
                    color: "var(--gr-2)",
                  }}
                >
                  {typeof result.expected === "object"
                    ? JSON.stringify(result.expected)
                    : String(result.expected)}
                </pre>
              </div>

              <div className="mb-2">
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--gr-2)" }}
                >
                  ACTUAL:
                </span>
                <pre
                  className="text-xs p-2 rounded mt-1 font-mono"
                  style={{
                    backgroundColor: "var(--dbl-4)",
                    color: "var(--gr-2)",
                  }}
                >
                  {typeof result.actual === "object"
                    ? JSON.stringify(result.actual)
                    : String(result.actual)}
                </pre>
              </div>

              {result.error && (
                <div>
                  <span className="text-xs font-semibold text-red-600">
                    ERROR:
                  </span>
                  <pre className="text-xs bg-red-100 p-2 rounded mt-1 font-mono text-red-800">
                    {result.error}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {testResults.length === 0 && !runningTests && (
          <div className="text-center py-8">
            <p style={{ color: "var(--gr-2)" }}>
              Click &quot;Run Tests&quot; to see your results
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
