"use client";

import Image from "next/image";
import "../templates.css"
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Disclosure, Menu } from '@headlessui/react'
import ReactPlayer from 'react-player'
import { Editor } from '@monaco-editor/react'
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link'
import Card from '../templates/card/card';
import ValidationContent from "../cards/validation/content";

import { fetchProblemDetails } from '../utils/apiUtils';

// Problem Selection Drawer Component
const ProblemDrawer = ({ isOpen, onClose, onProblemSelect }) => {
  const [activeSection, setActiveSection] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [problemCategories, setProblemCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const drawerRef = useRef(null);

  // Fetch problem categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/categories');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProblemCategories(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load problem categories');
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
        if (e.key === 'Escape') {
          onClose();
        }

        if (e.key === 'Tab') {
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

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
    onProblemSelect(problem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={drawerRef}
      tabIndex={-1}
      className="fixed top-0 left-0 w-1/3 h-full bg-gray-900 text-white shadow-2xl z-40 overflow-y-auto focus:outline-none"
      style={{ transform: 'translateX(0)' }}
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to categories
            </button>

            {problemCategories[activeSection] && (
              <>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-2xl">{problemCategories[activeSection].icon}</span>
                  {problemCategories[activeSection].title}
                </h3>

                <div className="space-y-3">
                  {problemCategories[activeSection].items.map((item) => (
                    <button
                      key={item.id}
                      className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors group"
                      onClick={() => handleProblemSelect(item)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getDifficultyColor(item.difficulty)}`}>
                          {item.difficulty}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {item.description}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          // Main menu sections
          <div className="space-y-3">
            <h3 className="text-lg font-semibold mb-4 text-gray-300">Choose a category</h3>
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
                  <svg className="w-5 h-5 text-gray-400 ml-auto group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
          Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">ESC</kbd> to close
        </div>
      </div>
    </div>
  );
};

// Updated Test Cases Component
const TestCasesPanel = ({ problemId, editorRef }) => {
  const [runningTests, setRunningTests] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const runTestCases = async () => {
    if (!editorRef.current) {
      console.error('Editor not available');
      return;
    }

    setRunningTests(true);
    const userCode = editorRef.current.getValue();
    console.log(problemId)
    try {
      const response = await fetch("http://localhost:8000/api/run-learn-tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: userCode,
          problem_id: problemId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Test results:', data);

        if (data.success) {
          setTestResults(data.test_results || []);
        } else {
          console.error('Test execution failed:', data.error);
          setTestResults([]);
        }
      } else {
        const errorData = await response.json();
        console.error('HTTP error:', errorData);
        setTestResults([]);
      }
    } catch (error) {
      console.error('Network error:', error);
      setTestResults([]);
    } finally {
      setRunningTests(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header - Fixed at top */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h4 className="text-lg font-semibold text-gray-800">Test Cases</h4>
        <button
          onClick={() => runTestCases()}
          disabled={runningTests}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          {runningTests ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Running Tests...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run Tests
            </>
          )}
        </button>
      </div>

      {/* Test Summary - Fixed */}
      {testResults.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg flex-shrink-0">
          <div className="text-sm text-center">
            <span className="text-green-600 font-semibold">
              {testResults.filter(r => r.passed).length}
            </span>
            <span className="text-gray-500"> / </span>
            <span className="text-gray-800 font-semibold">{testResults.length}</span>
            <span className="text-gray-500"> tests passed</span>
          </div>
        </div>
      )}

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-3">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${result.passed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-800">
                  {result.description || `Test Case ${index + 1}`}
                </h5>
                <span className={`text-sm font-semibold ${result.passed ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {result.passed ? '✓ PASSED' : '✗ FAILED'}
                </span>
              </div>

              {/* Input Display */}
              {result.input && (
                <div className="mb-2">
                  <span className="text-xs font-semibold text-gray-500">INPUT:</span>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 font-mono overflow-auto">
                    {typeof result.input === 'object' ? JSON.stringify(result.input, null, 2) : result.input}
                  </pre>
                </div>
              )}

              {/* Expected Output */}
              <div className="mb-2">
                <span className="text-xs font-semibold text-gray-500">EXPECTED:</span>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-1 font-mono">
                  {typeof result.expected === 'object' ? JSON.stringify(result.expected) : result.expected}
                </pre>
              </div>

              {/* Actual Output */}
              <div className="mb-2">
                <span className="text-xs font-semibold text-gray-500">ACTUAL:</span>
                <pre className={`text-xs p-2 rounded mt-1 font-mono ${result.passed ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                  {typeof result.actual === 'object' ? JSON.stringify(result.actual) : result.actual}
                </pre>
              </div>

              {/* Error Display */}
              {result.error && (
                <div>
                  <span className="text-xs font-semibold text-red-600">ERROR:</span>
                  <pre className="text-xs bg-red-100 p-2 rounded mt-1 font-mono text-red-800">
                    {result.error}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {testResults.length === 0 && !runningTests && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🧪</div>
            <p>Click "Run Tests" to see your results</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default function ProblemsPage() {
  const [output, setOutput] = useState("");
  const editorRef = useRef(null);
  const [drawerToggle, setDrawerToggle] = useState(false);
  const [currentProblem, setCurrentProblem] = useState({
    id: "intro-1",
    title: "Hello World",
    description: "Write a program that prints 'Hello, World!' to the console.",
    difficulty: "Easy"
  });
  const [problemDetails, setProblemDetails] = useState(null);
  const [testCases, setTestCases] = useState([]);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    // Set initial code based on current problem
    editor.setValue('# Write your solution here\nprint("Hello, World!")');
  }

  async function runCode(problemId) {
    // If problemId is an event object (from onClick), use the current problem ID instead
    const actualProblemId = (typeof problemId === 'object' && problemId.target)
      ? currentProblem.id
      : (problemId || currentProblem.id);

    let val = editorRef.current.getValue();
    try {
      const requestBody = JSON.stringify({
        code: val,
        problem_id: actualProblemId
      });

      const res = await fetch("http://localhost:8000/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      const data = await res.json();
      console.log('Response:', res);
      setOutput(data.output || data.error || "No output returned");
    } catch (err) {
      setOutput("Error sending POST request: " + err.message);
    }
  }

  const handleProblemSelect = async (problem) => {
    setCurrentProblem(problem);

    // Fetch detailed problem information from the API
    try {
      const response = await fetch("http://localhost:8000/api/problem-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ problem_id: problem.id }),
      });

      if (response.ok) {
        const details = await response.json();
        setProblemDetails(details);

        // Parse test cases from JSON string
        let parsedTestCases = [];
        try {
          parsedTestCases = typeof details.test_cases === 'string'
            ? JSON.parse(details.test_cases)
            : details.test_cases || [];
        } catch (e) {
          console.error('Error parsing test cases:', e);
          parsedTestCases = [];
        }
        setTestCases(parsedTestCases);

        // Update editor with the starter code from the API
        if (editorRef.current && details.method_stub) {
          editorRef.current.setValue(details.method_stub);
        }
      } else {
        console.error('Failed to fetch problem details');
        // Fallback to default starter code
        if (editorRef.current) {
          const starterCode = getStarterCode(problem.id);
          editorRef.current.setValue(starterCode);
        }
        setTestCases([]);
      }
    } catch (error) {
      console.error('Error fetching problem details:', error);
      // Fallback to default starter code
      if (editorRef.current) {
        const starterCode = getStarterCode(problem.id);
        editorRef.current.setValue(starterCode);
      }
      setTestCases([]);
    }

    setOutput(""); // Clear previous output
  };

  const getStarterCode = (problemId) => {
    const starterCodes = {
      "intro-1": '# Write a program that prints "Hello, World!"\nprint("Hello, World!")',
      "intro-2": '# Create variables and print them\nname = ""\nage = 0\nprint(f"Name: {name}, Age: {age}")',
      "ds-1": '# Work with lists\nnumbers = [1, 2, 3, 4, 5]\n# Add your code here',
      "sort-1": '# Implement bubble sort\ndef bubble_sort(arr):\n    # Your implementation here\n    pass\n\n# Test your function\ntest_array = [64, 34, 25, 12, 22, 11, 90]\nprint(bubble_sort(test_array))',
    };
    return starterCodes[problemId] || '# Write your solution here\n';
  };

  const urls = ['/vid.mp4', '/vid2.mp4'];
  const [idx, setIdx] = useState(0);
  const handleEnded = () => {
    setIdx(1);
  };

return (
    <>
      <div className="Page relative h-screen bg-gray-100 overflow-hidden">
        {/* Toggle Button */}
        <button
          onClick={() => setDrawerToggle(!drawerToggle)}
          className={`absolute top-4 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2 ${drawerToggle ? 'hidden' : 'translate-x-0'
            }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Problems
        </button>

        {/* Problem Selection Drawer */}
        <ProblemDrawer
          isOpen={drawerToggle}
          onClose={() => setDrawerToggle(false)}
          onProblemSelect={handleProblemSelect}
        />

        {/* Overlay for focus trap */}
        {drawerToggle && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setDrawerToggle(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Content */}
        <div
          className={`transition-all duration-300 h-full ${drawerToggle ? 'ml-[33vw] opacity-50 pointer-events-none' : 'ml-0'
            } p-6`}
        >
          {/* Centered Layout Container */}
          <div className="max-w-7xl mx-auto h-full">
            <div className="grid grid-cols-3 gap-6 h-full">

              {/* Left Column - Exercise and Code Editor */}
              <div className="col-span-2 flex flex-col gap-4 h-full overflow-y-auto">

                {/* Exercise Section */}
                <div className="bg-white rounded-lg shadow-lg p-6 flex-shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Exercise {currentProblem.id}: {problemDetails?.title || currentProblem.title}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${(problemDetails?.difficulty || currentProblem.difficulty) === 'Easy' ? 'bg-green-100 text-green-800' :
                        (problemDetails?.difficulty || currentProblem.difficulty) === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                      {problemDetails?.difficulty || currentProblem.difficulty}
                    </span>
                  </div>
                  <div className="text-gray-600 mb-4 whitespace-pre-wrap">
                    {problemDetails?.description || currentProblem.description}
                  </div>

                  {/* Show additional problem details if available */}
                  {problemDetails?.category && (
                    <div className="text-sm text-gray-500">
                      Category: {problemDetails.category}
                    </div>
                  )}
                </div>

                {/* Code Editor */}
                <div className="bg-white rounded-lg shadow-lg h-96 overflow-hidden flex-shrink-0">
                  <div className="h-full">
                    <Editor
                      height="100%"
                      width="100%"
                      language="python"
                      theme="vs-dark"
                      onMount={handleEditorDidMount}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true
                      }}
                    />
                  </div>
                </div>
                {/* Run Code Button */}
                <div className="flex-shrink-0">
                  <button
                    onClick={() => runCode}
                    type="button"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm px-5 py-3 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V7a3 3 0 11-6 0V4" />
                    </svg>
                    Run Code
                  </button>
                </div>

                {/* Video Player */}
                <div className="bg-white rounded-lg shadow-lg p-4 flex-shrink-0">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Tutorial Video</h3>
                  <div className="aspect-video">
                    <ReactPlayer
                      muted={true}
                      playing={false}
                      className="react-player"
                      onEnded={handleEnded}
                      controls={true}
                      src={urls[idx]}
                      width="100%"
                      height="100%"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Test Cases and Run Controls */}
              <div className="h-full overflow-y-scroll">
                <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
                  {/* Output Display */}
                  {output && (
                    <div className="mb-6 flex-shrink-0">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Console Output:</h4>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono overflow-auto max-h-32">
                        {output}
                      </pre>
                    </div>
                  )}

                  {/* Test Cases Panel Container - This is where scrolling should happen */}
                  <div className="flex-1 min-h-0">
                    <TestCasesPanel
                      problemId={currentProblem.id}
                      editorRef={editorRef}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}