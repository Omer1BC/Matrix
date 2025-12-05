"use client";

import "../templates.css";
import ReactPlayer from "react-player";
import { Editor } from "@monaco-editor/react";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import Card from "./Card";
import TestCasesPanel from "./testCasesPanel";
import ProblemMenu from "./problemMenu";
import ReferencesPanel from "@/components/ReferencesPanel";
import { useSolve } from "@/lib/hooks/useSolve";
import { NotesCard } from "./NotesCard";
import { Problem, ProblemCompletion } from "@/lib/types";
import { editor as MonacoEditor } from "monaco-editor";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  getProblemById,
  getUserProblemById,
  saveNotes,
  updateUserProblemCompletion,
  calculateProblemCompletion,
  getAllUserProblemsAsJson,
  getAllProblems,
} from "@/lib/supabase/problems";
import { syncProblemCompletions } from "@/lib/supabase/auth";
import { useAuth } from "@/lib/contexts/AuthContext";
import { formatCodeForEditor } from "@/lib/utils";
import "shepherd.js/dist/css/shepherd.css";
import NeoIcon from "@/components/NeoIcon";
import { toast } from "sonner";

export default function LearnPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [currentProblem, setCurrentProblem] = useState<Problem>({
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
    java_solution: null,
    test_cases: [],
    input_args: [],
    tools: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    type: "",
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
    java_solution: null,
    test_cases: [],
    input_args: [],
    tools: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    type: "",
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
      order: 0,
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
      type: "",
    });
  const [testCases, setTestCases] = useState([]);
  const [refreshKey, setRefreshKey] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  const [showMenu, setShowMenu] = useState(false);

  const {
    editorRef,
    monacoRef,
    loading: neoLoading,
    response: neoResponse,
    setResponse: setNeoResponse,
    annotate: neoAnnotate,

    askSelection: neoAskSelection,
  } = useSolve(currentProblem?.problem_id || "intro-1");

  const [pageLoading, setPageLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [problemCompletionList, setProblemCompletionList] = useState<
    Record<string, ProblemCompletion>
  >({});

  const [problemList, setProblemList] = useState<Problem[]>([]);

  const [problemIds, setProblemIds] = useState<string[]>([]);

  const [solutionLanguage, setSolutionLanguage] = useState("Python");

  const solutionEditorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(
    null
  );

  const zoom = 0.9;

  const getMainEditorCode = (completion: any, problem: any) => {
    if (!completion && !problem) return "# Write your solution here\n";

    const userCode = completion?.user_solution?.trim();
    if (userCode && userCode.length > 0) return userCode;

    const stub = problem?.method_stub?.trim();
    if (stub && stub.length > 0) return stub;

    return "# Write your solution here\n";
  };

  const navigateToProblem = useCallback(
    (newIndex: number) => {
      const completion = problemCompletionList[newIndex];
      const problem = problemList[newIndex];
      if (!completion || !problem) return;

      setCurrentProblemCompletion(completion);
      setCurrentProblem(problem);
      setProblemDetails(problem);

      // Main editor
      if (editorRef.current) {
        const codeToSet = getMainEditorCode(completion, problem);
        editorRef.current.setValue(formatCodeForEditor(codeToSet));
      }

      // Solution editor
      if (solutionEditorRef.current && monacoRef.current) {
        import("monaco-editor").then((monaco) => {
          const model = solutionEditorRef.current!.getModel();
          if (model) {
            monaco.editor.setModelLanguage(
              model,
              solutionLanguage.toLowerCase()
            );
          }

          if (solutionLanguage === "Python" && problem.solution) {
            solutionEditorRef.current!.setValue(problem.solution);
          } else if (solutionLanguage === "Java" && problem.java_solution) {
            solutionEditorRef.current!.setValue(problem.java_solution);
          } else {
            solutionEditorRef.current!.setValue("// No solution available");
          }
        });
      }
    },
    [editorRef, monacoRef, problemCompletionList, problemList, solutionLanguage]
  );

  const handleNextProblem = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % problemIds.length;
      navigateToProblem(nextIndex);
      return nextIndex;
    });
  }, [problemIds.length, navigateToProblem]);

  const handlePrevProblem = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex <= 0) return 0;
      const prev = prevIndex - 1;
      navigateToProblem(prev);
      return prev;
    });
  }, [navigateToProblem]);

  useEffect(() => {
    const setMenu = () => {
      setShowMenu(!showMenu);
    };

    window.addEventListener("switchToProblems", setMenu);
    window.addEventListener("switchToRegular", setMenu);

    return () => {
      window.removeEventListener("switchToProblems", setMenu);
      window.removeEventListener("switchToRegular", setMenu);
    };
  }, [showMenu]);

  useEffect(() => {
    if (solutionEditorRef.current && monacoRef.current) {
      import("monaco-editor").then((monaco) => {
        const model = solutionEditorRef.current!.getModel();
        if (model) {
          monaco.editor.setModelLanguage(model, solutionLanguage.toLowerCase());
        }
        // Update solution based on language and current problem
        const currProblem = problemList[currentIndex];
        if (solutionLanguage === "Python" && currProblem.solution) {
          solutionEditorRef.current!.setValue(currProblem.solution);
        } else if (solutionLanguage === "Java" && currProblem.java_solution) {
          solutionEditorRef.current!.setValue(currProblem.java_solution);
        } else {
          // Fallback if no solution exists
          solutionEditorRef.current!.setValue("// No solution available");
        }
      });
    }
  }, [currentIndex, monacoRef, problemList, solutionLanguage]);

  useEffect(() => {
    const getProblems = async () => {
      try {
        await syncProblemCompletions();
        const data = await getAllUserProblemsAsJson();
        const problems = await getAllProblems();

        setCurrentProblemCompletion(data[0]);
        setProblemCompletionList(data);
        setCurrentProblem(problems[0]);
        setProblemDetails(problems[0]);
        setCurrentIndex(0);

        const ids = Object.values(data).map((row: any) => row.problem_id); // keep original order
        setProblemIds(ids);
        setProblemList(problems);
      } catch (err) {
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };
    getProblems();
  }, []);

  const toggleRefresh = useCallback(() => {
    setRefreshKey((prev) => !prev);
  }, []);

  const handleAllTestsPassed = useCallback(async () => {
    // // console.log("🎉 All tests passed! Updating completion...");
    // console.log("Problem ID:", currentProblem.problem_id);
    // console.log("Completion ID:", currProblemCompletion.id);

    setShowVictoryModal(true);

    try {
      await updateUserProblemCompletion(
        currProblemCompletion.id,
        currentProblem.problem_id,
        currProblemCompletion.category_id,
        testCases.length,
        editorRef.current?.getValue()
      );
      // console.log("✅ Problem marked as complete!");

      setProblemCompletionList((prev) => ({
        ...prev,
        [currentIndex]: {
          ...prev[currentIndex],
          user_solution: editorRef.current?.getValue(),
          is_completed: true,
        },
      }));
      toggleRefresh();
    } catch (error) {
      console.error("❌ Failed to update completion:", error);
    }
  }, [
    currProblemCompletion.id,
    currProblemCompletion.category_id,
    currentProblem.problem_id,
    testCases.length,
    editorRef,
    toggleRefresh,
    currentIndex,
  ]);

  useEffect(() => {
    async function loadCompletion() {
      const completion = await calculateProblemCompletion();
      setCompletionPercentage(completion);
    }

    loadCompletion();
  }, [refreshKey]);

  const handleEditorDidMount = useCallback(
    (editor: MonacoEditor.IStandaloneCodeEditor, monaco: any) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      if (currProblemCompletion?.user_solution) {
        editor.setValue(
          formatCodeForEditor(currProblemCompletion.user_solution)
        );
      } else if (currentProblem?.method_stub) {
        editor.setValue(formatCodeForEditor(currentProblem.method_stub));
      } else {
        editor.setValue("# Write your solution here\n");
      }
    },
    [
      currProblemCompletion.user_solution,
      currentProblem.method_stub,
      editorRef,
      monacoRef,
    ]
  );

  const handleSolutionsEditorDidMount = useCallback(
    (editor: MonacoEditor.IStandaloneCodeEditor, monaco: any) => {
      solutionEditorRef.current = editor;
      monacoRef.current = monaco;

      import("monaco-editor").then((monaco) => {
        const model = solutionEditorRef.current!.getModel();
        if (model) {
          monaco.editor.setModelLanguage(model, "python");
        }

        if (problemList[currentIndex].solution) {
          solutionEditorRef.current!.setValue(
            problemList[currentIndex].solution
          );
        }
      });
    },
    [currentIndex, monacoRef, problemList]
  );

  const handleProblemSelect = async (problem: ProblemCompletion) => {
    setCurrentProblem(problemList[problem.order]);
    setCurrentIndex(problem.order);
    try {
      const data = await getProblemById(problem.problem_id);
      setProblemDetails(data);

      const user_data = await getUserProblemById(problem.problem_id);
      setCurrentProblemCompletion(user_data);
      if (editorRef.current && user_data.user_solution !== "") {
        editorRef.current.setValue(
          formatCodeForEditor(user_data.user_solution)
        );
      } else if (
        editorRef.current &&
        data.method_stub &&
        editorRef.current.getValue().trim() === ""
      ) {
        editorRef.current.setValue(formatCodeForEditor(data.method_stub));
      } else {
        // console.error("Failed to fetch problem details");
        // Fallback to default starter code
        if (editorRef.current) {
          editorRef.current.setValue(
            formatCodeForEditor(problemList[problem.order].method_stub)
          );
        }
        setTestCases([]);
      }

      if (solutionEditorRef.current) {
        import("monaco-editor").then((monaco) => {
          const model = solutionEditorRef.current!.getModel();
          if (model) {
            monaco.editor.setModelLanguage(
              model,
              solutionLanguage.toLowerCase()
            );
          }

          if (solutionLanguage === "Python") {
            solutionEditorRef.current!.setValue(
              problemList[problem.order].solution ?? "// No solution available"
            );
          } else if (solutionLanguage === "Java") {
            solutionEditorRef.current!.setValue(
              problemList[problem.order].java_solution ??
                "// No solution available"
            );
          } else {
            solutionEditorRef.current!.setValue("// No solution available");
          }
        });
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
  };

  const isPrevDisabled = useMemo(() => {
    return currentIndex === 0;
  }, [currentIndex]);

  const codeTabs = useMemo(
    () => ({
      editor: {
        label: "Editor",
        content: (
          <div className="flex-1 flex flex-col h-full rounded-lg shadow-lg overflow-hidden">
            <div
              className="p-4"
              style={{ backgroundColor: "var(--background)" }}
            >
              <div className="mb-2">
                <h2
                  className="text-xl font-bold"
                  style={{ color: "var(--gr-2)" }}
                >
                  Exercise: {problemDetails?.title || currentProblem.title}
                </h2>
              </div>
              <div
                className="text-sm whitespace-pre-wrap"
                style={{ color: "var(--gr-2)" }}
              >
                {problemDetails?.description ||
                  currentProblem?.title ||
                  "No description available."}
              </div>
            </div>

            <div className="relative flex-1 min-h-0">
              {/* Editor fills the container */}
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

              {/* Button overlay */}
              <div className="absolute top-4 right-5 z-50">
                <Button
                  onClick={handlePrevProblem}
                  disabled={isPrevDisabled}
                  className="px-6 py-4 glow-text"
                  variant={undefined}
                  size="lg"
                >
                  ←
                </Button>
                {currentIndex === problemIds.length - 1 ? (
                  <Button
                    // disabled={isNextDisabled} UNCOMMENT IF UNLOCKING/LOCKING FEATURE IS REQUIRED
                    onClick={() => {
                      router.push("/solve");
                    }}
                    className="px-6 py-4 glow-text"
                    variant={undefined}
                    size="lg"
                  >
                    To Solve page
                  </Button>
                ) : (
                  <Button
                    // disabled={isNextDisabled} UNCOMMENT IF UNLOCKING/LOCKING FEATURE IS REQUIRED
                    onClick={handleNextProblem}
                    className="px-6 py-4 glow-text"
                    variant={undefined}
                    size="lg"
                  >
                    →
                  </Button>
                )}
              </div>
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

              if (!user_id) {
                toast.error("Please log in to save notes");
                return;
              }

              if (currProblemCompletion.problem_id) {
                try {
                  await saveNotes({
                    user_id: user_id,
                    problem_id: String(currProblemCompletion.problem_id),
                    notes: currProblemCompletion.notes || "",
                  });
                  setProblemCompletionList((prev) => ({
                    ...prev,
                    [currentIndex]: {
                      ...prev[currentIndex],
                      notes: currProblemCompletion.notes || "",
                    },
                  }));
                  toast.success("Notes saved successfully");
                } catch (error) {
                  console.error("Failed to save notes:", error);
                  const errorMessage =
                    error instanceof Error
                      ? error.message
                      : "Failed to save notes";
                  toast.error(errorMessage);
                }
              }
            }}
          />
        ),
      },
      solutions: {
        label: "Solutions",
        content: (
          <div className="flex-1 flex flex-col h-full rounded-lg shadow-lg overflow-hidden">
            <div className="relative flex-1 min-h-0">
              <Editor
                height="100%"
                width="100%"
                language={solutionLanguage}
                theme="vs-dark"
                onMount={handleSolutionsEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: true,
                  automaticLayout: true,
                  readOnly: true,
                }}
              />
              <div className="absolute top-4 right-10 z-50 matrix-border text-[var(--gr-2)]">
                <select
                  onChange={(e) => setSolutionLanguage(e.target.value)}
                  defaultValue="Python"
                  style={{
                    border: "none",
                    outline: "none",
                  }}
                >
                  <option className="text-black" value="Python">
                    Python
                  </option>
                  <option className="text-black" value="Java">
                    Java
                  </option>
                </select>
              </div>
            </div>
          </div>
        ),
      },
    }),
    [
      currentProblem.title,
      problemDetails?.title,
      problemDetails?.description,
      currProblemCompletion.notes,
      currProblemCompletion.problem_id,
      user,
      solutionLanguage,
      currentIndex,
      handleEditorDidMount,
      handleSolutionsEditorDidMount,
      handleNextProblem,
      handlePrevProblem,
      isPrevDisabled,
      problemIds.length,
      router,
    ]
  );

  const testTabs = useMemo(
    () => ({
      tests: {
        label: "Tests",
        content: (
          <div className="min-h-0 flex">
            <TestCasesPanel
              key={problemList[currentIndex]?.problem_id ?? "intro-1"}
              problemId={problemList[currentIndex]?.problem_id ?? "intro-1"}
              editorRef={editorRef}
              onAllTestsPassed={handleAllTestsPassed}
            />
          </div>
        ),
      },
      neo: {
        label: (
          <div className="flex items-center gap-1.5">
            <NeoIcon width={18} height={18} />
            <span>Neo</span>
          </div>
        ),
        content: (
          <div className="flex flex-col h-full min-h-0">
            <ReferencesPanel
              loading={neoLoading}
              response={neoResponse}
              onNextThread={(input) => neoAskSelection(input)}
            />
          </div>
        ),
      },
    }),
    [
      problemList,
      currentIndex,
      editorRef,
      handleAllTestsPassed,
      neoLoading,
      neoResponse,
      neoAskSelection,
    ]
  );

  if (
    pageLoading ||
    !currentProblem ||
    !currProblemCompletion ||
    !problemDetails
  ) {
    return (
      <div className="Page h-screen flex items-center justify-center bg-background/80">
        <p className="text-lg text-[#7dff7d]">Loading problems...</p>
      </div>
    );
  } else {
    return (
      <>
        <div
          className="Page origin-top-left w-screen h-screen overflow-hidden h-screen overflow-hidden bg-background/80 pl-2"
          style={{
            transform: `scale(${zoom})`,
            width: `${100 / zoom}%`,
            height: `${100/ zoom}%`,
          }}
        >
          {/* Main 3-Column Grid with custom column widths */}
          <div className="grid grid-cols-[auto_3fr_1fr] gap-4 h-full">
            {/* Left: Menu button */}
            <div className="flex justify-start items-center">
              <button
                onClick={() => setShowMenu(true)}
                className="problembutton p-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-lg text-xl font-bold glow-text cursor-pointer"
              >
                ☰
              </button>
            </div>

            {/* Middle: Video + Editor */}
            <div className="flex flex-col gap-4 h-full">
              {/* Video */}
              <div className="rounded-lg shadow-lg overflow-hidden matrix-border h-[350px] md:h-[35vh] lg:h-[40vh]">
                <ReactPlayer
                  muted={false}
                  playing={false}
                  controls
                  src={`/${currentProblem?.problem_id}.mp4`}
                  width="100%"
                  height="100%"
                  style={{ objectFit: "contain" }}
                />
              </div>

              {/* Editor */}
              <div className="rounded-lg shadow-lg overflow-hidden matrix-border flex-1">
                <Card
                  className="editor notes exercise/editor flex flex-col h-full overflow-auto"
                  tabs={codeTabs}
                />
              </div>
            </div>

            {/* Right: Test Cases */}
            <div className="rounded-lg shadow-lg overflow-auto matrix-border">
              <Card
                className="flex flex-col h-full overflow-y-auto"
                tabs={testTabs}
              />
            </div>
          </div>

          {/* Slide-in Menu Drawer */}
          <div
            className={` fixed inset-0 z-[150] transition-opacity ${
              showMenu
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setShowMenu(false)}
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            <div
              className={`fixed left-0 top-0 bottom-0 w-100 shadow-xl transform transition-transform duration-300
              ${showMenu ? "translate-x-0" : "-translate-x-full"}`}
              style={{ backgroundColor: "var(--background)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* MENU CONTENT MOVED HERE */}
              <div className="problemList rounded-lg shadow-lg flex flex-col h-full overflow-hidden matrix-border">
                {/* Navigation Menu Header */}
                <div className="p-4" style={{ backgroundColor: "#000000ff" }}>
                  <h2
                    className="text-lg font-bold text-center"
                    style={{ color: "var(--gr-2)" }}
                  >
                    Menu
                  </h2>
                </div>
                <hr className="my-4 matrix-border" />
                {/* Problem Menu with Progress Bar */}
                <div
                  className="relative p-4 flex-1 min-h-0 flex"
                  style={{ backgroundColor: "#000000ff" }}
                >
                  {/* Progress Bar */}
                  <div
                    className="relative w-2 mr-4 rounded-full"
                    style={{ backgroundColor: "var(--dbl-4)" }}
                  >
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
                    className="flex-1 min-h-0 overflow-y-auto"
                    style={{ backgroundColor: "#000000ff" }}
                  >
                    <ProblemMenu
                      onProblemSelect={handleProblemSelect}
                      refreshKey={refreshKey}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Victory Modal */}
          {showVictoryModal && (
            <div
              className="victory-modal-overlay"
              onClick={() => setShowVictoryModal(false)}
            >
              <div
                className="victory-modal"
                onClick={(e) => e.stopPropagation()}
              >
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
}
