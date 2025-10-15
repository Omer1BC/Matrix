"use client";

import Image from "next/image";
import "../templates.css";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Disclosure, Menu, Textarea } from "@headlessui/react";
import ReactPlayer from "react-player";
import { Editor } from "@monaco-editor/react";
import { useRef, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Card from "../templates/card/card";
import ValidationContent from "../cards/validation/content";
import TestCasesPanel from "./testCasesPanel";
import ProblemMenu from "./problemMenu";
import {NotesCard} from './NotesCard';
// Problem Selection Drawer Component

export default function ProblemsPage() {
  const [output, setOutput] = useState("");
  const editorRef = useRef(null);
  const [drawerToggle, setDrawerToggle] = useState(false);
  const [currentProblem, setCurrentProblem] = useState({
    id: "intro-1",
    title: "Hello World",
    description: "Write a program that prints 'Hello, World!' to the console.",
    difficulty: "Easy",
  });
  const [problemDetails, setProblemDetails] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [refreshKey, setRefreshKey] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  function toggleRefresh() {
    setRefreshKey(!refreshKey);
  }
  function handleAllTestsPassed() {
    setShowVictoryModal(true);
    toggleRefresh();
  }

  const [notes, setNotes] = useState("");

  useEffect(() => {
    pingPercentage();
  }, [refreshKey]);

  function pingPercentage() {
    fetch("http://localhost:8000/api/completion", {
      method: "GET",

      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setCompletionPercentage(data.percentage);
        console.log(completionPercentage);
      })
      .catch((error) => {
        console.error("Error fetching completion percentage:", error);
      });
  }

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    // Set initial code based on current problem
    editor.setValue('# Write your solution here\nprint("Hello, World!")');
  }

  const handleProblemSelect = async (problem) => {
    setCurrentProblem(problem);

    // Fetch detailed problem information from the API
    try {
      const response = await fetch(
        "http://localhost:8000/api/problem-details",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ problem_id: problem.id }),
        }
      );

      if (response.ok) {
        const details = await response.json();
        setProblemDetails(details);

        // Parse test cases from JSON string
        let parsedTestCases = [];
        try {
          parsedTestCases =
            typeof details.test_cases === "string"
              ? JSON.parse(details.test_cases)
              : details.test_cases || [];
        } catch (e) {
          console.error("Error parsing test cases:", e);
          parsedTestCases = [];
        }
        setTestCases(parsedTestCases);

        // Update editor with the starter code from the API
        if (editorRef.current && details.method_stub) {
          editorRef.current.setValue(details.method_stub);
        }
      } else {
        console.error("Failed to fetch problem details");
        // Fallback to default starter code
        if (editorRef.current) {
          const starterCode = getStarterCode(problem.id);
          editorRef.current.setValue(starterCode);
        }
        setTestCases([]);
      }
    } catch (error) {
      console.error("Error fetching problem details:", error);
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
      "intro-1":
        '# Write a program that prints "Hello, World!"\nprint("Hello, World!")',
      "intro-2":
        '# Create variables and print them\nname = ""\nage = 0\nprint(f"Name: {name}, Age: {age}")',
      "ds-1":
        "# Work with lists\nnumbers = [1, 2, 3, 4, 5]\n# Add your code here",
      "sort-1":
        "# Implement bubble sort\ndef bubble_sort(arr):\n    # Your implementation here\n    pass\n\n# Test your function\ntest_array = [64, 34, 25, 12, 22, 11, 90]\nprint(bubble_sort(test_array))",
    };
    return starterCodes[problemId] || "# Write your solution here\n";
  };

  const urls = ["/vid.mp4", "/vid2.mp4"];
  const [idx, setIdx] = useState(0);
  const handleEnded = () => {
    setIdx(1);
  };

  const codeTabs = useMemo(
      () => ({
        editor: {
          label: "Editor",
          content: (
            <div className="flex-1 flex flex-col h-full rounded-lg shadow-lg overflow-hidden">
              
              <div className="p-4" style={{ backgroundColor: "var(--dbl-3)" }}>
                <div className="mb-2">
                  <h2
                    className="text-xl font-bold"
                    style={{ color: "var(--gr-2)" }}
                  >
                    Exercise {currentProblem.id}:{" "}
                    {problemDetails?.title || currentProblem.title}
                  </h2>
                </div>
                <div
                  className="text-sm whitespace-pre-wrap"
                  style={{ color: "var(--gr-2)" }}
                >
                  {problemDetails?.description || currentProblem.description}
                </div>
              </div>
             
              <div className="flex-1 min-h-[300px]">
                <Editor
                  height="100%"
                  width="100%"
                  language="python"
                  theme="vs-dark"
                  onMount={handleEditorDidMount}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>
          ),
        },
        notes: {
          label: "Notes",
          content: (
            <NotesCard 
            notes={notes}
            onChange={(value) =>
            setNotes(value)
          }
          />
          )
        },
      }),
      [currentProblem, problemDetails, notes, setNotes]
    );

  return (
    <>
      <div
        className="Page h-screen overflow-hidden"
        style={{ backgroundColor: "var(--dbl-1)" }}
      >
        {/* Main 3-Column Grid with custom column widths */}
        <div className="grid grid-cols-[1fr_3fr_1fr] gap-6 h-full p-6 mx-auto">
          {/* Column 1: Problem Menu with vertical progress bar */}
          <div className="rounded-lg shadow-lg overflow-hidden flex flex-col">
            {/* Navigation Menu Header */}
            <div className="p-4" style={{ backgroundColor: "var(--dbl-3)" }}>
              <h2
                className="text-lg font-bold text-center"
                style={{ color: "var(--gr-2)" }}
              >
                Menu
              </h2>
            </div>

            {/* Problem Menu with Progress Bar */}
            <div
              className="relative p-4 overflow-y-auto flex flex-1"
              style={{ backgroundColor: "var(--dbl-2)" }}
            >
              {/* Progress Bar Container */}
              <div
                className="relative w-2 mr-4 rounded-full"
                style={{ backgroundColor: "var(--dbl-4)" }}
              >
                {/* Filled part */}
                <div
                  className="rounded-full w-full absolute left-0 transition-all duration-300"
                  style={{
                    height: `${completionPercentage}%`,
                    backgroundColor: "var(--gr-2)",
                  }}
                />
              </div>

              {/* Actual Problem Menu content */}
              <div
                className="flex-1"
                style={{ backgroundColor: "var(--dbl-2)" }}
              >
                <ProblemMenu
                  onProblemSelect={handleProblemSelect}
                  refreshKey={refreshKey}
                />
              </div>
            </div>
          </div>

          {/* Column 2: Video, Exercise & Editor */}
          <div className="flex flex-col gap-4 flex-1 min-h-0">
            {/* Video Player */}
            <div className="rounded-lg shadow-lg overflow-hidden flex-shrink-0">
              {/* Video Title Section */}
              <div className="p-4" style={{ backgroundColor: "var(--dbl-3)" }}>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--gr-2)" }}
                >
                  {problemDetails?.title || currentProblem.title}
                </h3>
              </div>
              {/* Video Content Section */}
              <div className="" style={{ backgroundColor: "var(--dbl-5)" }}>
                <div className="flex justify-center items-center">
                  <ReactPlayer
                    muted={false}
                    playing={false}
                    controls={true}
                    playbackRate={2}
                    src={`http://localhost:8000/media/v-${currentProblem.id}.mp4`}
                    width="auto"
                    height="312px"
                  />
                </div>
              </div>
            </div>
            {/* Exercise & Code Editor Combined */}
            <Card className="exercise/editor" tabs={codeTabs}/>
          </div>

          {/* Column 3: Test Cases and Output */}
          <div
            className="rounded-lg shadow-lg p-6 flex flex-col overflow-y-auto"
            style={{ backgroundColor: "var(--dbl-2)" }}
          >
            {/* Output Display */}
            {output && (
              <div className="mb-6 flex-shrink-0">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Console Output:
                </h4>
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
                onAllTestsPassed={handleAllTestsPassed}
              />
            </div>
          </div>
        </div>

        {/* Victory Modal */}
        {showVictoryModal && (
          <div
            className="victory-modal-overlay"
            onClick={() => setShowVictoryModal(false)}
          >
            <div className="victory-modal" onClick={(e) => e.stopPropagation()}>
              <div className="victory-content">
                <h2>Right on! 👍</h2>
                <p>All test cases passed successfully!</p>
                <p>
                  You{"'"}ve completed:{" "}
                  {problemDetails?.title || currentProblem.title}
                </p>

                <button
                  className="victory-close-btn"
                  onClick={() => setShowVictoryModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
