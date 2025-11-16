"use client";
import { Editor } from "@monaco-editor/react";
import { useCallback, useEffect, useRef } from "react";
import { useTimer } from "@/lib/hooks/useTimer";
import { injectMonacoDecorationStyles } from "@/lib/utils";
import EditorUtilities from "./EditorUtilities";
import { useAnnotationsContext } from "@/lib/contexts/AnnotationsContext";

type EditorPanelProps = {
  editorRef: React.RefObject<any>;
  monacoRef: React.RefObject<any>;
  showHints: boolean;
  setShowHints: (b: boolean) => void;
  onAnnotate: (codeWithLines: string) => Promise<any>;
  onMountExtras?: (editor: any, monaco: any) => void;
};

export default function EditorPanel({
  editorRef,
  monacoRef,
  showHints,
  setShowHints,
  onAnnotate,
  onMountExtras,
}: EditorPanelProps) {
  const { seconds, running, start, stop, reset } = useTimer();
  const { applyHints, clearAll, hideAll, hintWidgetByDeco, errorWidgetByDeco } =
    useAnnotationsContext();

  const showHintsRef = useRef<boolean>(showHints);
  const mouseMoveDisposableRef = useRef<any>(null);

  useEffect(() => {
    showHintsRef.current = showHints;
    const editor = editorRef.current;
    if (!editor) return;
    if (!showHints) {
      if (mouseMoveDisposableRef.current) {
        mouseMoveDisposableRef.current.dispose();
        mouseMoveDisposableRef.current = null;
      }
      hideAll();
    } else if (!mouseMoveDisposableRef.current) {
      mouseMoveDisposableRef.current = editor.onMouseMove((e: any) => {
        if (!showHintsRef.current) return;
        const position = e.target.position;
        if (!position) return;
        const model = editor.getModel();
        const showOrHide = (map: Map<string, any>) => {
          map.forEach((w: any, decoId: string) => {
            const range = model?.getDecorationRange(decoId);
            if (range && range.startLineNumber === position.lineNumber)
              w.showAt(position);
            else w.hide();
          });
        };
        showOrHide(hintWidgetByDeco.current);
        showOrHide(errorWidgetByDeco.current);
      });
    }

    return () => {
      mouseMoveDisposableRef.current?.dispose?.();
      mouseMoveDisposableRef.current = null;
    };
  }, [showHints, editorRef, hintWidgetByDeco, errorWidgetByDeco, hideAll]);

  const handleAnnotate = useCallback(async () => {
    if (!showHintsRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const model = editor.getModel();
    const n = model.getLineCount();
    let code = "";
    for (let i = 1; i <= n; i++) code += `${i} | ${model.getLineContent(i)}\n`;

    const data = await onAnnotate(code);
    if (!showHintsRef.current) return;
    const lineToMessage = data?.line_number_to_comment ?? {};
    if (!Object.keys(lineToMessage).length) return;
    applyHints(editor, monaco, lineToMessage);
  }, [editorRef, monacoRef, onAnnotate, applyHints]);

  return (
    <div
      className={`editor flex flex-col relative w-full min-h-0 ${
        showHints ? "" : "hints-off"
      }`}
      style={{ borderRadius: ".5rem", position: "relative" }}
    >
      <Editor
        language="python"
        theme="vs-dark"
        onMount={(editor, monaco) => {
          injectMonacoDecorationStyles();
          editorRef.current = editor;
          monacoRef.current = monaco;

          editor.onMouseMove((e: any) => {
            if (!showHints) return;
            const position = e.target.position;
            if (!position) return;
            const model = editor.getModel();
            const showOrHide = (map: Map<string, any>) => {
              map.forEach((w: any, decoId: string) => {
                const range = model?.getDecorationRange(decoId);
                if (range && range.startLineNumber === position.lineNumber)
                  w.showAt(position);
                else w.hide();
              });
            };
            showOrHide(hintWidgetByDeco.current);
            showOrHide(errorWidgetByDeco.current);
          });

          onMountExtras?.(editor, monaco);
        }}
        options={{ minimap: { enabled: false } }}
        defaultValue={
          "def countComponents(n: int, edges: List[List[int]]) -> int:\n\treturn 0"
        }
      />

      <EditorUtilities
        onAnnotate={handleAnnotate}
        showHints={showHints}
        setShowHints={setShowHints}
        clearHints={() => editorRef.current && clearAll(editorRef.current)}
        timer={{ running, seconds, start, stop, reset }}
        editorRef={editorRef}
      />
    </div>
  );
}
