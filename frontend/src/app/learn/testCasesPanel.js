"use client";
import "../templates.css"
import { useRef, useState, useEffect } from 'react';

export default function TestCasesPanel ({ problemId, editorRef, onAllTestsPassed }) {
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
        credentials: "include",
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
        const allPassed = data.test_results?.every(r => r.passed);
        if (allPassed && typeof onAllTestsPassed === 'function') {
            onAllTestsPassed();
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