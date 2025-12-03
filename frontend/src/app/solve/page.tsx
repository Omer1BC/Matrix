"use client";
import QuestionPanel from "@/components/QuestionPanel";
import EditorPanel from "@/components/EditorPanel";
import NeoIcon from "@/components/NeoIcon";
import ReferencesPanel from "@/components/ReferencesPanel";
import TabPanel from "@/components/TabPanel";
import Tools from "@/components/Tools";
import ValidationPanel from "@/components/ValidationPanel";
import { useSolve } from "@/lib/hooks/useSolve";
import { useTimer } from "@/lib/hooks/useTimer";
import { useCallback, useMemo, useState, useEffect } from "react";
import { AnnotationsProvider } from "@/lib/contexts/AnnotationsContext";
import { getAnimationUrl } from "@/lib/api";
import AnimationPlayer from "@/components/AnimationPlayer";
import AnimationInput from "@/components/AnimationInput";
import Notes from "./Notes";
import { formatCodeForEditor } from "@/lib/utils";
import "shepherd.js/dist/css/shepherd.css";

export default function SolvePage() {
  const problemId = "final-prob-1";
  const {
    editorRef,
    monacoRef,
    details,
    detailsLoading,
    tools,
    loading,
    response,
    setResponse,
    annotate,
    annotateErrors,
    askSelection,
    user,
  } = useSolve(problemId);

  const [showHints, setShowHints] = useState(true);

  const [animUrl, setAnimUrl] = useState<string | null>(null);
  const [animToolName, setAnimToolName] = useState<string | null>(null);
  const [animLoading, setAnimLoading] = useState(false);

  const questionDefaultKey = animToolName ? "animation" : "question";
  const validationDefaultKey = animToolName ? "animation-args" : "test";
  const [questionPanelKey, setQuestionPanelKey] = useState(0);
  const [validationPanelKey, setValidationPanelKey] = useState(0);
  const [activeCodeTab, setActiveCodeTab] = useState("editor");

  const timer = useTimer();

  useEffect(() => {
    const setTools = () => {
      setActiveCodeTab("tools"); // switch to Tools tab
    };

    const setNotes = () => {
      setActiveCodeTab("Notes");
    };

    window.addEventListener("switchToTools", setTools);
    window.addEventListener("switchToNotes", setNotes);

    return () => {
      window.removeEventListener("switchToTools", setTools);
      window.removeEventListener("switchToNotes", setNotes);
    };
  }, []);

  const addToolCode = useCallback(
    (snippet?: string) => {
      if (!snippet || !editorRef.current || !monacoRef.current) return;
      const editor = editorRef.current;
      const current = editor.getValue();
      editor.setValue(formatCodeForEditor(`'''\n${snippet}\n'''\n${current}`));
    },
    [editorRef, monacoRef]
  );

  const askAboutTool = useCallback(
    (name: string) => {
      const code = editorRef.current?.getValue() ?? "";

      askSelection(
        `Explain how to use the tool "${name}" with my current code. If useful, show a minimal example.\n\n` +
          `Current code:\n${code}`
      );
    },
    [askSelection, editorRef]
  );

  const openAnimationForTool = useCallback(
    async (name: string) => {
      setAnimToolName(name);
      setAnimLoading(true);

      const schema = (details as any)?.tools?.[name]?.args ?? {};
      const defaults = Object.fromEntries(
        Object.entries(schema).map(([k, v]: any) => [k, v?.default_value ?? ""])
      );

      try {
        const url = await getAnimationUrl({ name, args: defaults });
        setAnimUrl(url);
      } finally {
        setAnimLoading(false);
      }

      setQuestionPanelKey((k) => k + 1);
      setValidationPanelKey((k) => k + 1);
    },
    [details]
  );

  const openAnimationForTest = useCallback(async (testKey: string) => {
    const numKey = Number(testKey);
    const animName = `BST Test ${
      Number.isFinite(numKey) ? numKey + 1 : testKey
    }`;

    setAnimToolName(animName);
    setAnimLoading(true);

    try {
      const url = await getAnimationUrl({
        name: "BST",
        args: { case_index: numKey },
      });
      setAnimUrl(url);
    } finally {
      setAnimLoading(false);
    }

    setQuestionPanelKey((k) => k + 1);
  }, []);

  const handleCustomAnimate = useCallback(
    (url: string | null, phase?: "start" | "done" | "error") => {
      if (phase === "start") {
        setAnimToolName("Prompt");
        setAnimLoading(true);
        setAnimUrl(null);
        setQuestionPanelKey((k) => k + 1);
        return;
      }
      if (phase === "error") {
        setAnimLoading(false);
        return;
      }
      // done
      setAnimUrl(url);
      setAnimLoading(false);
    },
    []
  );

  const closeAnimationTab = useCallback(() => {
    const hasValidationTab =
      animToolName && (details as any)?.tools?.[animToolName];

    setAnimToolName(null);
    setAnimUrl(null);
    setAnimLoading(false);
    setQuestionPanelKey((k) => k + 1);
    if (hasValidationTab) setValidationPanelKey((k) => k + 1);
  }, [animToolName, details]);

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.toString().length > 0) {
      askSelection(sel.toString(), "explain");
    }
  }, [askSelection]);

  const questionTabs = useMemo(
    () => ({
      question: {
        label: "Question",
        content: detailsLoading ? (
          <div className="flex items-center justify-center w-full h-full bg-[var(--background)]">
            <p>Loading...</p>
          </div>
        ) : (
          <QuestionPanel
            title={details?.title}
            difficulty={details?.difficulty}
            description={details?.description}
            onMouseUp={handleMouseUp}
          />
        ),
      },
      ...(animToolName && {
        animation: {
          label: `${animToolName}`,
          content: (
            <div className="flex h-full w-full flex-col">
              <div className="mb-3 flex items-center justify-between">
                <button
                  onClick={closeAnimationTab}
                  className="rounded bg-[var(--gr-2)] px-3 py-1 text-[var(--dbl-1)] hover:bg-[var(--gr-1)]"
                >
                  Close
                </button>
              </div>

              <div className="rounded-lg overflow-hidden bg-black min-h-0 flex-1">
                {animLoading ? (
                  <div className="flex h-full items-center justify-center text-[var(--gr-2)]">
                    Loading animation…
                  </div>
                ) : (
                  <AnimationPlayer url={animUrl} />
                )}
              </div>
            </div>
          ),
        },
      }),
    }),
    [
      detailsLoading,
      details?.title,
      details?.difficulty,
      details?.description,
      handleMouseUp,
      animToolName,
      closeAnimationTab,
      animLoading,
      animUrl,
    ]
  );

  const codeTabs = useMemo(
    () => ({
      editor: {
        label: "Editor",
        content: (
          <EditorPanel
            editorRef={editorRef}
            monacoRef={monacoRef}
            showHints={showHints}
            setShowHints={setShowHints}
            onAnnotate={async (code) => annotate(code)}
            timer={timer}
          />
        ),
      },
      tools: {
        label: "Tools",
        content: (
          <Tools
            tools={tools ?? []}
            details={details}
            addToolCode={addToolCode}
            askAboutTool={askAboutTool}
            onOpenAnimation={openAnimationForTool}
            onCustomAnimate={handleCustomAnimate}
            user={user}
          />
        ),
      },
      Notes: {
        label: "Notes",
        content: <Notes />,
      },
    }),
    [
      addToolCode,
      annotate,
      askAboutTool,
      details,
      editorRef,
      monacoRef,
      openAnimationForTool,
      handleCustomAnimate,
      showHints,
      tools,
      timer,
      user,
    ]
  );

  const referencesTabs = useMemo(
    () => ({
      ai: {
        label: (
          <div className="flex items-center gap-1.5">
            <NeoIcon width={18} height={18} />
            <span>Neo</span>
          </div>
        ),
        content: (
          <ReferencesPanel
            loading={loading}
            response={response}
            onNextThread={(input) => askSelection(input)}
          />
        ),
      },
    }),
    [askSelection, loading, response]
  );

  const validationTabs = useMemo(
    () => ({
      test: {
        label: "Tests",
        content: (
          <ValidationPanel
            timer={timer}
            problemId={problemId}
            editorRef={editorRef}
            monacoRef={monacoRef}
            annotateErrors={annotateErrors}
            onOpenTestAnimation={openAnimationForTest}
          />
        ),
      },
      ...(animToolName &&
        (details as any)?.tools?.[animToolName] && {
          "animation-args": {
            label: `Animation Input: ${animToolName}`,
            content: (
              <div className="flex h-full w-full flex-col">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    onClick={closeAnimationTab}
                    className="rounded bg-[var(--gr-2)] px-3 py-1 text-[var(--dbl-1)] hover:bg-[var(--gr-1)]"
                  >
                    Close
                  </button>
                </div>
                <div className="min-h-0 overflow-auto">
                  <AnimationInput
                    name={animToolName}
                    args={(details as any)?.tools?.[animToolName]?.args ?? {}}
                    onUrl={(url) => setAnimUrl(url)}
                  />
                </div>
              </div>
            ),
          },
        }),
    }),
    [
      timer,
      problemId,
      editorRef,
      monacoRef,
      annotateErrors,
      openAnimationForTest,
      animToolName,
      details,
      closeAnimationTab,
    ]
  );

  return (
    <AnnotationsProvider>
      <main className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <div className="grid flex-1 min-h-0 gap-2 p-2 grid-cols-[4fr_5fr] grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
          <TabPanel
            className="question matrix-border hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
            key={`q-${questionPanelKey}`}
            tabs={questionTabs}
            defaultActiveKey={questionDefaultKey}
          />
          <TabPanel
            tabs={codeTabs}
            activeKey={activeCodeTab}
            onTabChange={setActiveCodeTab}
            className="matrix-border hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
          />
          <TabPanel
            tabs={referencesTabs}
            className="chatbox question matrix-border hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
          />
          <TabPanel
            className="tests-solve question matrix-border hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
            key={`v-${validationPanelKey}`}
            tabs={validationTabs}
            defaultActiveKey={validationDefaultKey}
          />
        </div>
      </main>
    </AnnotationsProvider>
  );
}
