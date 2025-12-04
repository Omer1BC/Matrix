"use client";

import "../templates.css";
import ReactPlayer from "react-player";
import { Editor } from "@monaco-editor/react";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import Card from "../templates/card/card";
import TestCasesPanel from "./testCasesPanel";
import ProblemMenu from "./problemMenu";
import ReferencesPanel from "@/components/ReferencesPanel";
import { useSolve } from "@/lib/hooks/useSolve";
import { NotesCard } from "./NotesCard";
import { Problem, ProblemCompletion } from "@/lib/types";
import { editor, editor as MonacoEditor } from "monaco-editor";
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

export default function LearnPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [output, setOutput] = useState("");

  // const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
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
    [problemCompletionList, problemList]
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
  }, [solutionLanguage]);

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

  // useEffect(() => {
  //   if (!editorRef.current) return;

  //   const completion = problemCompletionList[currentIndex];
  //   const problem = problemList[currentIndex];
  //   if (!completion || !problem) return;

  //   const currentValue = editorRef.current.getValue();

  //   // Only update editor if empty or switching to a new problem
  //   const codeToSet =
  //     completion.user_solution?.length > 0
  //       ? completion.user_solution
  //       : problem.method_stub;

  //   if (currentValue.trim() === "" || currentValue !== codeToSet) {
  //     editorRef.current.setValue(formatCodeForEditor(codeToSet));
  //   }
  // }, [currentIndex, problemCompletionList, problemList]);

  // const handleNextProblem = useCallback(() => {
  //   let nextIndex = currentIndex + 1;

  //   if (nextIndex >= problemIds.length) {
  //     nextIndex = nextIndex % problemIds.length;
  //   }

  //   setCurrentIndex(nextIndex);
  //   const nextProblemCompletion = problemCompletionList[nextIndex];
  //   const nextProblem = problemList[nextIndex];
  //   if (nextProblemCompletion && nextProblem) {
  //     setCurrentProblemCompletion(nextProblemCompletion);
  //     setCurrentProblem(nextProblem);
  //     setProblemDetails(nextProblem);
  //   }
  // }, [currentIndex, problemIds.length, problemCompletionList, problemList]);

  // const handlePrevProblem = useCallback(() => {
  //   if (currentIndex <= 0) return;

  //   const prevIndex = currentIndex - 1;

  //   setCurrentIndex(prevIndex);
  //   const prevProblemCompetion = problemCompletionList[prevIndex];
  //   const prevProblem = problemList[prevIndex];
  //   if (prevProblemCompetion && prevProblem) {
  //     setCurrentProblemCompletion(prevProblemCompetion);
  //     setCurrentProblem(prevProblem);
  //     setProblemDetails(prevProblem);
  //   }
  // }, [currentIndex, problemCompletionList, problemList]);

  const handleViewHint = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    if (!model) return;

    let code = "";
    for (let i = 1; i <= model.getLineCount(); i++) {
      code += `${i} | ${model.getLineContent(i)}\n`;
    }

    const data = await neoAnnotate(code);
    setNeoResponse(data?.expalantions_of_hint || "");
  }, [neoAnnotate, setNeoResponse, editorRef]);

  const toggleRefresh = useCallback(() => {
    setRefreshKey((prev) => !prev);
  }, []);

  const handleAllTestsPassed = useCallback(async () => {
    setShowVictoryModal(true);
    await updateUserProblemCompletion(
      currProblemCompletion.id,
      currentProblem.problem_id,
      currProblemCompletion.category_id,
      testCases.length,
      editorRef.current?.getValue()
    );
    setProblemCompletionList((prev) => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        user_solution: editorRef.current?.getValue(),
      },
    }));
    toggleRefresh();
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
    [currProblemCompletion?.user_solution, currentProblem?.method_stub]
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
    [currentIndex, problemList, solutionLanguage]
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
    setOutput(""); // Clear previous output
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

              if (!user_id) throw new Error("Missing user_id");

              if (currProblemCompletion.problem_id) {
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
              onViewHint={handleViewHint}
            />
          </div>
        ),
      },
    }),
    [
      currentProblem.problem_id,
      editorRef,
      handleAllTestsPassed,
      neoAskSelection,
      neoLoading,
      neoResponse,
      handleViewHint,
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
        <div className="Page h-screen overflow-hidden bg-background/80 pl-5">
          <button
            onClick={() => setShowMenu(true)}
            className="problembutton absolute left-0 top-1/2 -translate-y-1/2 p-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-lg text-xl font-bold glow-text cursor-pointer "
          >
            ☰
          </button>
          {/* Main 3-Column Grid with custom column widths */}
          <div className="flex flex-col md:flex-row gap-6 w-full h-full p-6">
            {/* Column 1: Problem Menu with vertical progress bar */}

            {/* Column 2: Video, Exercise & Editor */}
            <div className="flex flex-col gap-4 flex-1 min-h-0 w-full">
              {/* Video Player */}
              <div className="rounded-lg shadow-lg overflow-hidden flex-shrink-0 matrix-border hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                {/* Video Title Section */}
                <div
                  className="p-4"
                  style={{ backgroundColor: "var(--background)" }}
                >
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: "var(--gr-2)" }}
                  >
                    {problemDetails?.title || currentProblem.title}
                  </h3>
                </div>
                <hr className="my-4 matrix-border" />
                {/* Video Content Section */}
                <div
                  className=""
                  style={{ backgroundColor: "var(--background)" }}
                >
                  <div className="videos flex justify-center items-center">
                    <ReactPlayer
                      muted={false}
                      playing={false}
                      controls={true}
                      playbackRate={1}
                      // src={`${process.env.NEXT_PUBLIC_API_URL}media/v-${currentProblem.id}.mp4`}
                      src={`/${currentProblem?.problem_id}.mp4`} //temporary until final videos are done
                      width="50%"
                      height="350px"
                      style={{ objectFit: "fill" }}
                    />
                  </div>
                </div>
              </div>
              {/* Exercise & Code Editor Combined */}
              <Card
                className="editor notes exercise/editor flex flex-col h-full overflow-auto matrix-border hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                tabs={codeTabs}
              />
            </div>

            {/* Column 3: Test Cases and Output */}
            <div
              className="tests rounded-lg shadow-lg flex flex-col min-h-0 md:w-1/6"
              style={{ backgroundColor: "bg-[var(--background)]" }}
            >
              <Card
                className="flex flex-col h-full min-h-0 overflow-y-auto matrix-border hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
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
