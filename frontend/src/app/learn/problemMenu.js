// New: components/ProblemMenu.jsx

"use client"
import { useState, useEffect } from 'react';

export default function ProblemMenu({ onProblemSelect }) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [problemCategories, setProblemCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const login = async () => {
      try {
        await fetch("http://localhost:8000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username: "admin", password: "password" }),
        });
      } catch (error) {
        console.error("Login error:", error);
      }
    };

    login();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8000/api/categories", {
          credentials: "include",
        });
        const data = await res.json();
        setProblemCategories(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load problems.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleCategory = (key) => {
    setExpandedCategory(prev => (prev === key ? null : key));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'Hard': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  if (loading) return <div>Loading problems...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Problems</h2>

      {Object.entries(problemCategories).map(([key, section]) => (
        <div key={key} className="mb-4">
          <button
            onClick={() => toggleCategory(key)}
            className="w-full text-left text-blue-600 hover:text-blue-800 font-semibold flex justify-between items-center"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{section.icon}</span>
              {section.title}
            </div>
            <span>{expandedCategory === key ? "▲" : "▼"}</span>
          </button>

          {expandedCategory === key && (
            <div className="mt-2 ml-6 space-y-2">
              {section.items.map(problem => {
                const isLocked = !problem.unlocked;
                return (
                  <button
                    key={problem.id}
                    disabled={isLocked}
                    className={`w-full text-left p-2 rounded-md ${
                      isLocked
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                    onClick={() => !isLocked && onProblemSelect(problem)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{problem.title}</span>
                      <span className={`text-xs ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{problem.description}</p>
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
