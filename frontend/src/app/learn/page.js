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
import TestCasesPanel from "./testCasesPanel"
import ProblemMenu from "./problemMenu";

// Problem Selection Drawer Component

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
  <div className="Page h-screen bg-gray-100 overflow-hidden">
    {/* Main 3-Column Grid with custom column widths */}
    <div className="grid grid-cols-[1fr_3fr_1fr] gap-6 h-full p-6 mx-auto">

      {/* Column 1: Problem Menu with vertical progress bar */}
      <div className="relative bg-white rounded-lg shadow-lg p-4 overflow-y-auto flex">
        {/* Progress Bar Container */}
        <div className="relative w-2 mr-4 rounded-full bg-gray-300">
          {/* Filled part */}
          <div
            className="bg-green-500 rounded-full w-full absolute  left-0 transition-all duration-300"
            style={{ height: `5%` }}
          />
        </div>

        {/* Actual Problem Menu content */}
        <div className="flex-1">
          <ProblemMenu onProblemSelect={handleProblemSelect} />
        </div>
      </div>

      {/* Column 2: Exercise, Editor, Video */}
      <div className="flex flex-col gap-4 overflow-y-auto">
        
        {/* Exercise Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Exercise {currentProblem.id}: {problemDetails?.title || currentProblem.title}
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              (problemDetails?.difficulty || currentProblem.difficulty) === 'Easy'
                ? 'bg-green-100 text-green-800'
                : (problemDetails?.difficulty || currentProblem.difficulty) === 'Medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {problemDetails?.difficulty || currentProblem.difficulty}
            </span>
          </div>
          <div className="text-gray-600 mb-4 whitespace-pre-wrap">
            {problemDetails?.description || currentProblem.description}
          </div>
          {problemDetails?.category && (
            <div className="text-sm text-gray-500">
              Category: {problemDetails.category}
            </div>
          )}
        </div>

        {/* Code Editor */}
        <div className="bg-white rounded-lg shadow-lg h-96 overflow-hidden flex-shrink-0">
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
              url={urls[idx]}
              width="100%"
              height="100%"
            />
          </div>
        </div>
      </div>

      {/* Column 3: Test Cases and Output */}
      <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col overflow-y-auto">
        
        {/* Output Display */}
        {output && (
          <div className="mb-6 flex-shrink-0">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Console Output:</h4>
            <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono overflow-auto max-h-32">
              {output}
            </pre>
          </div>
        )}

        {/* Test Cases Panel */}
        <div className="flex-1 min-h-0">
          <TestCasesPanel
            problemId={currentProblem.id}
            editorRef={editorRef}
          />
        </div>
      </div>

    </div>
  </div>
);


  
}