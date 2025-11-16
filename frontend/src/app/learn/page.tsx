"use client";

import "../templates.css";
import ReactPlayer from "react-player";
import { Editor } from "@monaco-editor/react";
import { useRef, useState, useEffect, useMemo } from "react";
import Card from "../templates/card/card";
import TestCasesPanel from "./testCasesPanel";
import ProblemMenu from "./problemMenu";
import { NotesCard } from "./NotesCard";

import { Problem, ProblemCompletion } from "@/lib/types";
import { editor as MonacoEditor } from "monaco-editor";
import {
  getProblemById,
  getUserProblemById,
  saveNotes,
  updateUserProblemCompletion,
  calculateProblemCompletion,
} from "@/lib/supabase/problems";
import { useAuth } from "@/lib/contexts/AuthContext";
import { formatCodeForEditor } from "@/lib/utils";
import 'shepherd.js/dist/css/shepherd.css';

export default function ProblemsPage() {
  const { user } = useAuth();
  const [output, setOutput] = useState("");
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const [drawerToggle, setDrawerToggle] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<Problem>({
    id: 1,
    category_id: 0,
    problem_id: "default",
    title: "Hello World",
    description: "Write a program that prints 'Hello, World!' to the console.",
    difficulty: "easy",
    order: 1,
    is_locked_by_default: false,
    points_reward: 0,
    method_stub: 'print("Hello, World!")',
    solution: null,
    test_cases: [],
    input_args: [],
    tools: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [problemDetails, setProblemDetails] = useState<Problem>({
    id: 1,
    category_id: 0,
    problem_id: "intro-1",
    title: "Hello World",
    description: "Write a program that prints 'Hello, World!' to the console.",
    difficulty: "easy",
    order: 1,
    is_locked_by_default: false,
    points_reward: 0,
    method_stub: 'print("Hello, World!")',
    solution: null,
    test_cases: [],
    input_args: [],
    tools: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [currProblemCompletion, setCurrentProblemCompletion] =
    useState<ProblemCompletion>({
      id: 0,
      user_id: "",
      problem_id: "",
      title: "",
      category_id: "",
      is_unlocked: false,
      is_completed: false,
      is_attempted: false,
      completion_date: "",
      first_attempt_date: "",
      notes: "",
      user_solution: "",
      attempts_count: 0,
      hints_used: 0,
      time_spent_seconds: 0,
      test_cases_passed: 0,
      total_test_cases: 0,
      points_earned: 0,
      efficiency_score: 0,
      created_at: "",
      updated_at: "",
    });
  const [testCases, setTestCases] = useState([]);
  const [refreshKey, setRefreshKey] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  function toggleRefresh() {
    setRefreshKey(!refreshKey);
  }

  async function handleAllTestsPassed() {
    setShowVictoryModal(true);
    await updateUserProblemCompletion(
      currProblemCompletion.id,
      currentProblem.problem_id,
      currProblemCompletion.category_id,
      testCases.length,
      editorRef.current?.getValue()
    );
    toggleRefresh();
  }

  useEffect(() => {
    async function loadCompletion() {
      const completion = await calculateProblemCompletion();
      setCompletionPercentage(completion);
    }

    loadCompletion();
  }, [refreshKey, completionPercentage]);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    // Set initial code based on current problem
    editor.setValue('# Write your solution here\nprint("Hello, World!")');
  }

  const handleProblemSelect = async (problem: Problem) => {
    setCurrentProblem(problem);

    try {
      const data = await getProblemById(problem.problem_id);
      setProblemDetails(data);

      const user_data = await getUserProblemById(problem.problem_id);
      setCurrentProblemCompletion(user_data);
      if(editorRef.current && user_data.user_solution != "") {
        editorRef.current.setValue(formatCodeForEditor(user_data.user_solution));
      }
      else if (editorRef.current && data.method_stub) {
        editorRef.current.setValue(formatCodeForEditor(data.method_stub));
      } else {
        console.error("Failed to fetch problem details");
        // Fallback to default starter code
        if (editorRef.current) {
          const starterCode = getStarterCode(currentProblem.id);
          editorRef.current.setValue(starterCode);
        }
        setTestCases([]);
      }

      let parsedTestCases = [];
      try {
        parsedTestCases =
          typeof data.test_cases === "string"
            ? JSON.parse(data.test_cases)
            : data.test_cases || [];
      } catch (e) {
        console.error("Error parsing test cases:", e);
        parsedTestCases = [];
      }
      setTestCases(parsedTestCases);
    } catch (error) {
      console.error(error);
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

  const codeTabs = useMemo(
    () => ({
      editor: {
        label: "Editor",
        content: (
          <div className="editor flex-1 flex flex-col h-full rounded-lg shadow-lg overflow-hidden">

            <div className="p-4" style={{ backgroundColor: "var(--dbl-3)" }}>
              <div className="mb-2">
                <h2
                  className="text-xl font-bold"
                  style={{ color: "var(--gr-2)" }}
                >
                  Exercise {currentProblem.problem_id}:{" "}
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

            <div className="flex-1 min-h-0">
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
                  scrollBeyondLastLine: true,
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
            notes={currProblemCompletion.notes}
            onChange={(value) =>
              setCurrentProblemCompletion((prev) => ({
                ...prev,
                notes: value,
              }))
            }
            onBlur={async () => {
              const user_id =
                typeof user === "string"
                  ? user
                  : user?.id ?? user?.user?.id ?? "";

              if (!user_id) throw new Error("Missing user_id");

              if (currProblemCompletion.problem_id) {
                await saveNotes({
                  user_id: user_id,
                  problem_id: String(currProblemCompletion.problem_id),
                  notes: currProblemCompletion.notes || "",
                });
              }
            }}
          />
        ),
      },
    }),
    [currentProblem, problemDetails, currProblemCompletion]
  );

  return (
    <>
      <div className="Page h-screen overflow-hidden bg-background/80">
        {/* Main 3-Column Grid with custom column widths */}
        <div className="grid grid-cols-[1fr_3fr_1fr] gap-6 h-full p-6 mx-auto">
          {/* Column 1: Problem Menu with vertical progress bar */}
          <div className="problems rounded-lg shadow-lg overflow-hidden flex flex-col">
            {/* Navigation Menu Header */}
            <div className="p-4" style={{ backgroundColor: "var(--dbl-3)" }}>
              <h2
                className="text-lg font-bold text-center "
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
            <div className="rounded-lg shadow-lg overflow-hidden flex-shrink-0 matrix-border hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
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
                <div className="videos flex justify-center items-center">
                  <ReactPlayer
                    muted={false}
                    playing={false}
                    controls={true}
                    playbackRate={2}
                    src={`http://localhost:8000/media/v-${currentProblem.id}.mp4`}
                    width="auto"
                    height="250px"
                  />
                </div>
              </div>
            </div>
            {/* Exercise & Code Editor Combined */}
            <Card
              className="notes exercise/editor flex flex-col h-full matrix-border hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
              tabs={codeTabs}
            />
          </div>

          {/* Column 3: Test Cases and Output */}
          <div
            className="tests rounded-lg shadow-lg p-6 flex flex-col overflow-y-auto"
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
                problemId={currentProblem.problem_id}
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
