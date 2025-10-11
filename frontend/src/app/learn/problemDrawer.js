"use client";

import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";

export default function ProblemDrawer({
  isOpen,
  onClose,
  onProblemSelect,
  refreshKey,
}) {
  const [activeSection, setActiveSection] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [problemCategories, setProblemCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const drawerRef = useRef(null);

  const { user } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/api/categories", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProblemCategories(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load problem categories");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      drawerRef.current?.focus();

      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          onClose();
        }

        if (e.key === "Tab") {
          const focusableElements = drawerRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "Hard":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
    onProblemSelect(problem);
    onClose();
  };

  if (!user) return null;

  if (!isOpen) return null;

  return (
    <div
      ref={drawerRef}
      tabIndex={-1}
      className="fixed top-0 left-0 w-1/3 h-full bg-gray-900 text-white shadow-2xl z-40 overflow-y-auto focus:outline-none"
      style={{ transform: "translateX(0)" }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-blue-400">Problem Bank</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close drawer"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="p-4">
        {loading ? (
          // Loading state
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <span className="ml-3 text-gray-400">Loading problems...</span>
          </div>
        ) : error ? (
          // Error state
          <div className="text-center py-8">
            <div className="text-red-400 mb-2">⚠️ Error</div>
            <p className="text-gray-400 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        ) : activeSection ? (
          // Detailed view of selected section
          <div>
            <button
              onClick={() => setActiveSection(null)}
              className="flex items-center gap-2 mb-4 text-blue-400 hover:text-blue-300 transition-colors"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to categories
            </button>

            {problemCategories[activeSection] && (
              <>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-2xl">
                    {problemCategories[activeSection].icon}
                  </span>
                  {problemCategories[activeSection].title}
                </h3>

                <div className="space-y-3">
                  {problemCategories[activeSection].items.map((item) => {
                    const isLocked = !item.unlocked; // assume backend returns this
                    return (
                      <button
                        key={item.id}
                        className={`w-full text-left p-4 rounded-lg transition-colors group ${
                          isLocked
                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                            : "bg-gray-800 hover:bg-gray-700 text-white"
                        }`}
                        onClick={() => !isLocked && handleProblemSelect(item)}
                        disabled={isLocked}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`font-medium group-hover:text-blue-400 transition-colors ${
                              isLocked
                                ? "text-gray-400 group-hover:text-gray-400"
                                : ""
                            }`}
                          >
                            {item.title}
                          </div>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${getDifficultyColor(
                              item.difficulty
                            )}`}
                          >
                            {item.difficulty}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {item.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : (
          // Main menu sections
          <div className="space-y-3">
            <h3 className="text-lg font-semibold mb-4 text-gray-300">
              Choose a category
            </h3>
            {Object.entries(problemCategories).map(([key, section]) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all group hover:scale-105"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <div>
                    <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                      {section.title}
                    </div>
                    <div className="text-sm text-gray-400">
                      {section.items.length} problems
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 ml-auto group-hover:text-blue-400 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-800 border-t border-gray-700">
        <div className="text-sm text-gray-400 text-center">
          Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">ESC</kbd>{" "}
          to close
        </div>
      </div>
    </div>
  );
}
