// New: components/ProblemMenu.jsx

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ProblemCategory, ProblemCompletion } from "@/lib/types";
import { getAllCategories, getAllUserProblems } from "@/lib/supabase/problems";

export default function ProblemMenu({ onProblemSelect, refreshKey }) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [problemCategories, setProblemCategories] = useState<ProblemCategory[]>([]);
  const [problems, SetProblems] = useState<ProblemCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    }

    fetchProblems();
  }, [refreshKey]);

  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await fetch("http://localhost:8000/api/categories", {
  //         credentials: "include",
  //       });
  //       const data = await res.json();
  //       setProblemCategories(data);
  //       console.log(data);
  //     } catch (err) {
  //       console.error(err);
  //       setError("Failed to load problems.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchCategories();
  // }, [refreshKey]);

  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await fetch("http://localhost:8000/api/categories", {
  //         credentials: "include",
  //       });
  //       const data = await res.json();
  //       setProblemCategories(data);
  //     } catch (err) {
  //       console.error(err);
  //       setError("Failed to load problems.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchCategories();
  // }, []);

  const toggleCategory = (key) => {
    setExpandedCategory((prev) => (prev === key ? null : key));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-500";
      case "Medium":
        return "text-yellow-500";
      case "Hard":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  if (loading) return <div>Loading problems...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="w-full" style={{ backgroundColor: "var(--dbl-2)" }}>
      <h2 className="text-xl font-bold mb-4" style={{ color: "var(--gr-2)" }}>
        Graphs
      </h2>

      {Object.entries(problemCategories).map(([key, section]) => (
        <div key={key} className="mb-4">
          <button
            onClick={() => toggleCategory(key)}
            className="w-full text-left font-semibold flex items-center gap-2"
            style={{ color: "var(--gr-2)" }}>
            <span>{expandedCategory === key ? "▼" : "▶"}</span>
            <span className="text-2xl">{section.icon}</span>
            {section.title}
          </button>

          {expandedCategories.has(key) && (
            <div className="mt-2 ml-6 space-y-2">
              {problems.filter(problem => problem.category_id === section.title).map(problem => {
                const isLocked = !problem.is_unlocked;
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
                      backgroundColor: "var(--dbl-3)",
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
