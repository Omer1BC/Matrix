"use client";
import QuestionPanel from "@/components/QuestionPanel";
import EditorPanel from "@/components/EditorPanel";
import NeoIcon from "@/components/NeoIcon";
import ReferencesPanel from "@/components/ReferencesPanel";
import TabPanel from "@/components/TabPanel";
import Tools from "@/components/Tools";
import ValidationPanel from "@/components/ValidationPanel";
import { useSolve } from "@/lib/hooks/useSolve";
import { useCallback, useMemo, useState } from "react";
import { AnnotationsProvider } from "@/lib/contexts/AnnotationsContext";

export default function SolvePage() {
  const {
    editorRef,
    monacoRef,
    details,
    tools,
    loading,
    response,
    setResponse,
    annotate,
    annotateErrors,
    askSelection,
  } = useSolve(1); // passing in 1 as the problem id. pass down problemId prop from SolvePage props into this hook

  const [showHints, setShowHints] = useState(true);
  const [output] = useState("");

  const addToolCode = useCallback(
    (snippet?: string) => {
      if (!snippet || !editorRef.current || !monacoRef.current) return;
      const editor = editorRef.current;
      const current = editor.getValue();

      editor.setValue(`'''\n${snippet}\n'''\n${current}`);
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

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.toString().length > 0) {
      askSelection(sel.toString());
    }
  }, [askSelection]);

  const questionTabs = useMemo(
    () => ({
      question: {
        label: "Question",
        content: (
          <QuestionPanel
            title={details?.title}
            difficulty={details?.difficulty}
            description={details?.description}
            onMouseUp={handleMouseUp}
          />
        ),
      },
    }),
    [details, handleMouseUp]
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
          />
        ),
      },
    }),
    [
      addToolCode,
      annotate,
      askAboutTool,
      details,
      editorRef,
      monacoRef,
      showHints,
      tools,
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
            onViewHint={() => {
              const editor = editorRef.current;
              const monaco = monacoRef.current;
              if (!editor || !monaco) return;
              const model = editor.getModel();
              let code = "";
              for (let i = 1; i <= model.getLineCount(); i++) {
                code += `${i} | ${model.getLineContent(i)}\n`;
              }
              annotate(code).then((d) =>
                setResponse(d?.expalantions_of_hint || "")
              );
            }}
          />
        ),
      },
    }),
    [
      annotate,
      askSelection,
      editorRef,
      loading,
      monacoRef,
      response,
      setResponse,
    ]
  );

  const validationTabs = useMemo(
    () => ({
      test: {
        label: "Tests",
        content: (
          <ValidationPanel
            problemId={1}
            editorRef={editorRef}
            monacoRef={monacoRef}
            annotateErrors={annotateErrors}
          />
        ),
      },
    }),
    [annotateErrors, editorRef, monacoRef]
  );

  return (
    <AnnotationsProvider>
      <main className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <div className="grid flex-1 min-h-0 gap-2 p-2 grid-cols-[4fr_5fr] grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
          <TabPanel tabs={questionTabs} />
          <TabPanel tabs={codeTabs} />
          <TabPanel tabs={referencesTabs} />
          <TabPanel tabs={validationTabs} />
        </div>
      </main>
    </AnnotationsProvider>
  );
}
