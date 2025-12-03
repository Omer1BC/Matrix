"use client";
import { useState, useEffect } from "react";
import { ProblemCategory, ProblemCompletion } from "@/lib/types";
import { getAllCategories, getAllUserProblems } from "@/lib/supabase/problems";

export default function ProblemMenu({
  onProblemSelect,
  refreshKey,
}: {
  onProblemSelect: (problem: ProblemCompletion) => void;
  refreshKey: boolean;
}) {
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [problemCategories, setProblemCategories] = useState<ProblemCategory[]>(
    []
  );
  const [problems, SetProblems] = useState<ProblemCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await getAllCategories();
        setProblemCategories(res);
        setExpandedCategories(new Set(Object.keys(res)));
      } catch (err) {
        console.error(err);
        setError("Failed to get categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [refreshKey]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const res = await getAllUserProblems();
        SetProblems(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [refreshKey]);

  if (loading) return <div>Loading problems...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="w-full" style={{ backgroundColor: "var(--background)" }}>
      <h2 className="text-xl font-bold mb-4" style={{ color: "var(--gr-2)" }}>
        Trees
      </h2>

      {Object.entries(problemCategories).map(([key, section]) => (
        <div key={key} className="mb-4">
          <h1
            className="w-full text-left font-semibold flex items-center gap-2"
            style={{ color: "var(--gr-2)" }}
          >
            <span>●</span>
            {section.title}
          </h1>

          {expandedCategories.has(key) && (
            <div className="mt-2 ml-6 space-y-2">
              {problems
                .filter(
                  (problem) =>
                    problem.category_id.trim() === section.title.trim()
                )
                .map((problem) => {
                  const isLocked = false;
                  return (
                    <button
                      key={problem.id}
                      disabled={isLocked}
                      className={`w-full text-left p-2 rounded-md ${
                        isLocked
                          ? "text-gray-400 cursor-not-allowed"
                          : "hover:opacity-80"
                      }`}
                      style={{
                        backgroundColor: "#151414ff",
                        color: isLocked ? undefined : "var(--gr-2)",
                      }}
                      onClick={() => !isLocked && onProblemSelect(problem)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{problem.title}</span>
                        <div
                          className="w-4 h-4 rounded-full border-2"
                          style={{
                            backgroundColor: problem.is_completed
                              ? "var(--success-color)"
                              : "transparent",
                            borderColor: isLocked
                              ? "var(--dbl-1)"
                              : problem.is_completed
                              ? "var(--success-color)"
                              : "var(--gr-2)",
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
